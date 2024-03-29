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
    // events
    event NFTPurchaseCreated(uint256 expirationTime, address collectionAddress, uint256 nftId, uint256 cost, address buyerAddress, address newPurchaseAddress);

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
     * @param expirationTime to set when the contract expires
     * @param collectionAddress to determine the nft collection
     * @param nftId to determine which nft is going to be traded
     * @param cost to determine how much to pay for the nft
     * @param buyerAddress to determine the buyer
    */
    function createTransaction(uint256 expirationTime, address collectionAddress, uint256 nftId, uint256 cost, address buyerAddress) external
    {
        // add the new nft purchase to the mapping (use the transactions array length)
        sales[msg.sender].push(transactions.length);

        if ((buyerAddress) != address(0))
        {
            sales[buyerAddress].push(transactions.length);
        }

        address newPurchaseAddress = address(new NFTPurchase(
            transactions.length,
            expirationTime,
            collectionAddress,
            nftId,
            cost,
            buyerAddress,
            msg.sender,  // use the message sender as the seller
            address(this)
            ));

        // create a new nft purchase
        transactions.push(newPurchaseAddress);

        // add the nft purchase to the allowed list
        allowedContracts[newPurchaseAddress] = true;

        // emit that a contract was created
        emit NFTPurchaseCreated(expirationTime, collectionAddress, nftId, cost, buyerAddress, newPurchaseAddress);

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
     * @notice a function to return the amount of total transactions
    */
    function totalTransactions() external view returns (uint256)
    {
        return transactions.length;
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
