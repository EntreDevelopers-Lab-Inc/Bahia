import pytest
import brownie
from brownie import BahiaNFTPool_LR, BahiaNFTPoolData, LooksRareExchange, Fish, WETH10, StrategyStandardSaleForFixedPrice, accounts, chain
from scripts.NFT.Pool.LR.helpful_scripts import deploy
from scripts.NFT.pool.LR.ask import list_nft


# deploy and create a pool every time
@pytest.fixture(autouse=True)
def setup_pool():
    # deploy the contracts
    deploy()

    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    looksrare_contract = LookRareExchange[-1]
    weth_contract = WETH10[-1]

    # mint an NFT to the user
    fish_contract.safeMint(1, {'from': accounts[1]})

    # list the NFT on looksrare
    list_nft(signer=accounts[1],
             collection_address=fish_contract,
             price=6,
             token_id=0,
             amount=1,
             strategy=StrategyStandardSaleForFixedPrice[-1],
             currency=WETH10[-1],
             nonce=0,  # first nft listed by this account
             start_time=chain.time(),
             end_time=chain.time() + 600,  # 10 minutes later
             min_percentage_to_ask=8500  # collect 85% of the order
             )

    # create a pool from an account
    pool_contract.createPool(fish_contract, 0, 6, 'Scales', 'SCLS', 30, 150, {
                             'from': accounts[2]})

    # allow the pool to take money from the accounts
    for i in range(2, 5):
        weth_contract.approve(pool_contract, 3, {'from': accounts[i]})


# test executing a purchase
def test_buy():
    # get the contracts
    pool_contract = BahiaNFTPool_LR[-1]

    # have the accounts join the pool
    pool_contract.joinPool(0, 1, {'from': accounts[2]})
    pool_contract.joinPool(0, 2, {'from': accounts[3]})
    pool_contract.joinPool(0, 3, {'from': accounts[4]})

    # call buy now

    # make sure that the vault exists

    # make sure the devs got paid

    # make sure each account has the appropriate balance
    pass
