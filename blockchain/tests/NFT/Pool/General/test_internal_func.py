import pytest
import brownie
from web3 import Web3
from brownie import BahiaNFTPool, BahiaNFTPoolData, Fish, WETH10, accounts
from scripts.accounts import get_admin_account
from scripts.NFT.Pool.General.helpful_scripts import deploy

BLANK_POOL = [
    0,  # poolId
    "0x0000000000000000000000000000000000000000",  # collection address
    0,  # nftId
    0,  # maxContributions
    0,  # shareSupply
    "0x0000000000000000000000000000000000000000",  # creator address
    False,  # completed bool
    0,  # endPurchasePrice
    0,  # vaultId
    0, # count
    ]

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

# *** 
# Using pool_contract.joinPool() to test internal function _safePool() and _checkAllowance()
# ***
def test_safe_pool():
    pool_contract = BahiaNFTPool[-1]

    # dataContract.getPool() should revert the tx since poolId < _currentIndex
    with brownie.reverts():
        pool_contract.joinPool(1, 1, {'from': accounts[1]})
    
    # Adding pool where the creator address == address(0)
    data_contract = BahiaNFTPoolData[-1]
    admin_account = get_admin_account()
    data_contract.addPool(BLANK_POOL, {'from': admin_account})

    # tx should revert since pool.creator == address(0)
    with brownie.reverts():
        pool_contract.joinPool(1, 1, {'from': accounts[1]})

def test_check_allowance():
    pool_contract = BahiaNFTPool[-1] 
    contribution = Web3.toWei(0.5, "ether")

    # Case 1: user tries to join pool without contribution any WETH
    with brownie.reverts():
        pool_contract.joinPool(0, contribution, {'from': accounts[1]})

    # Case 2: user tries to join pool with a contribution higher than their approvals
    WETH10[-1].approve(pool_contract, Web3.toWei(0.25, "ether"), {'from': accounts[1]})
   
    with brownie.reverts():
        pool_contract.joinPool(0, contribution, {'from': accounts[1]}) 
    
    # Ensure that prior behavior was correct by joining pool 
    pool_contract.joinPool(0, Web3.toWei(0.25, "ether"), {'from': accounts[1]} )
    
# ***
# Using pool_contract.setContribution to test internal function _safeParticipant()
# ***
# def test_safe_participant():
#     pool_contract = BahiaNFTPool[-1] 
#     data_contract = BahiaNFTPoolData[-1]
#     contribution = Web3.toWei(0.25, "ether")

#     # No one should have joined the pool, meaning that _safeParticipant() should revert the tx
#     # _safeParticipant will revert given the list should be empty
#     with brownie.reverts():
#         pool_contract.setContribution(0, 0, contribution)
    
#     null_account = "0x0000000000000000000000000000000000000000"
    
#     # allow the contract to manage WETH balance
#     WETH10[-1].approve(pool_contract, contribution, {'from': null_account})

#     # join the pool
#     pool_contract.joinPool(0, contribution, {'from': null_account})

#     # make sure the participant has been added to the data contract
#     assert data_contract.getParticipantCount(0) == 1
    
#     # Address(0) should be in the pool now...
#     pool_contract.setContribution()




