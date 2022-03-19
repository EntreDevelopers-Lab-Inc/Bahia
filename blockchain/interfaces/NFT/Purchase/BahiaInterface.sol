// SPDX-License-Identifier: MIT

/**
 * @title bahia data interface
*/

pragma solidity ^0.8.4;

interface BahiaNFTPurchaseInterface
{
    struct NFTPurchaseEntry {
        address buyerAddress;
        address sellerAddress;
        uint256 expirationTime;
        address collectionAddress;
        uint256 nftId;
        uint256 cost;
    }
}

interface BahiaInvoiceDataInterface is BahiaInvoiceInterface
{
    // ability to view the public addresses
    function devAddress() external view returns (address);
    function devRoyalty() external view returns (uint256);
}
