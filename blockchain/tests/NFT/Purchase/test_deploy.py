from brownie import BahiaNFTPurchase, Fish
from scripts.NFT.Purchase.helpful_scripts import deploy
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY


# test deploying the contract
def test_deploy():
    # deploy the contracts
    deploy()

    # get the nft purchase contract
    contract = BahiaNFTPurchase[-1]

    # make sure that the dev royalty and address is set correctly
    assert contract.devAddress() == get_admin_account()
    assert contract.devRoyalty() == DEV_ROYALTY
