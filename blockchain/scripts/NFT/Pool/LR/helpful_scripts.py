from brownie import Settings, ERC721VaultFactory, WETH10, LooksRareToken, LooksRareExchange, CurrencyManager, ExecutionManager, StrategyStandardSaleForFixedPrice, RoyaltyFeeManager, RoyaltyFeeRegistry, BahiaNFTPoolData, BahiaNFTPool_LR, Fish, accounts
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY, NULL_ADDRESS


# function to deploy support contracts
def deploy_support():
    admin = get_admin_account()

    # deploy settings for vault factory
    Settings.deploy({'from': admin})

    # deploy fractional art and weth
    ERC721VaultFactory.deploy(Settings[-1], {'from': admin})
    WETH10.deploy({'from': admin})

    # deploy a looksrare token (same supply cap as the actual token)
    LooksRareToken.deploy(
        NULL_ADDRESS, 0, 1000000000000000000000000000, {'from': admin})

    # deploy looksrare exchange support
    CurrencyManager.deploy({'from': admin})
    ExecutionManager.deploy({'from': admin})

    # add the fixed price strategy
    StrategyStandardSaleForFixedPrice.deploy({'from': admin})
    ExecutionManager[-1].addStrategy(
        StrategyStandardSaleForFixedPrice[-1], {'from': admin})

    # set royalty fee limit to 95% (max limit)
    RoyaltyFeeRegistry.deploy(95000, {'from': admin})
    RoyaltyFeeManager.deploy(RoyaltyFeeRegistry[-1], {'from': admin})

    # deploy looksrare exchange (null address receives protocol fees, as not testing this exchange)
    LooksRareExchange.deploy(
        CurrencyManager[-1], ExecutionManager[-1], RoyaltyFeeManager[-1], WETH10[-1], NULL_ADDRESS, {'from': admin})


# function to deploy everything
def deploy():
    admin = get_admin_account()

    deploy_support()

    # deploy the data contract
    BahiaNFTPoolData.deploy({'from': admin})

    # deploy the bahia nft pool and fish contracts
    Fish.deploy({'from': admin})
    BahiaNFTPool_LR.deploy(
        DEV_ROYALTY, BahiaNFTPoolData[-1], ERC721VaultFactory[-1], WETH10[-1], LooksRareExchange[-1], {'from': admin})

    # make the pool an allowed contract
    BahiaNFTPoolData[-1].setAllowedPermission(
        BahiaNFTPool_LR[-1], True, {'from': admin})

    # give each account 10 weth
    for account in accounts:
        WETH10[-1].deposit({'value': 10, 'from': account})
