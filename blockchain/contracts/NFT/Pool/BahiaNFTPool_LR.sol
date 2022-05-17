// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./BahiaNFTPool.sol";
import "../../../interfaces/NFT/Pool/ILooksRareExchange.sol";
import {OrderTypes} from "../../../contracts/NFT/Pool/libraries/OrderTypes.sol";

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
    function buyNow(uint256 poolId, uint256 minPercentageToAsk, OrderTypes.TakerOrder calldata takerAsk, OrderTypes.MakerOrder calldata makerBid) external whenNotPaused nonReentrant
    {
        // pool storage variable
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        // calculate total price including fees
        uint256 totalPrice = takerAsk.price + (takerAsk.price * devRoyalty / 100000);

        // get the accessible weth
        uint256 accessibleWETH = _collectWETH(poolId, totalPrice);

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
