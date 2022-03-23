from brownie import chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create


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
