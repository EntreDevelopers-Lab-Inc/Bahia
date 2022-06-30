import pytest
import brownie
from brownie import BahiaNFTPool, BahiaNFTPoolData, Fish, WETH10, accounts
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

    # allow the contract to manage WETH balance
    WETH10[-1].approve(pool_contract, 2, {'from': accounts[1]})

    # join the pool
    pool_contract.joinPool(0, 2, {'from': accounts[1]})


# set the contribution of the participant that ISN'T the caller
def test_set_contribution_false_caller():
    pool_contract = BahiaNFTPool[-1]

    # try setting account 1's contribution to 1
    with brownie.reverts():
        pool_contract.setContribution(0, 1, 1, {'from': accounts[2]})


# set the contribution of a real pool and a fake pool
def test_set_contribution():
    pool_contract = BahiaNFTPool[-1]

    print(BahiaNFTPoolData[-1].poolIdToParticipants(0, 0))

    # try setting account 1's contribution to 1
    pool_contract.setContribution(0, 1, 1, {'from': accounts[1]})


# set the contribution of a real pool and a fake pool
def test_set_contribution_fake_pool():
    pool_contract = BahiaNFTPool[-1]

    # try setting account 1's contribution to 1 of a FAKE pool
    with brownie.reverts():
        pool_contract.setContribution(1, 1, 1, {'from': accounts[1]})


# test safe participant, check allowance somewhere else
