// ABIs para MultiVault y MultiVaultFactory

const MULTIVAULT_FACTORY_ABI = [
  "function createVault(string memory _name, address[] memory _members) external returns (address vaultAddress)",
  "function getAllVaults() external view returns (address[] memory)",
  "function getUserVaults(address _user) external view returns (address[] memory)",
  "function getTotalVaults() external view returns (uint256)",
  "function isValidVault(address _vault) external view returns (bool)",
  "function getVaultInfo(address _vaultAddress) external view returns (string memory name, address[] memory members, uint256 balance, uint256 proposalCounter)",
  "function getVaultsByRange(uint256 _start, uint256 _end) external view returns (address[] memory)",
  "function getUserVaultCount(address _user) external view returns (uint256)",
  "event VaultCreated(address indexed vaultAddress, string name, address[] members, address indexed creator, uint256 timestamp)",
];

const MULTIVAULT_ABI = [
  "function name() external view returns (string memory)",
  "function factory() external view returns (address)",
  "function members(uint256) external view returns (address)",
  "function isMember(address) external view returns (bool)",
  "function proposalCounter() external view returns (uint256)",
  "function deposit() external payable",
  "function proposeWithdrawal(string memory _description, address payable _recipient, uint256 _amount) external returns (uint256)",
  "function proposeAddMember(string memory _description, address _newMember) external returns (uint256)",
  "function vote(uint256 _proposalId, bool _inFavor) external",
  "function getVaultInfo() external view returns (string memory _name, address[] memory _members, uint256 balance, uint256 _proposalCounter)",
  "function getProposalInfo(uint256 _proposalId) external view returns (uint256 id, uint8 proposalType, address proposer, string memory description, address recipient, uint256 amount, address newMember, uint256 votesFor, uint256 votesAgainst, uint8 status)",
  "function hasVoted(uint256 _proposalId, address _voter) external view returns (bool)",
  "function getMembers() external view returns (address[] memory)",
  "function getMemberCount() external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
  "event DepositMade(address indexed depositor, uint256 amount)",
  "event ProposalCreated(uint256 indexed proposalId, uint8 proposalType, address proposer)",
  "event VoteCasted(uint256 indexed proposalId, address indexed voter, bool inFavor)",
  "event ProposalExecuted(uint256 indexed proposalId)",
  "event ProposalRejected(uint256 indexed proposalId)",
  "event MemberAdded(address indexed newMember)",
  "event WithdrawalExecuted(address indexed recipient, uint256 amount)",
];

module.exports = {
  MULTIVAULT_FACTORY_ABI,
  MULTIVAULT_ABI,
};
