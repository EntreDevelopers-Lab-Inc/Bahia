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
error NotPaid();
error Expired();
error NotExpired();
error NoNFT();
error NotOwner();
error NotBuyer();
error NotSeller();

// contract that creates the  escrow for each transaction --> call them milestones
contract NFTPurchase is
    ERC721Holder,
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

    // need to see if transfer is initiated
    bool public transferInitiated;

    // keep track of buyer, seller addresses
    address public buyerAddress;
    address public sellerAddress;

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
        if (tx.origin != buyerAddress) revert NotBuyer();
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
        // only allow if paid, not expired, and contains NFT
        if (!transferInitiated)
        {
            if (!isPaid()) revert NotPaid();
            if (isExpired()) revert Expired();
            if (!receivedNFT()) revert NoNFT();
        }

        _;
    }

    /**
     * @notice a function to see if the contract is expired
    */
    function isExpired() public view returns (bool)
    {
        if (transferInitiated)
        {
            return false;
        }
        else
        {
            return (block.timestamp > expirationTime);
        }
    }

    /**
     * @notice a function to see if the contract has been paid
    */
    function isPaid() public view returns (bool)
    {
        if (transferInitiated)
        {
            return true;
        }
        else
        {
            return (address(this).balance >= cost);
        }
    }

    /**
     * @notice a function to check if the nft is in the contract
    */
    function receivedNFT() public view returns (bool)
    {
        if (transferInitiated)
        {
            return true;
        }
        else
        {
            // check if the owner of the NFT is this address
            return (nftManager.ownerOf(nftId) == address(this));
        }
    }

    /**
     * @notice a function to deposit the nft --> caller will be the owner --> no need to worry about setting approvals
    */
    function depositNFT() external onlySeller nonReentrant
    {
        // make sure that the seller is still the owner
        if (nftManager.ownerOf(nftId) != sellerAddress) revert NotOwner();

        // transfer the nft
        nftManager.safeTransferFrom(sellerAddress, address(this), nftId);
    }

    /**
     * @notice a function to deposit funds for the nft purchase
    */
    function depositETH() external payable onlyBuyer nonReentrant
    {
        // check that the deposit is the correct amount
        if (msg.value < cost) revert InsufficientFunds();
    }

    /**
     * @notice a function for the buyer to receive the nft
    */
    function claimNFT() external onlyBuyer transferrable nonReentrant
    {
        // now that the nft is transferrable, transfer it out of this wallet
        nftManager.safeTransferFrom(address(this), buyerAddress, nftId);

        // mark the transfer as initiated, as this is the case
        transferInitiated = true;
    }

    /**
     * @notice a function for the seller to claim the eth
    */
    function claimETH() external onlySeller transferrable nonReentrant
    {
        // refund the excess to the buyer
        _refundExcess();

        // pay the devs
        _payDevs();

        // pay the seller the remaining amount
        sellerAddress.call{value: address(this).balance}("");

        // initiate the transfer
        transferInitiated = true;
    }

    /**
     * @notice a function for the buyer to reclaim the eth after it is expired
    */
    function reclaimETH() external onlyBuyer nonReentrant
    {
        if (!isExpired()) revert NotExpired();
        if (!isPaid()) revert NotPaid();

        // pay the devs
        _payDevs();

        // since it is expired, refund the buyer everything
        buyerAddress.call{value: address(this).balance}("");
    }

    /**
     * @notice a function for the seller to reclaim the nft after it is expired
    */
    function reclaimNFT() external onlySeller nonReentrant
    {
        if (!isExpired()) revert NotExpired();
        if (!receivedNFT()) revert NoNFT();

        // transfer the nft back to the seller
        nftManager.safeTransferFrom(address(this), sellerAddress, nftId);
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

        bahia.devAddress().call{value: devPayment}("");

        return devPayment;
    }

}
