import pytest
import brownie
from web3 import Web3
from brownie import BahiaNFTPool, BahiaNFTPoolData, Fish, WETH10, accounts, BahiaNFTPool_LR, StrategyStandardSaleForFixedPrice, TransferManagerERC721
from scripts.NFT.Pool.General.helpful_scripts import deploy


# deploy and create a pool every time
@pytest.fixture(autouse=True)
def setup_pool():
    # deploy the contracts
    deploy()

    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool[-1]

    # mint an NFT to the user
    fish_contract.safeMint(1, {'from': accounts[1]})

    # create a pool from an account
    pool_contract.createPool(fish_contract, 0, 3, 9, {
                             'from': accounts[1]})


# test joining a fake pool
def test_join_fake_pool():
    pool_contract = BahiaNFTPool[-1]

    # pool should not exist
    with brownie.reverts():
        pool_contract.joinPool(1, 1, {'from': accounts[1]})


# test joining a pool
def test_join_pool():
    pool_contract = BahiaNFTPool[-1]
    data_contract = BahiaNFTPoolData[-1]
    contribution = Web3.toWei(0.5, "ether")

    # join the pool
    for i in range(1,5):
           # allow the contract to manage WETH balance
        WETH10[-1].approve(pool_contract, contribution, {'from': accounts[i]})
        pool_contract.joinPool(0, contribution, {'from': accounts[i]})

        # make sure the participant has been added to the data contract
        assert data_contract.getNumberOfParticipants(0) == i
        assert data_contract.poolIdToParticipants(0, i) == (i, accounts[i], contribution, 0)


# test joining a pool
def test_join_pool_twice():
    pool_contract = BahiaNFTPool[-1]
    data_contract = BahiaNFTPoolData[-1]
    contribution = Web3.toWei(0.5, "ether")


    # allow the contract to manage WETH balance
    WETH10[-1].approve(pool_contract, contribution, {'from': accounts[3]})
    pool_contract.joinPool(0, contribution, {'from': accounts[3]})

    print(f"{data_contract.addressToParticipantId(0, accounts[3])}")
    print(f"{data_contract.getNumberOfParticipants(0)}")

    # Can't join pool twice...
    with brownie.reverts():
       pool_contract.joinPool(0, contribution, {'from': accounts[3]})


# check allowance and data contract will be checked in other tests
