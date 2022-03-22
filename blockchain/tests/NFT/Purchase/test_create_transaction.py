import brownie
from brownie import BahiaNFTPurchase, Fish, NFTPurchase, accounts, Wei
from scripts.NFT.Purchase.helpful_scripts import deploy
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY
import time
import random


# test deploying the contract
def test_create_transaction():
    # deploy the contracts
    deploy()

    # get the nft purchase contract
    bahia_contract = BahiaNFTPurchase[-1]
    fish_contract = Fish[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # give the seller an nft
    fish_contract.safeMint({'from': seller})

    # set up the transaction
    exp_time = time.time() + 100
    nft_id = 0  # the first nft in the collection

    cost = Wei("1 ether")

    # create one transaction that lasts for 100 seconds
    bahia_contract.createTransaction(
        exp_time, Fish[-1].address, nft_id, cost, buyer, seller)

    # check if the transaction list has incremented correctly
    purchase_id = 0
    purchase_contract_address = bahia_contract.transactions(purchase_id)

    # check the mappings
    assert bahia_contract.purchases(buyer, 0) == 0
    assert bahia_contract.sales(seller, 0) == 0

    # check mapping lengths
    assert bahia_contract.purchaseCount(buyer) == 1
    assert bahia_contract.saleCount(seller) == 1
    assert bahia_contract.purchaseCount(seller) == 0
    assert bahia_contract.saleCount(buyer) == 0

    # get an nft purchase
    purchase_contract = NFTPurchase.at(
        purchase_contract_address)

    # check that there actually exists some new nft purchase with the address specified, and it has all of the correct data assigned to it
    assert purchase_contract.purchaseId() == purchase_id
    assert purchase_contract.expirationTime() == exp_time
    assert purchase_contract.nftId() == nft_id
    assert purchase_contract.cost() == cost
    assert purchase_contract.buyerAddress() == buyer
    assert purchase_contract.sellerAddress() == seller


# test creating a transaction with a non-owner
def test_create_false_transaction():
    # deploy the contracts
    deploy()

    # get the nft purchase contract
    bahia_contract = BahiaNFTPurchase[-1]
    fish_contract = Fish[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # give the seller an nft
    fish_contract.safeMint({'from': seller})

    # set up the transaction
    exp_time = time.time() + 100
    nft_id = 0  # the first nft in the collection

    cost = Wei("1 ether")

    # create a transaction with the reversed roles
    with brownie.reverts():
        bahia_contract.createTransaction(
            exp_time, Fish[-1].address, nft_id, cost, seller, buyer)
