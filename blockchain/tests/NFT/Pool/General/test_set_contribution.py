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


# set the contribution of the participant

# test safe participant, check allowance somewhere else
