// SPDX-License-Identifier: MIT

/**
 * @title bahia nft purchase contract
*/

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Purchase/BahiaNFTPurchaseInterface.sol";
import "../../Bahia.sol";
import "./NFTPurchase.sol";


contract BahiaNFTPurchase is
    Bahia,
    BahiaNFTPurchaseInterface
{
    // track all purchases
    address[] public transactions;

    // track each buyer
    mapping(address => uint256[]) public purchases;

    // track each seller
    mapping(address => uint256[]) public sales;

    // backtrack the constructor
    constructor(uint256 devRoyalty_) Bahia(devRoyalty_) {}

    /**
     * @notice a function to create a new transaction
     * @param buyerAddress to determine the buyer
     * @param sellerAddress to determine the sellet
     * @param expirationTime to set when the contract expires
     * @param collectionAddress to determine the nft collection
     * @param nftId to determine which nft is going to be traded
     * @param cost to determine how much to pay for the nft
    */
    function createTransaction(uint256 expirationTime, address collectionAddress, uint256 nftId, uint256 cost, address buyerAddress, address sellerAddress) external
    {
        // add the new nft purchase to the mapping (use the transactions array length)
        sales[sellerAddress].push(transactions.length);

        address newPurchaseAddress = address(new NFTPurchase(
            transactions.length,
            expirationTime,
            collectionAddress,
            nftId,
            cost,
            buyerAddress,
            sellerAddress,
            address(this)
            ));

        // create a new nft purchase
        transactions.push(newPurchaseAddress);

        // add the nft purchase to the allowed list
        allowedContracts[newPurchaseAddress] = true;

    }

    /**
     * @notice count the purchases for frontend iteration
     * @param address_ to locate the address for which we are tracking purchases
    */
    function purchaseCount(address address_) external view returns (uint256)
    {
        return purchases[address_].length;
    }

    /**
     * @notice count the sales for frontend iteration
     * @param address_ to locate the address for which we are tracking sales
    */
    function saleCount(address address_) external view returns (uint256)
    {
        return sales[address_].length;
    }

    /**
     * @notice a function to add a sale to the mapping
     * @param buyerAddress for who bought it
     * @param purchaseId for the purchase to be linked
    */
    function addPurchase(address buyerAddress, uint256 purchaseId) external onlyAllowed
    {
        // add the purchase to the buyer's list (in the mapping)
        purchases[buyerAddress].push(purchaseId);
    }

}
