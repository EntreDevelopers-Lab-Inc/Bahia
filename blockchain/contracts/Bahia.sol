// SPDX-License-Identifier: MIT

/**
 * @title bahia base contract
*/

pragma solidity ^0.8.4;

error NotDev();
error NotAllowed();
error NotUser();

contract Bahia
{
    address public devAddress;
    uint256 public devRoyalty;  // out of 100,000

    // allow certain contracts
    mapping(address => bool) internal allowedContracts;

    constructor (uint256 devRoyalty_)
    {
        // set the dev royalty
        devRoyalty = devRoyalty_;

        // set the dev address to that in the constructor
        devAddress = msg.sender;
    }

    /**
     * @notice a modifier to mark functions that only the dev can touch
    */
    modifier onlyDev()
    {
        if (tx.origin != devAddress) revert NotDev();
        _;
    }

    /**
     * @notice a modifier that only allowed contracts can access
    */
    modifier onlyAllowed()
    {
        if (!allowedContracts[msg.sender]) revert NotAllowed();
        _;
    }

    /**
     * @notice a modifier that requires that the user isn't a smart contract
    */
    modifier callerIsUser()
    {
        if (msg.sender != tx.origin) revert NotUser();

        _;
    }

    /**
     * @notice allow the devs to change their address
     * @param devAddress_ for the new dev address
    */
    function changeDevAddress(address devAddress_) external onlyDev
    {
        devAddress = devAddress_;
    }

    /**
     * @notice allow the devs to change their royalty
     * @param devRoyalty_ for the new royalty
    */
    function changeDevRoyalty(uint256 devRoyalty_) external onlyDev
    {
        devRoyalty = devRoyalty_;
    }

    /**
     * @notice a function to set the allowed permission
     * @param address_ for the address to set the permission of
     * @param permission_ for the permission setting
    */
    function setAllowedPermission(address address_, bool permission_) external onlyAllowed
    {
        allowedContracts[address_] = permission_;
    }
}
