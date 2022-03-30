import brownie
from brownie import BahiaNFTPurchase, chain, accounts, interface
from scripts.accounts import get_admin_account
from scripts.NFT.Purchase.helpful_scripts import deploy_create_approve


# test not the buyer
def test_not_buyer():
    purchase_contract, buyer, seller = deploy_create_approve()

    # catch a false buyer
    with brownie.reverts():
        purchase_contract.buy(
            {'from': accounts[3], 'value': purchase_contract.cost()})


# test an expired contract
def test_expired():
    purchase_contract, buyer, seller = deploy_create_approve(added_exp_time=3)

    # sleep off the time
    chain.sleep(4)

    # try and buy it
    with brownie.reverts():
        purchase_contract.buy(
            {'from': buyer, 'value': purchase_contract.cost()})


# test a completed contract
def test_completed():
    purchase_contract, buyer, seller = deploy_create_approve()

    # buy it the first time
    purchase_contract.buy({'from': buyer, 'value': purchase_contract.cost()})

    # try and buy it again
    with brownie.reverts():
        purchase_contract.buy(
            {'from': buyer, 'value': purchase_contract.cost()})


# test particular buyer
def test_particular_buyer():
    purchase_contract, buyer, seller = deploy_create_approve()

    # keep the bahia contract for dev royalty
    bahia_contract = BahiaNFTPurchase[-1]

    # track the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # get the dev
    dev = get_admin_account()

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    # get the dev payment
    dev_payment = (bahia_contract.devRoyalty() *
                   purchase_contract.cost() / 100000)

    # buy it the first time
    purchase_contract.buy({'from': buyer, 'value': purchase_contract.cost()})

    # check to see if the balances updated properly
    assert seller.balance() == (old_seller_balance +
                                purchase_contract.cost() - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase_contract.cost())
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase_contract.nftId()) == buyer.address

    # make sure that the buyer now has the purchase
    assert bahia_contract.purchaseCount(buyer) == 1
    assert bahia_contract.purchases(buyer, 0) == 0

    # make sure that completed is true
    assert purchase_contract.completed()


# test empty buyer
def test_empty_buyer():
    purchase_contract, buyer, seller = deploy_create_approve()

    # set the buyer to a null address
    new_buyer_addr = '0x0000000000000000000000000000000000000000'
    purchase_contract.setBuyer(
        brownie.convert.to_address(new_buyer_addr), {'from': seller})

    # make sure the change went through
    assert new_buyer_addr == purchase_contract.buyerAddress()

    # set the seller to a new accoutn
    buyer = accounts[3]

    # keep the bahia contract for dev royalty
    bahia_contract = BahiaNFTPurchase[-1]

    # track the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # get the dev
    dev = get_admin_account()

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    print(f"Old seller balance: {seller.balance()}")

    # get the dev payment
    dev_payment = (bahia_contract.devRoyalty() *
                   purchase_contract.cost() / 100000)

    # buy it the first time
    purchase_contract.buy(
        {'from': buyer, 'value': purchase_contract.cost()})

    # check to see if the balances updated properly
    print(f"Contract seller: {purchase_contract.sellerAddress()}")
    print(f"Actual seller: {seller.address}")
    print(f"New seller balance: {seller.balance()}")
    assert seller.balance() == (old_seller_balance +
                                purchase_contract.cost() - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase_contract.cost())
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase_contract.nftId()) == buyer.address

    # make sure that the buyer now has the purchase
    assert bahia_contract.purchaseCount(buyer) == 1
    assert bahia_contract.purchases(buyer, 0) == 0
    assert purchase_contract.buyerAddress() == buyer.address

    # make sure that completed is true
    assert purchase_contract.completed()


# make sure they cant send too much eth
def test_excess_purchase():
    purchase_contract, buyer, seller = deploy_create_approve()

    # keep the bahia contract for dev royalty
    bahia_contract = BahiaNFTPurchase[-1]

    # track the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # get the dev
    dev = get_admin_account()

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    # get the dev payment
    dev_payment = (bahia_contract.devRoyalty() *
                   purchase_contract.cost() / 100000)

    # buy it the first time
    purchase_contract.buy(
        {'from': buyer, 'value': purchase_contract.cost() * 10})

    # check to see if the balances updated properly
    assert seller.balance() == (old_seller_balance +
                                purchase_contract.cost() - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase_contract.cost())
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase_contract.nftId()) == buyer.address

    # make sure that the buyer now has the purchase
    assert bahia_contract.purchaseCount(buyer) == 1
    assert bahia_contract.purchases(buyer, 0) == 0
    assert purchase_contract.buyerAddress() == buyer.address

    # make sure that completed is true
    assert purchase_contract.completed()


# test empty buyer
def test_empty_buyer():
    purchase_contract, buyer, seller = deploy_create_approve()

    # set the buyer to a null address
    new_buyer_addr = '0x0000000000000000000000000000000000000000'
    purchase_contract.setBuyer(
        brownie.convert.to_address(new_buyer_addr), {'from': seller})

    # make sure the change went through
    assert new_buyer_addr == purchase_contract.buyerAddress()

    # set the seller to a new accoutn
    buyer = accounts[3]

    # keep the bahia contract for dev royalty
    bahia_contract = BahiaNFTPurchase[-1]

    # track the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # get the admin
    admin = get_admin_account()
    dev = accounts[5]

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    print(f"Old seller balance: {seller.balance()}")

    # get the dev payment
    dev_payment = (bahia_contract.devRoyalty() *
                   purchase_contract.cost() / 100000)

    # set the dev address
    BahiaNFTPurchase[-1].changeDevAddress(dev.address, {"from": admin});

    # buy it the first time
    purchase_contract.buy(
        {'from': buyer, 'value': purchase_contract.cost()})

    # check to see if the balances updated properly
    print(f"Contract seller: {purchase_contract.sellerAddress()}")
    print(f"Actual seller: {seller.address}")
    print(f"New seller balance: {seller.balance()}")
    assert seller.balance() == (old_seller_balance +
                                purchase_contract.cost() - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase_contract.cost())
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase_contract.nftId()) == buyer.address

    # make sure that the buyer now has the purchase
    assert bahia_contract.purchaseCount(buyer) == 1
    assert bahia_contract.purchases(buyer, 0) == 0
    assert purchase_contract.buyerAddress() == buyer.address

    # make sure that completed is true
    assert purchase_contract.completed()
