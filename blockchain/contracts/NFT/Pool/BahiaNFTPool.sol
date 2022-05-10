// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import {BahiaNFTPoolTypes} from "../../../contracts/NFT/Pool/libraries/BahiaNFTPoolTypes.sol";
import "../../Bahia.sol";
import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";
import "../../../interfaces/NFT/Pool/ILooksRareExchange.sol";
import {OrderTypes} from "../../../contracts/NFT/Pool/libraries/OrderTypes.sol";
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
error NoParticipantFound();
error ContributionNotAllowed();
error PoolCompleted();
error NotParticipant();

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
        _checkAllowance(contribution);

        // create a participant
        BahiaNFTPoolTypes.Participant memory newParticipant = BahiaNFTPoolTypes.Participant({
                participantId: poolData.getParticipantCount(poolId),
                participantAddress: msg.sender,
                contribution: contribution,
                paid: 0  // hasn't paid anything yet
            });

        // add the participant to the pool if this all passes
        bool participantAdded = poolData.addParticipant(poolId, newParticipant);

        if (!participantAdded) revert NoPoolFound();
    }

    // function to set the contribution
    function setContribution(uint256 poolId, uint256 participantId, uint256 newContribution) external whenNotPaused
    {
        // get the participant
        BahiaNFTPoolTypes.Participant memory participant = poolData.getParticipant(poolId, participantId);

        // make sure there is a real participant
        if (participant.participantAddress == address(0)) revert NoParticipantFound();

        // revert if the participant's address does not match
        if (participant.participantAddress != msg.sender) revert NotParticipant();

        // ensure that the balance is at least the contribution
        _checkAllowance(newContribution);

        // set the contribution if it passes the above constraints
        bool contributionSet = poolData.setContribution(poolId, participant.participantId, newContribution);

        // revert if the contribution could not be found
        if (!contributionSet) revert NoPoolFound();
    }

    // execute the transaction (no need to check, the pool has been pre-approved)
    // going to need more inputs (see order types in purchase contract)
    function buyNow(uint256 poolId, uint256 minPercentageToAsk, OrderTypes.TakerOrder calldata takerBid, OrderTypes.MakerOrder calldata makerAsk) external whenNotPaused nonReentrant
    {
        // iterate over all the addresses in the pool
            // collect all the weth from the addresses up to the taker order
            // set the contribution (the amount collected)

        // allow looksrare to take the amount from this contract

        // call matchBidWithTakerAsk

        // now that the contract has the NFT, fractionalize it (call mint from contract --> )

    }

    // function to claim the fractionalized shares
    function claimShares(uint256 poolId, uint256 participantId) external whenNotPaused nonReentrant
    {
        // get the pool (used to get the end purchase price and completion information)

        // revert if not completed

        // get the participant

        // revert if paid is 0 (for BOTH participants that were not needed to fund AND participants that have already collected their share)

        // distribute these fractionalized shares
    }

    // function to check the allowance
    function _checkAllowance(uint256 contribution) internal
    {
        if (weth.allowance(msg.sender, address(this)) <= contribution) revert ContributionNotAllowed();
    }

    // some function for withdrawing all looks from contract to owner
    function withdrawLooks() external onlyOwner nonReentrant
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
