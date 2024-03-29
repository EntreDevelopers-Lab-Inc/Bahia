import brownie
from brownie import BahiaNFTPurchase2, Fish, accounts, Wei
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
    bahia_contract = BahiaNFTPurchase2[-1]
    fish_contract = Fish[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # give the seller an nft
    fish_contract.safeMint(1, {'from': seller})

    # set up the transaction
    exp_time = time.time() + 100
    nft_id = 0  # the first nft in the collection

    cost = Wei("1 ether")

    # create one transaction that lasts for 100 seconds
    bahia_contract.createTransaction(
        exp_time, Fish[-1].address, nft_id, cost, buyer, {'from': seller})

    # check if the transaction list has incremented correctly
    purchase_id = 0
    purchase_contract_address = bahia_contract.transactions(purchase_id)

    # check the mappings
    assert bahia_contract.sales(seller, 0) == 0

    # check mapping lengths
    assert bahia_contract.saleCount(seller) == 1
    assert bahia_contract.purchaseCount(seller) == 0

    # get an nft purchase
    purchase = bahia_contract.transactions(0)

    # check that there actually exists some new nft purchase with the address specified, and it has all of the correct data assigned to it
    assert purchase[0] == purchase_id
    assert purchase[1] == exp_time
    assert purchase[2] == nft_id
    assert purchase[3] == cost
    assert purchase[4] == buyer
    assert purchase[5] == seller
    assert purchase[6] is False


# test deploying the contract with no buyer
def test_create_transaction_with_blank_buyer():
    # deploy the contracts
    deploy()

    # get the nft purchase contract
    bahia_contract = BahiaNFTPurchase2[-1]
    fish_contract = Fish[-1]

    # get the buyer and seller
    seller = accounts[2]

    # give the seller an nft
    fish_contract.safeMint(1, {'from': seller})

    # set up the transaction
    exp_time = time.time() + 100
    nft_id = 0  # the first nft in the collection

    cost = Wei("1 ether")

    # create one transaction with a blank address
    blank_buyer_addr = '0x0000000000000000000000000000000000000000'
    bahia_contract.createTransaction(
        exp_time, Fish[-1].address, nft_id, cost, brownie.convert.to_address(blank_buyer_addr), {'from': seller})

    # check if the transaction list has incremented correctly
    purchase_id = 0
    purchase_contract_address = bahia_contract.transactions(purchase_id)

    # check the mappings
    assert bahia_contract.sales(seller, 0) == 0

    # check mapping lengths
    assert bahia_contract.saleCount(seller) == 1
    assert bahia_contract.purchaseCount(seller) == 0

    # get an nft purchase
    purchase = bahia_contract.transactions(0)

    # check that there actually exists some new nft purchase with the address specified, and it has all of the correct data assigned to it
    assert purchase[0] == purchase_id
    assert purchase[1] == exp_time
    assert purchase[2] == nft_id
    assert purchase[3] == cost
    assert purchase[4] == blank_buyer_addr
    assert purchase[5] == seller
    assert purchase[6] is False


# test creating a transaction with a non-owner
def test_create_false_transaction():
    # deploy the contracts
    deploy()

    # get the nft purchase contract
    bahia_contract = BahiaNFTPurchase2[-1]
    fish_contract = Fish[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # give the seller an nft
    fish_contract.safeMint(1, {'from': seller})

    # set up the transaction
    exp_time = time.time() + 100
    nft_id = 0  # the first nft in the collection

    cost = Wei("1 ether")

    # create a faulty transaction from a buyer
    with brownie.reverts():
        bahia_contract.createTransaction(
            exp_time, Fish[-1].address, nft_id, cost, buyer, {'from': buyer})
