import pytest
import brownie
from brownie import FERC1155, BahiaNFTPool_LR, BahiaNFTPoolData, LooksRareExchange, Fish, WETH10, StrategyStandardSaleForFixedPrice, TransferManagerERC721, VaultFactory, accounts, chain
from scripts.NFT.Pool.LR.helpful_scripts import deploy
from scripts.NFT.Pool.LR.ask import create_maker_ask
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY, NULL_ADDRESS


# deploy and create a pool every time
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
    for i in range(2, 5):
        weth_contract.approve(pool_contract, 303, {'from': accounts[i]})

    # have the accounts join the pool
    pool_contract.joinPool(0, 101, {'from': accounts[2]})
    pool_contract.joinPool(0, 202, {'from': accounts[3]})
    pool_contract.joinPool(0, 303, {'from': accounts[4]})


# test claiming incomplete pool
def test_incomplete_pool():
    # get the contract
    pool_contract = BahiaNFTPool_LR[-1]

    # have account try and withdraw shares
    with brownie.reverts():
        pool_contract.claimShares(0, 0, {'from': accounts[2]})


# test claiming for a participant that never paid
def test_unpaid():
    # get the contract
    pool_contract = BahiaNFTPool_LR[-1]
    data_contract = BahiaNFTPoolData[-1]

    # ask for only accounts 2 & 3
    # get the maker ask
    maker_ask = create_maker_ask(signer=accounts[1],
                                 collection_address=Fish[-1],
                                 price=300,
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

    # print each account balance
    for i in range(2, 5):
        print(
            f"{accounts[i]}: {data_contract.poolIdToParticipants(0, (i - 2))}")

    # try and claim shares from account 4
    with brownie.reverts():
        pool_contract.claimShares(0, 2, {'from': accounts[4]})


# test partially paid


# test complete pool
def test_paid():
    # get the contract
    pool_contract = BahiaNFTPool_LR[-1]
    data_contract = BahiaNFTPoolData[-1]

    # ask for only accounts 2 & 3
    # get the maker ask
    maker_ask = create_maker_ask(signer=accounts[1],
                                 collection_address=Fish[-1],
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

    # print each account balance
    for i in range(2, 5):
        print(
            f"{accounts[i]}: {data_contract.poolIdToParticipants(0, (i - 2))}")

    fractional_contract = FERC1155[-1]
    print(f"pool_contract balance of FERC1155: {fractional_contract.balanceOf(pool_contract, 1)}")
    print(f"pool_contract: {data_contract.getPool(0)}")
    vault_id = data_contract.getPool(0)[8]
    print(f"vault_id: {vault_id}")

    # try and claim shares from each account
    for i in range(2, 5):
        pool_contract.claimShares(0, (i - 2), {'from': accounts[i]})

        # assert that the balance of the account is correct


# test claiming from other address (like allowing people to airdrop shares)
