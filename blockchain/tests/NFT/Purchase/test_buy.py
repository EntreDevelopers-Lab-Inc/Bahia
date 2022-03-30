import brownie
from brownie import BahiaNFTPurchase2, chain, accounts, interface
from scripts.accounts import get_admin_account
from scripts.NFT.Purchase.helpful_scripts import deploy_create_approve


# test not the buyer
def test_not_buyer():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # catch a false buyer
    with brownie.reverts():
        contract.buy(purchase[0],
                     {'from': accounts[3], 'value': purchase[3]})


# test an expired contract
def test_expired():
    purchase, buyer, seller = deploy_create_approve(added_exp_time=3)
    contract = BahiaNFTPurchase2[-1]

    # sleep off the time
    chain.sleep(4)

    # try and buy it
    with brownie.reverts():
        contract.buy(purchase[0],
                     {'from': buyer, 'value': purchase[3]})


# test a completed contract
def test_completed():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # buy it the first time
    contract.buy(
        purchase[0], {'from': buyer, 'value': purchase[3]})

    # try and buy it again
    with brownie.reverts():
        contract.buy(purchase[0],
                     {'from': buyer, 'value': purchase[3]})


# test particular buyer
def test_particular_buyer():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # track the nft contract
    nft_contract = interface.IERC721(purchase[7])

    # get the dev
    dev = get_admin_account()

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    # get the dev payment
    dev_payment = (contract.devRoyalty() *
                   purchase[3] / 100000)

    # buy it the first time
    contract.buy(
        purchase[0], {'from': buyer, 'value': purchase[3]})

    # check to see if the balances updated properly
    assert seller.balance() == (old_seller_balance +
                                purchase[3] - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase[3])
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase[2]) == buyer.address

    # make sure that the buyer now has the purchase
    assert contract.purchaseCount(buyer) == 1
    assert contract.purchases(buyer, 0) == 0

    # make sure that completed is true
    assert contract.transactions(purchase[0])[6] is True


# test empty buyer
def test_empty_buyer():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # set the buyer to a null address
    new_buyer_addr = '0x0000000000000000000000000000000000000000'
    contract.setBuyer(purchase[0],
                      brownie.convert.to_address(new_buyer_addr), {'from': seller})

    # make sure the change went through
    assert new_buyer_addr == contract.transactions(purchase[0])[4]

    # set the seller to a new accoutn
    buyer = accounts[3]

    # track the nft contract
    nft_contract = interface.IERC721(purchase[7])

    # get the dev
    dev = get_admin_account()

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    print(f"Old seller balance: {seller.balance()}")

    # get the dev payment
    dev_payment = (contract.devRoyalty() *
                   purchase[3] / 100000)

    # buy it the first time
    contract.buy(purchase[0],
                 {'from': buyer, 'value': purchase[3]})

    # check to see if the balances updated properly
    print(f"Contract seller: {contract.transactions(purchase[0])[5]}")
    print(f"Actual seller: {seller.address}")
    print(f"New seller balance: {seller.balance()}")
    assert seller.balance() == (old_seller_balance +
                                purchase[3] - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase[3])
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase[2]) == buyer.address

    # make sure that the buyer now has the purchase
    assert contract.purchaseCount(buyer) == 1
    assert contract.purchases(buyer, 0) == 0
    assert contract.transactions(purchase[0])[4] == buyer.address

    # make sure that completed is true
    assert contract.transactions(purchase[0])[6]


# make sure they cant send too much eth
def test_excess_purchase():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # track the nft contract
    nft_contract = interface.IERC721(purchase[7])

    # get the dev
    dev = get_admin_account()

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    # get the dev payment
    dev_payment = (contract.devRoyalty() *
                   purchase[3] / 100000)

    # buy it the first time
    contract.buy(purchase[0],
                 {'from': buyer, 'value': purchase[3] * 2})

    # check to see if the balances updated properly
    assert seller.balance() == (old_seller_balance +
                                purchase[3] - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase[3])
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase[2]) == buyer.address

    # make sure that the buyer now has the purchase
    assert contract.purchaseCount(buyer) == 1
    assert contract.purchases(buyer, 0) == 0
    assert purchase[4] == buyer.address

    # make sure that completed is true
    assert contract.transactions(purchase[0])[6]


# test empty buyer
def test_change_dev_address():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # set the buyer to a null address
    new_buyer_addr = '0x0000000000000000000000000000000000000000'
    contract.setBuyer(purchase[0],
                      brownie.convert.to_address(new_buyer_addr), {'from': seller})

    # make sure the change went through
    assert new_buyer_addr == contract.transactions(purchase[0])[4]

    # set the seller to a new accoutn
    buyer = accounts[3]

    # track the nft contract
    nft_contract = interface.IERC721(purchase[7])

    # get the admin
    admin = get_admin_account()
    dev = accounts[5]

    # check the balances of all parties (buyer, seller, dev)
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()
    old_seller_balance = seller.balance()

    print(f"Old seller balance: {seller.balance()}")

    # get the dev payment
    dev_payment = (contract.devRoyalty() *
                   purchase[3] / 100000)

    # set the dev address
    contract.changeDevAddress(dev.address, {"from": admin});

    # buy it the first time
    contract.buy(purchase[0],
                 {'from': buyer, 'value': purchase[3]})

    # check to see if the balances updated properly
    print(f"Contract seller: {contract.transactions(purchase[0])[5]}")
    print(f"Actual seller: {seller.address}")
    print(f"New seller balance: {seller.balance()}")
    assert seller.balance() == (old_seller_balance +
                                purchase[3] - dev_payment)
    assert buyer.balance() == (old_buyer_balance - purchase[3])
    assert dev.balance() == (old_dev_balance + dev_payment)

    # make sure that the buyer now owns the nft
    assert nft_contract.ownerOf(purchase[2]) == buyer.address

    # make sure that the buyer now has the purchase
    assert contract.purchaseCount(buyer) == 1
    assert contract.purchases(buyer, 0) == 0
    assert contract.transactions(purchase[0])[4] == buyer.address

    # make sure that completed is true
    assert contract.transactions(purchase[0])[6]
