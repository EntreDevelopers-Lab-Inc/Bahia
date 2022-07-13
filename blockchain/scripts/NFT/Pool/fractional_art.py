from brownie import FERC1155, VaultFactory
from scripts.accounts import get_admin_account


# deploy fractional art
def deploy_fractional_art():
    admin = get_admin_account()
    FERC1155.deploy({"from": admin})
    VaultFactory.deploy(FERC1155[-1], {'from': admin})

    # add the vault factory as a minter for the ERC1155s
    FERC1155[-1].addMinter(VaultFactory[-1])
