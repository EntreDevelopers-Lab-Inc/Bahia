from brownie import WETH10, VaultFactory, BahiaNFTPoolData, BahiaNFTPool, Fish, accounts
from scripts.NFT.Pool.fractional_art import deploy_fractional_art
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY


def deploy():
    admin = get_admin_account()

    # deploy fractional art
    deploy_fractional_art()

    # deploy weth
    WETH10.deploy({'from': admin})

    # deploy the data contract
    data_contract = BahiaNFTPoolData.deploy({'from': admin})

    data_contract.setAllowedPermission(admin, True, {'from': admin})

    # deploy the bahia nft pool and fish contracts
    Fish.deploy({'from': admin})
    BahiaNFTPool.deploy(
        DEV_ROYALTY, BahiaNFTPoolData[-1], VaultFactory[-1], WETH10[-1], {'from': admin})

    # make the pool an allowed contract
    BahiaNFTPoolData[-1].setAllowedPermission(
        BahiaNFTPool[-1], True, {'from': admin})

    # give each account 10 weth
    for account in accounts:
        WETH10[-1].deposit({'value': 10, 'from': account})
