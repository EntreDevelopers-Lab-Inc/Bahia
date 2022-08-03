// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./BahiaNFTPool.sol";
import "./reference/Interfaces/ILooksRareExchange.sol";
import {OrderTypes} from "./reference/libraries/OrderTypes.sol";

error FailedLooksTransfer();
error PriceTooHigh();
error IncorrectMakerAsk();

contract BahiaNFTPool_LR is
    BahiaNFTPool
{   

    // events

    // interfaces to use
    ILooksRareExchange looksrare;

    // keep ERC20 handlers for the important currencies
    IERC20 looks;

    // constructor
    constructor(uint256 devRoyalty_, address dataAddress_, address fractionalArtContract_, address WETHaddress_, address looksRareContract_, address looksAddress_) BahiaNFTPool(devRoyalty_, dataAddress_,fractionalArtContract_, WETHaddress_)
    {
        // bind to looksrare
        looksrare = ILooksRareExchange(looksRareContract_);

        // keep track of looks
        looks = IERC20(looksAddress_);
    }


        // function to collect weth
    function _collectWETH(uint256 poolId, uint256 totalPrice) internal returns (uint256)
    {
        // get the next participant id, which should be 1 + number of participants
        uint256 nextParticipantId = poolData.getNextParticipantId(poolId);(poolId);

        // have a participant data member to which to store data
        BahiaNFTPoolTypes.Participant memory participant;

        // internally count the amount of WETH that the contract has access to
        uint256 accessibleWETH;

        // iterate over all the addresses in the pool
        // participantIds should always start @ 1...
        for (uint256 i = 1; (i < nextParticipantId) && (accessibleWETH <= totalPrice);)
        {
            // get the participant 
            participant = poolData.getParticipant(poolId, i);

            // check if the participant is contributing at all (cheaper if you check iteratively)
            if (participant.contribution > 0)
            {
                // check if the amount allowed matches the contribution, and that the participant can spend that much
                if ((weth.allowance(participant.participantAddress, address(this)) >= participant.contribution) && (weth.balanceOf(participant.participantAddress) >= participant.contribution))
                {
                    // set the paid amount to the minimum
                    participant.paid = _min(participant.contribution, (totalPrice - accessibleWETH));

                    // push payment update to data contract (no neeed to check success, as we got the participant from the contract)
                    poolData.setParticipant(poolId, participant);

                    // add the paid amount to the accessible weth
                    accessibleWETH += participant.paid;

                    // collect weth from the participant up to their contribution OR taker order (this is optimal if we guarantee that the contract has enough WETH to buy it --> check off-chain)
                    bool success = weth.transferFrom(participant.participantAddress, address(this), participant.paid);

                    if (!success) revert FailedWETHTransfer();
                }
            }
            
            unchecked{ i++; }
        }

        // if the accessible weth is less than the bid, revert
        if (accessibleWETH < totalPrice) revert InsufficientFunds();

        // return the weth that was transferred
        return accessibleWETH;
    }

    // execute the transaction (no need to check, the pool has been pre-approved)
    // going to need more inputs (see order types in purchase contract)
    // execute the transaction (no need to check, the pool has been pre-approved)

    /**
     @notice function to buy the targeted NFT of a Pool from LooksRare
     */
    function buyNow(uint256 poolId, OrderTypes.MakerOrder calldata makerAsk, uint256 minPercentageToAsk, bytes calldata params) external whenNotPaused callerIsUser
    {
        // pool storage variable
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        if ((pool.collection != makerAsk.collection) || (pool.nftId != makerAsk.tokenId)) revert IncorrectMakerAsk();

        // calculate total price including fees
        uint256 totalPrice = makerAsk.price + (makerAsk.price * devRoyalty / 100000);

        // make sure the price is less than the max set by the pool creator (want to do this in buy now, as the pool has already been saved to memory)
        if (totalPrice > pool.maxContributions) revert PriceTooHigh();

        // set the end purchase price (this is the accessible weth)
        pool.endPurchasePrice = _collectWETH(poolId, totalPrice);

        // allow looksrare to take the amount from this contract
        weth.approve(address(looksrare), makerAsk.price);

        // make the order (everything else has succeeded)
        OrderTypes.TakerOrder memory takerBid = OrderTypes.TakerOrder({
            isOrderAsk: false,
            taker: address(this),
            price: makerAsk.price,
            tokenId: pool.nftId,
            minPercentageToAsk: minPercentageToAsk,
            params: params
            });

        // call matchBidWithMakerAsk
        looksrare.matchAskWithTakerBid(takerBid, makerAsk);

        // pay the devs, create a vault
        _createVault(pool);
    }

       // some function for withdrawing all weth from contract to owner (unlikely to use, as contract does not store weth)
    function withdrawWETH() external onlyOwner nonReentrant
    {
        // get the balance
        uint256 balance = weth.balanceOf(address(this));

        // transfer the entire balance
        bool sent = weth.transfer(msg.sender, balance);

        // revert if the transfer was unsuccessful
        if (!sent) revert FailedWETHTransfer();
    }
 

    // some function for withdrawing all looks from contract to owner
    function withdrawLooks() external onlyOwner nonReentrant
    {
        // get the balance
        uint256 balance = looks.balanceOf(address(this));

        // transfer the entire balance
        bool sent = looks.transfer(msg.sender, balance);

        // revert if the transfer was unsuccessful
        if (!sent) revert FailedLooksTransfer();
    }
}
