// SPDX-License-Identifier: MIT

/**
 * @title milestone contract for Bahia
*/

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Purchase/BahiaNFTPurchaseInterface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";


error InsufficientFunds();
error ExceesReimbursementFailed();
error Expired();
error NFTNotApproved();
error NotOwner();
error NotBuyer();
error NotSeller();
error Completed();

// contract that creates the  escrow for each transaction --> call them milestones
contract NFTPurchase is
    ReentrancyGuard,
    ERC721Holder
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
    address public buyerAddress;
    address public sellerAddress;

    // keep track of whether or not this have been completed
    bool public completed;

    // keep track of the nft data
    IERC721 public nftManager;

    // keep track of the purchase data interface
    BahiaNFTPurchaseDataInterface bahia;

    // initialize with the name, value, and bahia address (don't want to be able to create escrows without invoices, as that would make it impossible to get payment data)
    constructor (uint256 purchaseId_, uint256 expirationTime_, address collectionAddress_, uint256 nftId_, uint256 cost_, address buyerAddress_, address sellerAddress_, address bahiaAddress_)
    {
        // set up the contract
        purchaseId = purchaseId_;
        expirationTime = expirationTime_;
        nftManager = IERC721(collectionAddress_);
        nftId = nftId_;
        cost = cost_;
        buyerAddress = buyerAddress_;
        sellerAddress = sellerAddress_;

        // check if the seller owns the nft
        if (nftManager.ownerOf(nftId) != sellerAddress) revert NotOwner();

        // set the backref to the contract using the bahia address
        bahia = BahiaNFTPurchaseDataInterface(bahiaAddress_);
    }

    /**
     * @notice a modifier that checks that the calling address is the buyer
    */
    modifier onlyBuyer()
    {
        if ((tx.origin != buyerAddress) && (buyerAddress != address(0))) revert NotBuyer();
        _;
    }

    /**
     * @notice a modifier that checks that the calling address is the seller
    */
    modifier onlySeller()
    {
        if (tx.origin != sellerAddress) revert NotSeller();
        _;
    }

    /**
     * @notice a modifier to check transferrability
    */
    modifier transferrable()
    {
        // only allow if it contains NFT, is not expired, and is not completed
        if (isExpired()) revert Expired();
        if (nftManager.getApproved(nftId) != address(this)) revert NFTNotApproved();
        if (nftManager.ownerOf(nftId) != sellerAddress) revert NotOwner();
        if (completed) revert Completed();

        _;
    }

    /**
     * @notice a function to see if the contract is expired
    */
    function isExpired() public view returns (bool)
    {
        return (block.timestamp > expirationTime);
    }

    /**
     * @notice a function for the buyer to receive the nft
    */
    function buy() external payable onlyBuyer nonReentrant
    {
        // cannot be expired  (other iterms will be checked in safe transfer)
        if (isExpired()) revert Expired();

        // cannot be completed
        if (completed) revert Completed();

        // now that the nft is transferrable, transfer it out of this wallet (will check other require statements)
        nftManager.safeTransferFrom(sellerAddress, msg.sender, nftId);

        // make sure that the message value exceeds the cost
        _refundExcess();

        // pay the devs
        _payDevs();

        // pay the seller the remainder
        _paySeller();

        // add the purchase to the parent contract
        bahia.addPurchase(msg.sender, purchaseId);

        // set completed to true
        completed = true;

    }

    /**
     * @notice a setter function for the cost
     * @param cost_ for the new cost
    */
    function setCost(uint256 cost_) external onlySeller transferrable
    {
        cost = cost_;
    }

    /**
     * @notice a setter function for the buyerAddress
     * @param buyerAddress_ for setting the buyer
    */
    function setBuyer(address buyerAddress_) external onlySeller transferrable
    {
        buyerAddress = buyerAddress_;
    }

    /**
     * @notice refund the rest of the funds if too many
    */
    function _refundExcess() internal
    {
        // if the msg value is too much, refund it
        if (address(this).balance > cost)
        {
            // refund the buyer the excess
            (bool sent, ) = buyerAddress.call{value: address(this).balance - cost}("");
            if (!sent) revert ExceesReimbursementFailed();
        }
    }

    /**
     * @notice function to pay the devs
    */
    function _payDevs() internal returns (uint256)
    {
        uint256 devPayment = cost * bahia.devRoyalty() / 100000;

        (bool sent, ) = bahia.devAddress().call{value: devPayment}("");
        if (!sent) revert InsufficientFunds();

        return devPayment;
    }

    /**
     * @notice a function to pay the seller
    */
    function _paySeller() internal
    {
        (bool sent, ) = sellerAddress.call{value: address(this).balance}("");
        if (!sent) revert InsufficientFunds();
    }

}
