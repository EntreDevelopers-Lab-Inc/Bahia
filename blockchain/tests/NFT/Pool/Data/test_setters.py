from scripts.accounts import *
import pytest
import brownie
from web3 import Web3
from brownie import BahiaNFTPoolData

POOL = [
    0,  # poolId
    "0x0000000000000000000000000000000000000001",  # collection address
    0,  # nftId
    0,  # maxContributions
    0,  # shareSupply
    "0x0000000000000000000000000000000000000002",  # creator address
        False,  # completed bool
        0,  # endPurchasePrice
        0,  # vaultId
        1, # count... *** Always must start @ 1
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
    data_contract.addPool(POOL, {"from": admin_account})

    # other_account shouldn't be able to addPool...
    # Does not have permissions
    with brownie.reverts():
        data_contract.addPool(POOL, {"from": other_account})

    # admin_account shouldn't be able to add another pool with same id

    assert data_contract.getPoolCount() == 1
    assert data_contract.getPool(0) == POOL

    other_pool = POOL
    other_pool[0] == 1
    data_contract.addPool(other_pool, {"from": admin_account})

    assert data_contract.getPoolCount() == 2

# Pool should be added from test_add_pool()...


def test_update_pool():
    data_contract = BahiaNFTPoolData[-1]
    assert data_contract.getPoolCount() == 2
    assert data_contract.getPool(0) == POOL

    admin_account = get_admin_account()
    other_account = get_dev_account()

    # Create new pool with the same ID...
    new_pool = [
        0,  # poolId
        "0x0000000000000000000000000000000000000003",  # collection address
        1,  # nftId
        1,  # maxContributions
        1,  # shareSupply
        "0x0000000000000000000000000000000000000004",  # creator address
        False,  # completed bool
        1,  # endPurchasePrice
        1,  # vaultId
        1, # count
    ]

    data_contract.updatePool(new_pool, {"from": admin_account})

    # Cannot update_pool from other_account
    with brownie.reverts():
        data_contract.updatePool(new_pool, {"from": other_account})

    assert data_contract.getPool(0) == new_pool

    # Update poolId to nonexistent pool...
    new_pool[0] = 20
    with brownie.reverts():
        data_contract.updatePool(new_pool, {"from": admin_account})


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

    assert data_contract.updatePool(POOL, {"from": admin_account})
    pool_id = 0

    participants = [
        [1, "0x0000000000000000000000000000000000000007", 0, 0],
        [2, "0x0000000000000000000000000000000000000008", 0, 0],
        [3, "0x0000000000000000000000000000000000000009", 0, 0]
    ]

    participant_bad_id = [0, "0x0000000000000000000000000000000000000010", 0, 0]


    # Pool must exist to add participant...
    with brownie.reverts():
        data_contract.addParticipant(
            5, participants[0], {"from": admin_account})

    # Can't add initial participant with id 0... 
    with brownie.reverts():
        data_contract.addParticipant(
            0, participant_bad_id, {"from": admin_account})

    # Can't add participants from non-permissioned account
    with brownie.reverts():
        data_contract.addParticipant(pool_id, participants[0], {
                                     "from": other_account})

    # Can't add participants out of order...
    with brownie.reverts():
        data_contract.addParticipant(pool_id, participants[1], {
                                     "from": admin_account})


    # Adding first participant 
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

    for i in range(1, 4):
        assert data_contract.getParticipant(0, i) == participants[i - 1]

    assert data_contract.getNumberOfParticipants(0) == 3


# Number of participants should be 3 from prior tests...

def test_set_participant():
    data_contract = BahiaNFTPoolData[-1]
    admin_account = get_admin_account()
    other_account = get_dev_account()
    pool_id = 0

    assert data_contract.getNumberOfParticipants(0) == 3

    new_participant_one = [1, admin_account, 1000, 100]

    # Pool must exist to set participant...
    with brownie.reverts():
        data_contract.setParticipant(5, new_participant_one, {
                                     "from": admin_account})

    data_contract.setParticipant(pool_id, new_participant_one, {
                                 "from": admin_account})
    assert data_contract.getParticipant(pool_id, new_participant_one[0]) == new_participant_one


def test_set_contribution():
    data_contract = BahiaNFTPoolData[-1]
    admin_account = get_admin_account()
    random_account = accounts[7]
    pool_id = 0
    participant_id = 1
    contribution = Web3.toWei(0.05, "ether")

    # Random account is not participant...
    with brownie.reverts():
        data_contract.setContribution(
            pool_id, 1, contribution, {"from": random_account})

    data_contract.setContribution(
        pool_id, participant_id, contribution, {"from": admin_account})

    assert data_contract.getParticipant(pool_id, participant_id)[
        2] == contribution
    
    # Can't set contribution for participant who doesn't exist
    non_existent_participant_id = 20
    with brownie.reverts():
        data_contract.setContribution(pool_id, non_existent_participant_id, contribution, {"from": admin_account})
    
        # Pool doesn't exist
    with brownie.reverts():
        data_contract.setContribution(
            10, participant_id, contribution, {"from": admin_account})
    




def test_set_allowed_permission():
    data_contract = BahiaNFTPoolData[-1]
    other_account = get_dev_account()
    admin_account = get_admin_account()

    with brownie.reverts():
        data_contract.setAllowedPermission(
            admin_account, False, {"from": other_account})

    data_contract.setAllowedPermission(
        admin_account, False, {"from": admin_account})


   
