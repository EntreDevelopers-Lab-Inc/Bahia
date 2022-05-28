from brownie import WETH10, VaultFactory, LooksRareToken, LooksRareExchange, CurrencyManager, ExecutionManager, TransferSelectorNFT, TransferManagerERC721, TransferManagerERC1155, StrategyStandardSaleForFixedPrice, RoyaltyFeeManager, RoyaltyFeeRegistry, BahiaNFTPoolData, BahiaNFTPool_LR, Fish, accounts
from scripts.NFT.Pool.fractional_art + import deploy_fractional_art
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY, NULL_ADDRESS


# function to deploy support contracts
def deploy_support():
    admin = get_admin_account()

    deploy_fractional_art()

    # add weth
    WETH10.deploy({'from': admin})

    # deploy a looksrare token (same supply cap as the actual token)
    LooksRareToken.deploy(
        admin, 0, 1000000000000000000000000000, {'from': admin})

    # deploy looksrare exchange support
    CurrencyManager.deploy({'from': admin})
    ExecutionManager.deploy({'from': admin})

    # add WETH as an accepted currency
    CurrencyManager[-1].addCurrency(WETH10[-1], {'from': admin})

    # add the fixed price strategy
    StrategyStandardSaleForFixedPrice.deploy(0, {'from': admin})
    ExecutionManager[-1].addStrategy(
        StrategyStandardSaleForFixedPrice[-1], {'from': admin})

    # set royalty fee limit to 90%
    RoyaltyFeeRegistry.deploy(9000, {'from': admin})
    RoyaltyFeeManager.deploy(RoyaltyFeeRegistry[-1], {'from': admin})

    # deploy looksrare exchange (null address receives protocol fees, as not testing this exchange)
    LooksRareExchange.deploy(
        CurrencyManager[-1], ExecutionManager[-1], RoyaltyFeeManager[-1], WETH10[-1], NULL_ADDRESS, {'from': admin})

    # set up transfer managers
    TransferManagerERC721.deploy(LooksRareExchange[-1], {'from': admin})
    TransferManagerERC1155.deploy(LooksRareExchange[-1], {'from': admin})
    TransferSelectorNFT.deploy(
        TransferManagerERC721[-1], TransferManagerERC1155[-1], {'from': admin})

    # update the LR transfer selector
    LooksRareExchange[-1].updateTransferSelectorNFT(
        TransferSelectorNFT[-1], {'from': admin})


# function to deploy everything
def deploy():
    admin = get_admin_account()

    deploy_support()

    # deploy the data contract
    BahiaNFTPoolData.deploy({'from': admin})

    # deploy the bahia nft pool and fish contracts
    Fish.deploy({'from': admin})
    BahiaNFTPool_LR.deploy(
        DEV_ROYALTY, BahiaNFTPoolData[-1], VaultFactory[-1], WETH10[-1], LooksRareExchange[-1], LooksRareToken[-1], {'from': admin})

    # make the pool an allowed contract
    BahiaNFTPoolData[-1].setAllowedPermission(
        BahiaNFTPool_LR[-1], True, {'from': admin})

    # give each account 10 weth
    for account in accounts:
        WETH10[-1].deposit({'value': 1000, 'from': account})
