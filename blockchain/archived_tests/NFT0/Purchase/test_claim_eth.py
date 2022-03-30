import pytest
import brownie
from brownie import BahiaNFTPurchase, NFTPurchase, accounts, interface, chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_purchase_deposit_assets
from scripts.accounts import get_admin_account


# test a non-buyer trying to claim the nft
def test_non_buyer_claim_nft():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # try to claim the eth with the buyer
    with brownie.reverts():
        purchase_contract.claimETH({'from': buyer})

    with brownie.reverts():
        purchase_contract.claimETH({'from': accounts[3]})


# test a non-paid contract
def test_non_paid():
    # make the contract, buyer, and seller
    purchase_contract, buyer, seller = deploy_and_create()

    # put in the asset from the seller
    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # move the nft to another contract with the seller
    nft_contract.safeTransferFrom(
        seller, accounts[3], purchase_contract.nftId(), {'from': seller})

    # try for the buyer to take out the asset without paying
    with brownie.reverts():
        purchase_contract.claimETH({'from': seller})


# test an expired contract
def test_expired():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # sleep until the contract expires
    chain.sleep(4)

    # try to claim the nft after expiration
    with brownie.reverts():
        purchase_contract.claimETH({'from': seller})


# test a contract with no nft (even though it is paid)
def test_no_nft():
    # make the contract, buyer, and seller
    purchase_contract, buyer, seller = deploy_and_create()

    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # let the buyer pput in eth
    purchase_contract.depositETH(
        {'from': buyer, 'value': purchase_contract.cost()})

    # try to claim the nft before depositing it
    with brownie.reverts():
        purchase_contract.claimETH({'from': seller})


# successful transfer
def test_claim_eth():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # get the dev account
    dev = get_admin_account()

    # keep the bahia contract for dev royalty
    bahia_contract = BahiaNFTPurchase[-1]

    # save the sellers old balance
    old_seller_balance = seller.balance()
    old_dev_balance = dev.balance()

    # try to claim the nft with the seller
    purchase_contract.claimETH({'from': seller})

    # get the dev payment
    dev_payment = (bahia_contract.devRoyalty() *
                   purchase_contract.cost() / 100000)

    # make sure the seller's balance increased by the cost
    assert seller.balance() == (old_seller_balance +
                                purchase_contract.cost() - dev_payment)

    # make sure the devs got paid
    assert dev.balance() == (old_dev_balance + dev_payment)
