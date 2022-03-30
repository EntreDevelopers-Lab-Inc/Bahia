from brownie import BahiaNFTPurchase2, chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create


def test_not_expired():
    purchase, buyer, seller = deploy_and_create()
    contract = BahiaNFTPurchase2[-1]

    assert contract.isExpired(purchase[0]) is False


def test_expired():
    # set added time to 0 seconds to expire
    purchase, buyer, seller = deploy_and_create(added_exp_time=0)
    contract = BahiaNFTPurchase2[-1]

    chain.sleep(20)
    chain.mine(1)

    print(
        f"Purchase contract current time: {chain.time()}")
    print(f"Purchase contract expires at {purchase[1]}")

    assert contract.isExpired(purchase[0]) is True
