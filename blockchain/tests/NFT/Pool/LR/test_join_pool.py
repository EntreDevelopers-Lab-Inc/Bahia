import pytest
import brownie
from brownie import BahiaNFTPool_LR, LooksRareExchange, Fish, WETH10, StrategyStandardSaleForFixedPrice, TransferManagerERC721, VaultFactory, accounts, chain
from scripts.NFT.Pool.LR.helpful_scripts import deploy
from scripts.NFT.Pool.LR.ask import create_maker_ask
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY, NULL_ADDRESS


# deploy and join a pool
@pytest.fixture(autouse=True)
def setup_pool():
    # deploy the contracts
    deploy()

    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    weth_contract = WETH10[-1]
    lr_transfer_contract = TransferManagerERC721[-1]

    # mint an NFT to the user
    fish_contract.safeMint(1, {'from': accounts[1]})

    # allow the transfer manager to interact with the nft
    fish_contract.setApprovalForAll(
        lr_transfer_contract, True, {'from': accounts[1]})

    # create a pool from an account
    pool_contract.createPool(fish_contract, 0, 606, 3000, {
                             'from': accounts[2]})

    # allow the pool to take money from the accounts
    for i in range(2, 6):
        weth_contract.approve(pool_contract, 500, {'from': accounts[i]})


# test joining a COMPLETED pool (rest tested in general contract)
def test_completed_pool():
    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]

    # have the accounts join the pool
    pool_contract.joinPool(0, 101, {'from': accounts[2]})
    pool_contract.joinPool(0, 202, {'from': accounts[3]})
    pool_contract.joinPool(0, 303, {'from': accounts[4]})

    # get the maker ask
    maker_ask = create_maker_ask(signer=accounts[1],
                                 collection_address=fish_contract,
                                 price=600,
                                 token_id=0,
                                 amount=1,
                                 strategy=StrategyStandardSaleForFixedPrice[-1],
                                 currency=WETH10[-1],
                                 nonce=0,  # first nft listed by this account
                                 start_time=chain.time(),
                                 end_time=chain.time() + 600,  # 10 minutes later
                                 min_percentage_to_ask=8500  # collect 85% of the order
                                 )

    # call buy now
    pool_contract.buyNow(0, maker_ask, 8500, '', {'from': accounts[2]})

    # check that joining the pool will revert
    with brownie.reverts():
        pool_contract.joinPool(0, 404, {'from': accounts[5]})
