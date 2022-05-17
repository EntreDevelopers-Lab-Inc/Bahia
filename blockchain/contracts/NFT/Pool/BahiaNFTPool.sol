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
error FailedWETHTransfer();
error NoPoolFound();
error NoParticipantFound();
error ContributionNotAllowed();
error PoolCompleted();
error PoolIncomplete();
error NotParticipant();
error InsufficientFunds();
error NoShares();

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
    function createPool(address collection_, uint256 nftId_, uint256 approvalPercent_, uint256 maxContributions_, string memory shareName_, string memory shareSymbol_, uint256 shareSupply_, uint256 startListPrice_) external whenNotPaused
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
                shareSupply: shareSupply_,
                startListPrice: startListPrice_,
                creator: msg.sender,
                completed: false,
                endPurchasePrice: 0,
                vaultId: 0
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
        BahiaNFTPoolTypes.Participant memory participant = _safeParticipant(poolId, participantId);

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
    function buyNow(uint256 poolId, uint256 minPercentageToAsk, OrderTypes.TakerOrder calldata takerAsk, OrderTypes.MakerOrder calldata makerBid) external whenNotPaused nonReentrant
    {
        // pool storage variable
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        // get the participant count
        uint256 participantCount = poolData.getParticipantCount(poolId);

        // have a participant data member to which to store data
        BahiaNFTPoolTypes.Participant memory participant;

        // internally count the amount of WETH that the contract has access to
        uint256 accessibleWETH;

        // calculate total price including fees
        uint256 totalPrice = takerAsk.price + (takerAsk.price * devRoyalty / 100000);

        // boolean to track success of transfer
        bool success;

        // iterate over all the addresses in the pool
        for (uint256 i = 0; (i < participantCount)  || (accessibleWETH >= totalPrice); i += 1)
        {
            // get the participant (got participant count from contract, no need to check it)
            participant = poolData.getParticipant(poolId, i);

            // check if the participant is contributing at all (cheaper if you check iteratively)
            if (participant.contribution > 0)
            {
                // check if the amount allowed matches the contribution
                if (weth.allowance(participant.participantAddress, address(this)) >= participant.contribution)
                {
                    // set the paid amount to the minimum
                    participant.paid = _min(participant.contribution, (totalPrice - accessibleWETH));

                    // push payment update to data contract (no neeed to check success, as we got the participant from the contract)
                    poolData.setParticipant(poolId, participant);

                    // add the paid amount to the accessible weth
                    accessibleWETH += participant.paid;

                    // collect weth from the participant up to their contribution OR taker order (this is optimal if we guarantee that the contract has enough WETH to buy it --> check off-chain)
                    success = weth.transferFrom(participant.participantAddress, address(this), participant.paid);

                }
            }
        }

        // if the accessible weth is less than the bid, revert
        if (accessibleWETH < takerAsk.price) revert InsufficientFunds();

        // set the end purchase price
        pool.endPurchasePrice = accessibleWETH;

        // allow looksrare to take the amount from this contract
        weth.approve(address(looksrare), accessibleWETH);

        // call matchBidWithTakerAsk
        looksrare.matchBidWithTakerAsk(takerAsk, makerBid);

        // pay the devs
        weth.transfer(devAddress, accessibleWETH * (devRoyalty / 100000));

        // now that the contract has the NFT, allow the fractional art vault factory to interact with it
        IERC721(pool.collection).approve(address(fractionalArt), pool.nftId);

        // create a vault & fractionalize (assuming all ERC20 tokens mint to this contract)
        pool.vaultId = fractionalArt.mint(pool.shareName, pool.shareSymbol, pool.collection, pool.nftId, pool.shareSupply, pool.startListPrice, 0);  // no curator fee

        // push the pool to the data contract
        poolData.updatePool(pool);
    }

    // function to claim the fractionalized shares (anyone can call, allowing people to lead pooling and airdrop shares)
    function claimShares(uint256 poolId, uint256 participantId) external whenNotPaused nonReentrant
    {
        // get the pool (used to get the end purchase price and completion information)
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        // revert if not completed
        if (!pool.completed) revert PoolIncomplete();

        // get the participant
        BahiaNFTPoolTypes.Participant memory participant = _safeParticipant(poolId, participantId);

        // revert if paid is 0 (for BOTH participants that were not needed to fund AND participants that have already collected their share)
        if (participant.paid == 0) revert NoShares();

        // mark that the shares have been distributed by setting paid to 0
        participant.paid = 0;

        // upload the participant to the data contract
        poolData.setParticipant(poolId, participant);

        // distribute these fractionalized shares
        IERC20 sharesContract = IERC20(fractionalArt.vaults(pool.vaultId));
        sharesContract.transfer(participant.participantAddress, (pool.shareSupply * participant.paid / pool.endPurchasePrice));
    }

    // get a pool safely
    function _safePool(uint256 poolId) internal returns (BahiaNFTPoolTypes.Pool memory)
    {
        BahiaNFTPoolTypes.Pool memory pool = poolData.getPool(poolId);

        // if there is no pool, revert
        if (pool.maxContributions == 0) revert NoPoolFound();

        // else, just return the pool
        return pool;
    }

    // get a participant safely
    function _safeParticipant(uint256 poolId, uint256 participantId) internal returns (BahiaNFTPoolTypes.Participant memory)
    {
        BahiaNFTPoolTypes.Participant memory participant = poolData.getParticipant(poolId, participantId);

        // make sure there is a real participant
        if (participant.participantAddress == address(0)) revert NoParticipantFound();

        // if it passes checks, return the participant
        return participant;
    }

    // function to check the allowance
    function _checkAllowance(uint256 contribution) internal
    {
        if (weth.allowance(msg.sender, address(this)) <= contribution) revert ContributionNotAllowed();
    }

    // function to calculate minimums
    function _min(uint256 a, uint256 b) internal returns (uint256)
    {
        return a <= b ? a : b;
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

    // some function for withdrawing all weth from contract to owner (unlikely to use, as contract does not store weth)
    function withdrawWETH() external onlyOwner nonReentrant
    {
        // get the balance
        uint256 balance = weth.balanceOf(address(this));

        // transfer the entire balance
        bool sent = weth.transfer(address(this), balance);

        // revert if the transfer was unsuccessful
        if (!sent) revert FailedWETHTransfer();
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
