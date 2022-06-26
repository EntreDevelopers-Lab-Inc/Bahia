import pytest
import brownie
from web3 import Web3
from brownie import BahiaNFTPool, BahiaNFTPoolData, Fish, WETH10, accounts
from scripts.accounts import get_admin_account
from scripts.NFT.Pool.General.helpful_scripts import deploy

CONTRIBUTION = Web3.toWei(0.5, "ether")

# deploy and create a pool every time
@pytest.fixture(autouse=True)
def setup_fish():
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
                             
    WETH10[-1].approve(pool_contract, CONTRIBUTION, {'from': accounts[1]})
    pool_contract.joinPool(0, CONTRIBUTION, {"from": accounts[1]})

def test_pause():
    admin_account = get_admin_account()
    pool_contract = BahiaNFTPool[-1]
    fish_contract = Fish[-1]

    with brownie.reverts():
        pool_contract.setPause(True, {"from": accounts[9]}) 

    pool_contract.setPause(True, {"from": admin_account})

    with brownie.reverts():
       # create a pool from an account
        pool_contract.createPool(fish_contract, 0, 3, 9, {
                             'from': accounts[1]}) 
    

    WETH10[-1].approve(pool_contract, CONTRIBUTION, {'from': accounts[3]})

    with brownie.reverts():
        pool_contract.joinPool(0, CONTRIBUTION, {'from': accounts[3]})
    
    with brownie.reverts():
        pool_contract.setContribution(0, 0, CONTRIBUTION/2, {"from": accounts[1]})
    

    # All functions should be able to execute now...
    pool_contract.setPause(False, {"from:": admin_account})
    pool_contract.createPool(fish_contract, 0, 3, 9, {
                             'from': accounts[1]})
    pool_contract.joinPool(0, CONTRIBUTION, {'from': accounts[3]}) 
    pool_contract.setContribution(0, 0, CONTRIBUTION/2, {"from": accounts[1]}) 
