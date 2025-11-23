// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MultiVault {
    enum ProposalType {
        WITHDRAWAL,
        ADD_MEMBER
    }

    enum ProposalStatus {
        PENDING,
        EXECUTED,
        REJECTED
    }

    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        address proposer;
        string description;
        // Para retiros
        address payable recipient;
        uint256 amount;
        // Para agregar miembros
        address newMember;
        // Votación
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        ProposalStatus status;
        uint256 createdAt;
    }

    string public name;
    address public factory;
    address[] public members;
    mapping(address => bool) public isMember;
    uint256 public proposalCounter;
    mapping(uint256 => Proposal) public proposals;

    event DepositMade(address indexed depositor, uint256 amount);
    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalType proposalType,
        address proposer
    );
    event VoteCasted(
        uint256 indexed proposalId,
        address indexed voter,
        bool inFavor
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalRejected(uint256 indexed proposalId);
    event MemberAdded(address indexed newMember);
    event WithdrawalExecuted(address indexed recipient, uint256 amount);

    modifier onlyMember() {
        require(isMember[msg.sender], "Not a member of this vault");
        _;
    }

    modifier validProposal(uint256 _proposalId) {
        require(
            proposals[_proposalId].status == ProposalStatus.PENDING,
            "Proposal is not pending"
        );
        _;
    }

    constructor(string memory _name, address[] memory _members) {
        require(_members.length >= 2, "At least 2 members required");
        require(bytes(_name).length > 0, "Name cannot be empty");

        name = _name;
        factory = msg.sender;

        // Agregar miembros iniciales
        for (uint256 i = 0; i < _members.length; i++) {
            require(_members[i] != address(0), "Invalid address");
            require(!isMember[_members[i]], "Duplicate member");

            members.push(_members[i]);
            isMember[_members[i]] = true;
        }
    }

    function deposit() external payable onlyMember {
        require(msg.value > 0, "Must deposit more than 0");
        emit DepositMade(msg.sender, msg.value);
    }

    function proposeWithdrawal(
        string memory _description,
        address payable _recipient,
        uint256 _amount
    ) external onlyMember returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _amount <= address(this).balance,
            "Insufficient funds in vault"
        );
        require(_recipient != address(0), "Invalid recipient address");
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint256 proposalId = proposalCounter++;
        Proposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.proposalType = ProposalType.WITHDRAWAL;
        newProposal.proposer = msg.sender;
        newProposal.description = _description;
        newProposal.recipient = _recipient;
        newProposal.amount = _amount;
        newProposal.status = ProposalStatus.PENDING;
        newProposal.createdAt = block.timestamp;

        emit ProposalCreated(proposalId, ProposalType.WITHDRAWAL, msg.sender);
        return proposalId;
    }

    function proposeAddMember(
        string memory _description,
        address _newMember
    ) external onlyMember returns (uint256) {
        require(_newMember != address(0), "Invalid address");
        require(!isMember[_newMember], "Already a member of the vault");
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint256 proposalId = proposalCounter++;
        Proposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.proposalType = ProposalType.ADD_MEMBER;
        newProposal.proposer = msg.sender;
        newProposal.description = _description;
        newProposal.newMember = _newMember;
        newProposal.status = ProposalStatus.PENDING;
        newProposal.createdAt = block.timestamp;

        emit ProposalCreated(proposalId, ProposalType.ADD_MEMBER, msg.sender);
        return proposalId;
    }

    function vote(
        uint256 _proposalId,
        bool _inFavor
    ) external validProposal(_proposalId) onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        require(
            !proposal.hasVoted[msg.sender],
            "Already voted on this proposal"
        );

        proposal.hasVoted[msg.sender] = true;

        if (_inFavor) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit VoteCasted(_proposalId, msg.sender, _inFavor);

        // Verificar si se alcanzó el quorum
        _checkAndExecuteProposal(_proposalId);
    }

    function _checkAndExecuteProposal(uint256 _proposalId) private {
        Proposal storage proposal = proposals[_proposalId];

        uint256 totalMembers = members.length;
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;

        // Mayoría simple: más del 50% de votos a favor
        uint256 requiredVotes = (totalMembers / 2) + 1;

        if (proposal.votesFor >= requiredVotes) {
            // Ejecutar propuesta
            proposal.status = ProposalStatus.EXECUTED;

            if (proposal.proposalType == ProposalType.WITHDRAWAL) {
                _executeWithdrawal(_proposalId);
            } else if (proposal.proposalType == ProposalType.ADD_MEMBER) {
                _executeAddMember(_proposalId);
            }

            emit ProposalExecuted(_proposalId);
        } else if (
            totalVotes == totalMembers && proposal.votesFor < requiredVotes
        ) {
            // Todos votaron pero no se alcanzó la mayoría
            proposal.status = ProposalStatus.REJECTED;
            emit ProposalRejected(_proposalId);
        }
    }

    function _executeWithdrawal(uint256 _proposalId) private {
        Proposal storage proposal = proposals[_proposalId];

        require(address(this).balance >= proposal.amount, "Insufficient funds");

        proposal.recipient.transfer(proposal.amount);

        emit WithdrawalExecuted(proposal.recipient, proposal.amount);
    }

    function _executeAddMember(uint256 _proposalId) private {
        Proposal storage proposal = proposals[_proposalId];

        members.push(proposal.newMember);
        isMember[proposal.newMember] = true;

        emit MemberAdded(proposal.newMember);
    }

    function getVaultInfo()
        external
        view
        returns (
            string memory _name,
            address[] memory _members,
            uint256 balance,
            uint256 _proposalCounter
        )
    {
        return (name, members, address(this).balance, proposalCounter);
    }

    function getProposalInfo(
        uint256 _proposalId
    )
        external
        view
        returns (
            uint256 id,
            ProposalType proposalType,
            address proposer,
            string memory description,
            address recipient,
            uint256 amount,
            address newMember,
            uint256 votesFor,
            uint256 votesAgainst,
            ProposalStatus status
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.proposalType,
            proposal.proposer,
            proposal.description,
            proposal.recipient,
            proposal.amount,
            proposal.newMember,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.status
        );
    }

    function hasVoted(
        uint256 _proposalId,
        address _voter
    ) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    function getMembers() external view returns (address[] memory) {
        return members;
    }

    function getMemberCount() external view returns (uint256) {
        return members.length;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Función receive para aceptar transferencias directas de ETH
    receive() external payable {
        emit DepositMade(msg.sender, msg.value);
    }
}
