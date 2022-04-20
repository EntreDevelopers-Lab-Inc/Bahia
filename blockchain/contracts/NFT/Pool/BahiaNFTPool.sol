// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import {BahiaNFTPoolTypes} from "../../../contracts/NFT/Pool/libraries/BahiaNFTPoolTypes.sol";
import "../../Bahia.sol";
import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";
import "../../../interfaces/NFT/Pool/ILooksRareExchange.sol";
import "../../../interfaces/NFT/Pool/IFractionalArt.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error FailedLooksTransfer();
error NoPoolFound();
error ContributionNotAllowed();
error PoolCompleted();

contract BahiaNFTPool is
    Bahia,
    ERC721Holder,
    ReentrancyGuard,
    Ownable,
    Pausable
{
    // events

    // keep track of the data
    IBahiaNFTPoolData poolData;

    // interfaces to use
    ILooksRareExchange looksrare;
    IFractionalArt fractionalArt;

    // keep ERC20 handlers for the important currencies
    IERC20 weth;
    IERC20 looks;

    // constructor
    constructor(uint256 devRoyalty_, address dataAddress_, address looksRareContract_, address fractionalArtContract_, address WETHaddress_, address looksAddress_) Bahia(devRoyalty_)
    {
        // connect to the data contract
        poolData = IBahiaNFTPoolData(dataAddress_);

        // bind each contract
        looksrare = ILooksRareExchange(looksRareContract_);
        fractionalArt = IFractionalArt(fractionalArtContract_);

        // bind the tokens
        weth = IERC20(WETHaddress_);
        looks = IERC20(looksAddress_);

    }

    // function to create a pool with limited inputs (don't want user to have full control and create false creators, completion, etc.)
    function createPool(address collection_, uint256 nftId_, uint256 approvalPercent_, uint256 maxContributions_, string memory shareName_, string memory shareSymbol_, uint256 startListPrice_) external whenNotPaused
    {
        // create a new pool
        BahiaNFTPoolTypes.Pool memory newPool = BahiaNFTPoolTypes.Pool({
                poolId: poolData.getPoolCount(),
                collection: collection_,
                nftId: nftId_,
                approvalPercent: approvalPercent_,
                maxContributions: maxContributions_,
                shareName: shareName_,
                shareSymbol: shareSymbol_,
                startListPrice: startListPrice_,
                creator: msg.sender,
                completed: false,
                endPurchasePrice: 0
            });

        // add the pool to the data contract
        poolData.addPool(newPool);
    }

    // a function to add a participant to a particular pool
    function joinPool(uint256 poolId, uint256 contribution) external whenNotPaused
    {
        // get the actual pool
        BahiaNFTPoolTypes.Pool memory pool = poolData.getPool(poolId);

        // if there is no creator, the pool doesn't exists
        if (pool.creator == address(0)) revert NoPoolFound();

        // if the pool has been completed, it cannot be joined
        if (pool.completed) revert PoolCompleted();

        // make sure that the contract is allowed to spend the contribution (stops people from joining without the intention of paying --> creates excess gas for the user if they want to execute a trade)
        if (weth.allowance(msg.sender, address(this)) <= contribution) revert ContributionNotAllowed();

        // create a participant
        BahiaNFTPoolTypes.Participant memory newParticipant = BahiaNFTPoolTypes.Participant({
                participantId: poolData.getParticipantCount(poolId),
                participantAddress: msg.sender,
                contribution: contribution,
                paid: 0  // hasn't paid anything yet
            });

        // add the participant to the pool if this all passes
        poolData.addParticipant(poolId, newParticipant);
    }

    // some function for withdrawing all looks from contract to owner
    function withdrawLooks() external onlyOwner
    {
        // get the balance
        uint256 balance = looks.balanceOf(address(this));

        // transfer the entire balance
        bool sent = looks.transfer(address(this), balance);

        // revert if the transfer was unsuccessful
        if (!sent) revert FailedLooksTransfer();
    }

    // function to pause the contract
    function setPause(bool pauseValue) external onlyOwner
    {
        if (pauseValue)
        {
            _pause();
        }
        else
        {
            _unpause();
        }
    }
}
