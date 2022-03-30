from brownie import chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_purchase_deposit_assets


def test_not_expired():
    purchase_contract, buyer, seller = deploy_and_create()

    assert purchase_contract.isExpired() == False


def test_expired():
    # set added time to 0 seconds to expire
    purchase_contract, buyer, seller = deploy_and_create(added_exp_time=0)

    chain.sleep(20)
    chain.mine(1)

    print(
        f"Purchase contract current time: {chain.time()}")
    print(f"Purchase contract expires at {purchase_contract.expirationTime()}")

    assert purchase_contract.isExpired() == True


def test_seller_transfer_initiated():
    # deploy and purchase
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # have the seller take the eth out
    purchase_contract.claimETH({'from': seller})

    # wait 4 seconds
    chain.sleep(4)
    chain.mine(1)

    # the contract should not be expired
    assert purchase_contract.isExpired() == False


def test_buyer_transfer_initiated():
    # deploy and purchase
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # have the seller take the eth out
    purchase_contract.claimNFT({'from': buyer})

    # wait 4 seconds
    chain.sleep(4)

    # the contract should not be expired
    assert purchase_contract.isExpired() == False
