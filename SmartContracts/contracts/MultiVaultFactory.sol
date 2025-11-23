// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MultiVault.sol";

contract MultiVaultFactory {
    address[] public allVaults;
    mapping(address => address[]) public userVaults;
    mapping(address => bool) public isVault;

    event VaultCreated(
        address indexed vaultAddress,
        string name,
        address[] members,
        address indexed creator,
        uint256 timestamp
    );

    function createVault(
        string memory _name,
        address[] memory _members
    ) external returns (address vaultAddress) {
        require(_members.length >= 2, "At least 2 members required");
        require(bytes(_name).length > 0, "Name cannot be empty");

        bool creatorIncluded = false;
        for (uint256 i = 0; i < _members.length; i++) {
            if (_members[i] == msg.sender) {
                creatorIncluded = true;
                break;
            }
        }
        require(creatorIncluded, "Creator must be in the members list");

        MultiVault newVault = new MultiVault(_name, _members);
        vaultAddress = address(newVault);

        allVaults.push(vaultAddress);
        isVault[vaultAddress] = true;

        for (uint256 i = 0; i < _members.length; i++) {
            userVaults[_members[i]].push(vaultAddress);
        }

        emit VaultCreated(
            vaultAddress,
            _name,
            _members,
            msg.sender,
            block.timestamp
        );

        return vaultAddress;
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function getUserVaults(
        address _user
    ) external view returns (address[] memory) {
        return userVaults[_user];
    }

    function getTotalVaults() external view returns (uint256) {
        return allVaults.length;
    }

    function isValidVault(address _vault) external view returns (bool) {
        return isVault[_vault];
    }

    function getVaultInfo(
        address _vaultAddress
    )
        external
        view
        returns (
            string memory name,
            address[] memory members,
            uint256 balance,
            uint256 proposalCounter
        )
    {
        require(isVault[_vaultAddress], "Not a valid vault");
        MultiVault vault = MultiVault(payable(_vaultAddress));
        return vault.getVaultInfo();
    }

    function getVaultsByRange(
        uint256 _start,
        uint256 _end
    ) external view returns (address[] memory) {
        require(_start < _end, "Invalid range");
        require(_end <= allVaults.length, "End out of range");

        uint256 length = _end - _start;
        address[] memory vaultsInRange = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            vaultsInRange[i] = allVaults[_start + i];
        }

        return vaultsInRange;
    }

    function getUserVaultCount(address _user) external view returns (uint256) {
        return userVaults[_user].length;
    }
}
