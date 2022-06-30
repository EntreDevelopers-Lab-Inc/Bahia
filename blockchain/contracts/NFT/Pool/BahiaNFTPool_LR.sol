// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./BahiaNFTPool.sol";
import "./reference/Interfaces/ILooksRareExchange.sol";
import {OrderTypes} from "./reference/libraries/OrderTypes.sol";

error FailedLooksTransfer();
error PriceTooHigh();

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

    // execute the transaction (no need to check, the pool has been pre-approved)
    // going to need more inputs (see order types in purchase contract)
    // execute the transaction (no need to check, the pool has been pre-approved)
    function buyNow(uint256 poolId, OrderTypes.MakerOrder calldata makerAsk, uint256 minPercentageToAsk, bytes calldata params) external whenNotPaused callerIsUser
    {
        // pool storage variable
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);


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
