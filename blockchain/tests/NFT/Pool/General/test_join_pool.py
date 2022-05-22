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
    pool_contract.createPool(fish_contract, 0, 3, 'Scales', 'SCLS', 9, 27, {
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

    # allow the contract to manage WETH balance
    WETH10[-1].approve(pool_contract, 1, {'from': accounts[1]})

    # join the pool
    pool_contract.joinPool(0, 1, {'from': accounts[1]})

    # make sure the participant has been added to the data contract
    assert data_contract.getParticipantCount(0) == 1
    assert data_contract.poolIdToParticipants(0, 0) == (0, accounts[1], 1, 0)


# check allowance and data contract will be checked in other tests
