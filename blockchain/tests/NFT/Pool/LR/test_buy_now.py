import pytest
import brownie
from brownie import BahiaNFTPool_LR, Fish, WETH10, StrategyStandardSaleForFixedPrice, TransferManagerERC721, VaultFactory, accounts, chain
from scripts.NFT.Pool.LR.helpful_scripts import deploy
from scripts.NFT.Pool.LR.ask import create_maker_ask
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY, NULL_ADDRESS

SHARE_SUPPLY = 1000


# deploy and create a pool every time
@pytest.fixture(autouse=True)
def deploy_contracts_and_approve_weth():
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

    # allow the pool to take money from the accounts
    for i in range(2, 6):
        weth_contract.approve(pool_contract, 303, {'from': accounts[i]})


# test executing a purchase
def test_buy():
    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    vault_contract = VaultFactory[-1]
    weth_contract = WETH10[-1]
    max_contribution = 606

    # create a pool from an account
    pool_contract.createPool(fish_contract, 0, max_contribution, SHARE_SUPPLY, {
                             'from': accounts[2]})

    # have the accounts join the pool
    pool_contract.joinPool(0, 0, {'from': accounts[2]})
    pool_contract.joinPool(0, 101, {'from': accounts[3]})
    pool_contract.joinPool(0, 202, {'from': accounts[4]})
    pool_contract.joinPool(0, 303, {'from': accounts[5]})

    # can't join pool twice
    with brownie.reverts():
       pool_contract.joinPool(0, 0, {'from': accounts[2]}) 

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

    # get start balances
    balance_accounts = [pool_contract] + accounts[2:6]
    start_balances = dict()
    end_balances = dict()

    for account in balance_accounts:
        start_balances[account] = weth_contract.balanceOf(account)

    # set each end balance (don't really care about who listed it on LR, not testing exchange)
    print(f"Dev royalty: {DEV_ROYALTY / 100000}")
    end_balances[pool_contract] = start_balances[pool_contract] + \
        (600 * (DEV_ROYALTY / 100000))
    end_balances[accounts[2]] = start_balances[accounts[2]] 
    end_balances[accounts[3]] = start_balances[accounts[3]] - 101
    end_balances[accounts[4]] = start_balances[accounts[4]] - 202
    end_balances[accounts[5]] = start_balances[accounts[5]] - 303

    # call buy now
    pool_contract.buyNow(0, maker_ask, 8500, '', {'from': accounts[2]})

    # make sure that the vault exists
    print(f"Vault: {vault_contract.vaults(0)}")
    assert vault_contract.vaults(0) != NULL_ADDRESS

    # make sure the devs got paid
    assert weth_contract.balanceOf(
        pool_contract) == end_balances[pool_contract]

    # make sure each account has the appropriate balance
    for account in accounts[2:6]:
        assert weth_contract.balanceOf(account) == end_balances[account]
        print(f"Balance of {account} is correct")

    # can't join completed pool
    
    with brownie.reverts():
        pool_contract.joinPool(0, 250, {'from:': accounts[5]})


# test executing a purchase with a price that's too high
def test_buy_too_high():
    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    max_contribution = 606

    pool_contract.createPool(fish_contract, 0, max_contribution, SHARE_SUPPLY, {
                            'from': accounts[2]})


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


# test executing a purchase with a price that's too high
def test_collect_weth_no_balance():
    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    weth_contract = WETH10[-1]
    max_contribution = 900

    pool_contract.createPool(fish_contract, 0, max_contribution, SHARE_SUPPLY, {
                            'from': accounts[2]})

    weth_contract.approve(pool_contract, 1000, {'from': accounts[3]})
    weth_contract.approve(pool_contract, 1000, {'from': accounts[4]})


    # have the accounts join the pool
    pool_contract.joinPool(0, 301, {'from': accounts[2]})
    pool_contract.joinPool(0, 802, {'from': accounts[3]})
    pool_contract.joinPool(0, 803, {'from': accounts[4]})

    account_two_balance = weth_contract.balanceOf(accounts[2])
    weth_contract.transferFrom(accounts[2], accounts[5], account_two_balance, {"from": accounts[2]})

    balance_accounts = [pool_contract] + accounts[2:6]
    start_balances = dict()
    end_balances = dict()
    for account in balance_accounts:
        start_balances[account] = weth_contract.balanceOf(account)

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
    pool_contract.buyNow(0, maker_ask, 8500, '', {'from': accounts[2]})
    
    end_balances[pool_contract] = start_balances[pool_contract] + \
        (700 * (DEV_ROYALTY / 100000))
    end_balances[accounts[2]] = start_balances[accounts[2]] 
    end_balances[accounts[3]] = start_balances[accounts[3]] - 707
    end_balances[accounts[4]] = start_balances[accounts[4]]

    for account in accounts[2:5]:
        assert weth_contract.balanceOf(account) == end_balances[account] 
        print(f"Account: {account}")

def test_price_higher_than_accessible_weth():
    # get the contracts
    fish_contract = Fish[-1]
    pool_contract = BahiaNFTPool_LR[-1]
    max_contribution = 800

    pool_contract.createPool(fish_contract, 0, max_contribution, SHARE_SUPPLY, {
                            'from': accounts[2]})


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