// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./BahiaNFTPool.sol";
import "./reference/Interfaces/ILooksRareExchange.sol";
import {OrderTypes} from "./reference/libraries/OrderTypes.sol";

error FailedLooksTransfer();

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
    function buyNow(uint256 poolId, OrderTypes.TakerOrder calldata takerAsk, OrderTypes.MakerOrder calldata makerBid) external whenNotPaused callerIsUser
    {
        // pool storage variable
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        // calculate total price including fees
        uint256 totalPrice = takerAsk.price + (takerAsk.price * devRoyalty / 100000);

        // set the end purchase price (this is the accessible weth)
        pool.endPurchasePrice = _collectWETH(poolId, totalPrice);

        // allow looksrare to take the amount from this contract
        weth.approve(address(looksrare), takerAsk.price);

        // call matchBidWithTakerAsk
        looksrare.matchBidWithTakerAsk(takerAsk, makerBid);

        // pay the devs
        _createVault(pool);
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
}
