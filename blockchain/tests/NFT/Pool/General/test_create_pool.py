import brownie
from brownie import BahiaNFTPool, BahiaNFTPoolData, Fish, accounts
from scripts.NFT.Pool.General.helpful_scripts import deploy

POOL = [
    0,  # poolId
    0,  # nftId
    0,  # maxContributions
    0,  # shareSupply
    "0x0000000000000000000000000000000000000001",  # collection address
    "0x0000000000000000000000000000000000000002",  # creator address
        False,  # completed bool
        0,  # endPurchasePrice
        0,  # vaultId
        1, # count... *** Always must start @ 1
]

# test creating a pool
def test_create_pool():
    # deploy contracts
    deploy()

    pool_contract = BahiaNFTPool[-1]
    data_contract = BahiaNFTPoolData[-1]
    fish_contract = Fish[-1]

    # mint an NFT to the user
    fish_contract.safeMint(1, {'from': accounts[1]})

    # create a pool from an account
    pool_contract.createPool(fish_contract, 0, 3, 9, {
                             'from': accounts[2]})

    # make sure the pool has been added to the data contract
    pool = data_contract.pools(0)
    assert pool == (0, 0, 3, 9, fish_contract.address, accounts[2], False, 0, 0, 1)

    with brownie.reverts():
        data_contract.addPool(POOL, {'from': accounts[3]})
    
    # Can't add pool except from the pool_contract




