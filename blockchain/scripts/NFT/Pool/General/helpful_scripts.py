from brownie import Settings, ERC721VaultFactory, BahiaNFTPoolData, BahiaNFTPool, accounts
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY


def deploy():
    admin = get_admin_account()

    # deploy settings for vault factory
    Settings.deploy({'from': admin})

    # deploy fractional art and weth
    ERC721VaultFactory.deploy(Settings[-1], {'from': admin})

    # deploy the data contract
    BahiaNFTPoolData.deploy({'from': admin})

    # deploy the bahia nft pool and fish contracts
    Fish.deploy({'from': admin})
    BahiaNFTPool.deploy(DEV_ROYALTY, BahiaNFTPoolData[-1], {'from': admin})

    # make the pool an allowed contract
    BahiaNFTPoolData[-1].setAllowedPermission(
        BahiaNFTPool[-1], True, {'from', admin})
