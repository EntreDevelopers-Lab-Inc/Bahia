import brownie
from brownie import BahiaNFTPurchase2, chain, interface, accounts
from scripts.accounts import get_admin_account
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_create_approve


# test the buyer changes purchase price
def test_buyer_change_cost():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # set a new buyer that tries to meddle with the contract
    buyer = accounts[5]

    # make an old address
    old_address = purchase[4]

    # set the new purchase price
    with brownie.reverts():
        contract.setBuyer(purchase[0],
                          buyer.address, {'from': buyer})

    # check that it was set
    assert purchase[4] == old_address


# test the seller sets the cost after it is expired
def test_change_cost_after_expired():
    purchase, buyer, seller = deploy_create_approve(added_exp_time=3)
    contract = BahiaNFTPurchase2[-1]

    # set the chain sleep
    chain.sleep(4)

    # make an old address
    old_address = purchase[4]

    # set the new purchase price
    with brownie.reverts():
        contract.setBuyer(purchase[0],
                          buyer.address, {'from': seller})

    # check that it was set
    assert purchase[4] == old_address


# test the seller sets the cost after the owner changes
def test_change_cost_after_owner_change():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # change the owner of the token
    nft_contract = interface.IERC721(purchase[7])

    # make an old address
    old_address = purchase[4]

    # change the owner of the nft
    nft_contract.safeTransferFrom(
        seller.address, accounts[5].address, purchase[2], {'from': seller})

    # set the new purchase price
    with brownie.reverts():
        contract.setBuyer(purchase[0],
                          buyer.address, {'from': seller})

    # check that it was set
    assert purchase[4] == old_address


# test the seller sets the cost after the transaction is complete
def test_change_cost_after_complete():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # make an old address
    old_address = purchase[4]

    # have the buyer buy the nft
    contract.buy(purchase[0], {'from': buyer,
                               'value': purchase[3]})

    # set the new purchase price
    with brownie.reverts():
        contract.setBuyer(purchase[0],
                          buyer.address, {'from': seller})

    # check that it was set
    assert purchase[4] == old_address


# test a seller changes the purchase price
def test_new_cost():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # make a new buyer
    new_buyer = buyer.address

    # set the new purchase price
    contract.setBuyer(purchase[0], new_buyer, {'from': seller})

    # check that it was set
    assert purchase[4] == new_buyer
