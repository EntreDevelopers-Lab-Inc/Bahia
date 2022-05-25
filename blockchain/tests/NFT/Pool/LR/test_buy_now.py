import pytest
import brownie
from brownie import BahiaNFTPool_LR, BahiaNFTPoolData, LooksRareExchange, Fish, WETH10, StrategyStandardSaleForFixedPrice, TransferManagerERC721, VaultFactory, accounts, chain
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


# test executing a purchase
def test_buy():
    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    vault_contract = VaultFactory[-1]
    weth_contract = WETH10[-1]

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

    # get admin start balance
    admin = get_admin_account()
    balance_accounts = [pool_contract] + accounts[1:5]
    start_balances = dict()
    end_balances = dict()

    for account in balance_accounts:
        start_balances[account] = weth_contract.balanceOf(account)

    # set each end balance (don't really care about who listed it on LR, not testing exchange)
    print(f"Dev royalty: {DEV_ROYALTY / 100000}")
    end_balances[pool_contract] = start_balances[pool_contract] + \
        (600 * (DEV_ROYALTY / 100000))
    end_balances[accounts[2]] = start_balances[accounts[2]] - 101
    end_balances[accounts[3]] = start_balances[accounts[3]] - 202
    end_balances[accounts[4]] = start_balances[accounts[4]] - 303

    # call buy now
    pool_contract.buyNow(0, maker_ask, 8500, '', {'from': accounts[2]})

    # make sure that the vault exists
    print(f"Vault: {vault_contract.vaults(0)}")
    assert vault_contract.vaults(0) != NULL_ADDRESS

    # make sure the devs got paid
    assert weth_contract.balanceOf(
        pool_contract) == end_balances[pool_contract]

    # make sure each account has the appropriate balance
    for account in accounts[2:5]:
        assert weth_contract.balanceOf(account) == end_balances[account]
        print(f"Balance of {account} is correct")


# test executing a purchase with a price that's too high
def test_buy_too_high():
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
                                 price=700,
                                 token_id=0,
                                 amount=1,
                                 strategy=StrategyStandardSaleForFixedPrice[-1],
                                 currency=WETH10[-1],
                                 nonce=0,  # first nft listed by this account
                                 start_time=chain.time(),
                                 end_time=chain.time() + 600,  # 10 minutes later
                                 min_percentage_to_ask=8500  # collect 85% of the order
                                 )

    # try to buy the item (should fail)
    with brownie.reverts():
        pool_contract.buyNow(0, maker_ask, 8500, '', {'from': accounts[2]})
