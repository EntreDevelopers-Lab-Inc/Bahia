// SPDX-License-Identifier: MIT

/**
 * @title bahia nft interface
*/

pragma solidity ^0.8.12;

interface BahiaNFTPurchaseInterface
{
    // create a new nft uint256
    function createTransaction(uint256, address, uint256, uint256, address, address) external;
}

interface BahiaNFTPurchaseDataInterface is BahiaNFTPurchaseInterface
{
    // ability to view the public addresses
    function devAddress() external view returns (address);
    function devRoyalty() external view returns (uint256);
}
