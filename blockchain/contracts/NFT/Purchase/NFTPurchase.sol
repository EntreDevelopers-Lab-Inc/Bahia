// SPDX-License-Identifier: MIT

/**
 * @title milestone contract for Bahia
*/

pragma solidity ^0.8.4;

import "../../interfaces/NFT/Purchase/BahiaInterface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/IERC721.sol";


// contract that creates the  escrow for each transaction --> call them milestones
contract NFTPurchase is
    ReentrancyGuard
{
    // keep the id of the purchase, so this backlinks to the NFTPurchasePlatform
    uint256 public purchaseId;

    // have an expiration time
    uint256 public expirationTime;

    // keep track of the NFT is
    uint256 public nftId;

    // keep track of the cost (in gwei)
    uint256 public cost;

    // keep track of buyer, seller addresses
    address buyerAddress;
    address sellerAddress;

    // keep track of the nft data
    IERC721 public nftManager;

    // initialize with the name, value, and bahia address (don't want to be able to create escrows without invoices, as that would make it impossible to get payment data)
    constructor (uint256 purchaseId_, uint256 expirationTime_, address collectionAddress_, uint256 nftId_, uint256 cost_, address buyerAddress_, address sellerAddress_/*, address bahiaAddress_*/)
    {
        // set up the contract
        purchaseId = purchaseId_;
        expirationTime = expirationTime_;
        nftManager = IERC721(collectionAddress_);
        nftId = nftId_;
        cost = cost_;
        buyerAddress = buyerAddress_;
        sellerAddress = sellerAddress_;

        // set the backref to the contract using the bahia address
        // bahia = BahiaInvoiceDataInterface(bahiaAddress_);
    }

    /**
     * @notice a modifier that checks that the calling address is the buyer
    */
    modifier onlyBuyer()
    {
        if (tx.origin != buyerAddress) revert NotBuyer();
    }

    /**
     * @notice a modifier that checks that the calling address is the seller
    */
    modifier onlySeller()
    {
        if (tx.origin != sellerAddress) revert NotBuyer();
    }

    /**
     * @notice a function to see if the contract is expired
    */
    function isExpired() external view returns (bool)
    {
        return (block.timestamp > expirationTime);
    }

    /**
     * @notice a function to see if the contract has been paid
    */
    function isPaid() external view returns (bool)
    {
        return (address(this).balance >= cost)
    }

    /**
     * @notice a function to check if the nft is in the contract
    */
    function containsNFT() external view returns (bool)
    {
        // check if the owner of the NFT is this address
        return (nftManager.ownerOf(nftId) == address(this));
    }

    /**
     * @notice a function to deposit funds for the nft purchase
    */
    function deposit() external payable onlyBuyer
    {
        // only the buyer should be able to purchase this --> require that the buyer call it
    }

    /**
     * @notice function to pay the devs
    */
    function _payDevs() internal returns (uint256)
    {
        uint256 devPayment = value * bahia.devRoyalty() / 100000;

        bahia.invoices(invoiceId).token.transfer(bahia.devAddress(), devPayment);

        return devPayment;
    }

}
