from brownie import chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_purchase_deposit_assets


# test not received
def test_not_received():
    purchase_contract, buyer, seller = deploy_and_create()

    assert purchase_contract.receivedNFT() == False


# test received
def test_received():
    # just create the transaction
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # all assets are deposited
    assert purchase_contract.receivedNFT() == True


# test seller transfer initiated
def test_seller_transfer_initiated():
    # deploy and purchase
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # have the seller take the eth out
    purchase_contract.claimETH({'from': seller})

    # the contract should be received
    assert purchase_contract.receivedNFT() == True


# test buyer transfer initiated
def test_buyer_transfer_initiated():
    # deploy and purchase
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # have the seller take the eth out
    purchase_contract.claimNFT({'from': buyer})

    # the contract should be received
    assert purchase_contract.receivedNFT() == True
