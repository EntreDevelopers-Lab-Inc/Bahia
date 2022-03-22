import pytest
import brownie
from brownie import NFTPurchase, accounts, interface
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create


# setup the test
@pytest.fixture(autouse=True)
def setup():
    # have to deploy and create a contract every time
    purchase_contract, buyer, seller = deploy_and_create()


# have the buyer deposit an eth (should fail)
def test_buyer_deposit_eth():
    # make the purchase contract
    purchase_contract = NFTPurchase[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # try and have the seller transfer in the eth (only the buyer should be allowed)
    with brownie.reverts():
        purchase_contract.depositETH(
            {'from': seller, 'value': purchase_contract.cost() / 2})


# deposit successfully
# have the buyer deposit eth (should succeed)
def test_deposit_eth():
    # make the purchase contract
    purchase_contract = NFTPurchase[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # check the seller's balance
    start_balance = buyer.balance()

    # try and have the buyer transfer in the nft (only the seller should be allowed)
    purchase_contract.depositETH(
        {'from': buyer, 'value': purchase_contract.cost()})

    # make sure that the buyer is about the cost of the eth short
    assert buyer.balance() == (start_balance - purchase_contract.cost())

    # make sure that the contract received the eth
    assert purchase_contract.balance() == purchase_contract.cost()
    print(f"Purchase contract balance: {purchase_contract.balance()}")


# deposit too much eth --> refund excess
def test_deposit_excess_eth():
    # make the purchase contract
    purchase_contract = NFTPurchase[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # check the seller's balance
    start_balance = buyer.balance()

    # try and have the buyer transfer in the nft (only the seller should be allowed)
    purchase_contract.depositETH(
        {'from': buyer, 'value': 3 * purchase_contract.cost()})

    # make sure that the buyer is about the cost of the eth short
    assert buyer.balance() == (start_balance - purchase_contract.cost())

    # make sure that the contract received the eth
    assert purchase_contract.balance() == purchase_contract.cost()
    print(f"Purchase contract balance: {purchase_contract.balance()}")
