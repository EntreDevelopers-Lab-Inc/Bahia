from scripts.accounts import *
import pytest, brownie 
from web3 import Web3
from brownie import BahiaNFTPoolData

BLANK_POOL = (
        0, # poolId
        "0x0000000000000000000000000000000000000000", # collection address
        0, # nftId
        0, # maxContributions
        "", # shareName
        "", # shareSymbol
        0, # shareSupply
        0, # shareListPrice
        "0x0000000000000000000000000000000000000000", # creator address
        False, # completed bool
        0, # endPurchasePrice
        0, #vaultId
)

# interface IBahiaNFTPoolData {
#     // ability to see the pool count
#     function getPoolCount() external view returns (uint256);

#     // getter function for the pool
#     function getPool(uint256 poolId) external returns (BahiaNFTPoolTypes.Pool memory);

#     // function to add a pool
#     function addPool(BahiaNFTPoolTypes.Pool memory newPool) external;

#     // update a pool
#     function updatePool(BahiaNFTPoolTypes.Pool memory pool) external;

#     // getter funtion to get the count of a pool's participants
#     function getParticipantCount(uint256 poolId) external view returns (uint256);

#     // getter function to get a pool's participant (based on an index)
#     function getParticipant(uint256 poolId, uint256 participantId) external returns (BahiaNFTPoolTypes.Participant memory);

#     // ability to add a participant to a pool
#     function addParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory newParticipant) external;

#     // set a participant
#     function setParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory participant) external;

#     // set the contribution
#     function setContribution(uint256 poolId, uint256 participantId, uint256 newContribution) external;
# }
@pytest.fixture(scope = "module", autouse=True)
def deploy_contracts():
    admin_account = get_admin_account()
    data_contract = BahiaNFTPoolData.deploy({"from": admin_account})


def test_add_pool():
    admin_account = get_admin_account()
    other_account = get_dev_account()
    data_contract =  BahiaNFTPoolData[-1]

    # Admin account should be able to addPool while other_account should not...
    data_contract.addPool(BLANK_POOL, {"from": admin_account}) 

    with brownie.reverts():
        data_contract.addPool(BLANK_POOL, {"from": other_account})

    assert data_contract.getPoolCount() == 1
    assert data_contract.getPool(0) == BLANK_POOL

# Pool should be added from test_add_pool()...
def test_update_pool():
    data_contract = BahiaNFTPoolData[-1]
    assert data_contract.getPoolCount() == 1
    assert data_contract.getPool(0) == BLANK_POOL

    admin_account = get_admin_account()
    other_account = get_dev_account() 

    #Create new pool with the same ID...
    new_pool = (
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
    ) 

    data_contract.updatePool(new_pool, {"from": admin_account})
    with brownie.reverts():
        data_contract.updatePool(new_pool, {"from": other_account})
    
    assert data_contract.getPool(0) == new_pool

def test_get_pool():
    data_contract = BahiaNFTPoolData[-1]
    # Try to query non-existent pool
    with brownie.reverts():
        data_contract.getPool(10)


    

