from scripts.accounts import *
import pytest
import brownie
from web3 import Web3
from brownie import BahiaNFTPoolData

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
]

# ***************
# ALL TESTS IN test_setters.py are SEQUENTIAL
# scope == "module" rather than "fn_isolation"
# ***************


@pytest.fixture(scope="module", autouse=True)
def deploy_contracts():
    admin_account = get_admin_account()
    data_contract = BahiaNFTPoolData.deploy({"from": admin_account})


def test_add_pool():
    admin_account = get_admin_account()
    other_account = get_dev_account()
    data_contract = BahiaNFTPoolData[-1]

    # Admin account should be able to addPool
    data_contract.addPool(BLANK_POOL, {"from": admin_account})

    # other_account shouldn't be able to addPool...
    # Does not have permissions
    with brownie.reverts():
        data_contract.addPool(BLANK_POOL, {"from": other_account})

    # admin_account shouldn't be able to add another pool with same id

    assert data_contract.getPoolCount() == 1
    assert data_contract.getPool(0) == BLANK_POOL

    other_pool = BLANK_POOL
    other_pool[0] == 1
    data_contract.addPool(other_pool, {"from": admin_account})

    assert data_contract.getPoolCount() == 2

# Pool should be added from test_add_pool()...


def test_update_pool():
    data_contract = BahiaNFTPoolData[-1]
    assert data_contract.getPoolCount() == 2
    assert data_contract.getPool(0) == BLANK_POOL

    admin_account = get_admin_account()
    other_account = get_dev_account()

<<<<<<< HEAD
    #Create new pool with the same ID...
    new_pool = [
        0, # poolId
        "0x0000000000000000000000000000000000000000", # collection address
        1, # nftId
        1, # maxContributions
        "test", # shareName
        "test", # shareSymbol
        1, # shareSupply
        1, # shareListPrice
        "0x0000000000000000000000000000000000000000", # creator address
        False, # completed bool
        1, # endPurchasePrice
        1, #vaultId
    ]
=======
    # Create new pool with the same ID...
    new_pool = (
        0,  # poolId
        "0x0000000000000000000000000000000000000000",  # collection address
        1,  # nftId
        1,  # maxContributions
        1,  # shareSupply
        "0x0000000000000000000000000000000000000000",  # creator address
        False,  # completed bool
        1,  # endPurchasePrice
        1,  # vaultId
    )
>>>>>>> pool

    data_contract.updatePool(new_pool, {"from": admin_account})

    # Cannot update_pool from other_account
    with brownie.reverts():
        data_contract.updatePool(new_pool, {"from": other_account})

    assert data_contract.getPool(0) == new_pool

<<<<<<< HEAD
    # Reset the pool_id to 5
    # ***
    new_pool[0] = 5
    # ***

    # Cannot update a pool that doesn't exist...
    with brownie.reverts():
        data_contract.updatePool(new_pool, {"from": admin_account})
=======
>>>>>>> pool

def test_get_pool():
    data_contract = BahiaNFTPoolData[-1]

    data_contract.getPool(0)

    # Try to query non-existent pool
    with brownie.reverts():
        data_contract.getPool(10)

    # Pools should be indexed @ 0, meaning that getPoolCount should be 1 below the total supply
    pool_count = data_contract.getPoolCount()
    with brownie.reverts():
        data_contract.getPool(pool_count)


def test_add_participants():
    data_contract = BahiaNFTPoolData[-1]
    admin_account = get_admin_account()
    other_account = get_dev_account()
    #     struct Participant {
    #     uint256 participantId;  // self-aware
    #     address participantAddress;
    #     uint256 contribution;  // this will be set to allow the user to manage their contribution to the pool
    #     uint256 paid;  // logs how much of the contribution purchase price has been paid
    # }

    assert data_contract.updatePool(BLANK_POOL, {"from": admin_account})
    pool_id = 0

    participants = [
        [0, "0x0000000000000000000000000000000000000000", 0, 0],
        [1, "0x0000000000000000000000000000000000000000", 0, 0],
        [2, "0x0000000000000000000000000000000000000000", 0, 0]
    ]

    # Pool must exist to add participant...
    with brownie.reverts():
        data_contract.addParticipant(
            5, participants[0], {"from": admin_account})

    # Can't add participants from non-permissioned account
    with brownie.reverts():
        data_contract.addParticipant(pool_id, participants[0], {
                                     "from": other_account})

    # Can't add participants out of order...
    with brownie.reverts():
        data_contract.addParticipant(pool_id, participants[1], {
                                     "from": admin_account})

    data_contract.addParticipant(pool_id, participants[0], {
                                 "from": admin_account})

    # Again, can't add participants out of order...
    with brownie.reverts():
        data_contract.addParticipant(pool_id, participants[2], {
                                     "from": admin_account})

    data_contract.addParticipant(pool_id, participants[1], {
                                 "from": admin_account})
    data_contract.addParticipant(pool_id, participants[2], {
                                 "from": admin_account})

    for i in range(3):
        assert data_contract.getParticipant(0, i) == participants[i]

    assert data_contract.getParticipantCount(0) == 3


# Number of participants should be 3 from prior tests...

def test_set_participant():
    data_contract = BahiaNFTPoolData[-1]
    admin_account = get_admin_account()
    other_account = get_dev_account()
    pool_id = 0

    assert data_contract.getParticipantCount(0) == 3

    new_participant_zero = [0, admin_account, 1000, 100]

    # Pool must exist to set participant...
    with brownie.reverts():
        data_contract.setParticipant(5, new_participant_zero, {
                                     "from": admin_account})

    data_contract.setParticipant(pool_id, new_participant_zero, {
                                 "from": admin_account})
    assert data_contract.getParticipant(pool_id, 0) == new_participant_zero


def test_set_contribution():
    data_contract = BahiaNFTPoolData[-1]
    admin_account = get_admin_account()
    other_account = get_dev_account()
    pool_id = 0
    participant_id = 0
    contribution = Web3.toWei(0.05, "ether")

    # Admin account is not participant...
    with brownie.reverts():
<<<<<<< HEAD
        data_contract.setContribution(pool_id, 1, contribution, {"from": admin_account})
    
    # Pool doesn't exist...
    with brownie.reverts():
        data_contract.setContribution(5, participant_id, contribution, {"from": admin_account})
    
    # Other_account cannot setContribution...
    with brownie.reverts():
        data_contract.setContribution(pool_id, participant_id, contribution, {"from": other_account})

    # Cannot set contribution for participant that doesn't exist...
    with brownie.reverts():
        data_contract.setContribution(pool_id, 10, contribution, {"from": admin_account})

    data_contract.setContribution(pool_id, participant_id, contribution, {"from": admin_account})
=======
        data_contract.setContribution(
            pool_id, 1, contribution, {"from": admin_account})

    # Pool doesn't exist
    with brownie.reverts():
        data_contract.setContribution(
            5, participant_id, contribution, {"from": other_account})

    data_contract.setContribution(
        pool_id, participant_id, contribution, {"from": admin_account})

    assert data_contract.getParticipant(pool_id, participant_id)[
        2] == contribution
>>>>>>> pool


def test_set_allowed_permission():
    data_contract = BahiaNFTPoolData[-1]
    other_account = get_dev_account()
    admin_account = get_admin_account()

    with brownie.reverts():
        data_contract.setAllowedPermission(
            admin_account, False, {"from": other_account})

    data_contract.setAllowedPermission(
        admin_account, False, {"from": admin_account})
