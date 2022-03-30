import brownie
from brownie import BahiaNFTPurchase2, chain, interface, accounts
from scripts.NFT.Purchase.helpful_scripts import deploy_create_approve


# test the buyer changes purchase price
def test_buyer_change_cost():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # make an old cost
    old_cost = purchase[3]

    # set the new purchase price
    with brownie.reverts():
        contract.setCost(purchase[0],
                         old_cost * 2, {'from': buyer})

    # check that it was set
    assert contract.transactions(purchase[0])[3] == old_cost


# test the seller sets the cost after it is expired
def test_change_cost_after_expired():
    purchase, buyer, seller = deploy_create_approve(added_exp_time=3)
    contract = BahiaNFTPurchase2[-1]

    # set the chain sleep
    chain.sleep(4)

    # make an old cost
    old_cost = purchase[3]

    # set the new purchase price
    with brownie.reverts():
        contract.setCost(
            purchase[0], old_cost * 2, {'from': seller})

    # check that it was set
    assert contract.transactions(purchase[0])[3] == old_cost


# test the seller sets the cost after the owner changes
def test_change_cost_after_owner_change():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # change the owner of the token
    nft_contract = interface.IERC721(purchase[7])

    # make an old cost
    old_cost = purchase[3]

    # change the owner of the nft
    nft_contract.safeTransferFrom(
        seller.address, accounts[5].address, purchase[2], {'from': seller})

    # set the new purchase price
    with brownie.reverts():
        contract.setCost(purchase[0],
                         old_cost * 2, {'from': seller})

    # check that it was set
    assert contract.transactions(0)[3] == old_cost


# test the seller sets the cost after the transaction is complete
def test_change_cost_after_complete():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # make an old cost
    old_cost = purchase[3]

    # have the buyer buy the nft
    contract.buy(purchase[0], {'from': buyer,
                               'value': purchase[3]})

    # set the new purchase price
    with brownie.reverts():
        contract.setCost(
            purchase[0], old_cost * 2, {'from': seller})

    # check that it was set
    assert contract.transactions(purchase[0])[3] == old_cost


# test a seller changes the purchase price
def test_new_cost():
    purchase, buyer, seller = deploy_create_approve()
    contract = BahiaNFTPurchase2[-1]

    # make a new cost
    new_cost = purchase[3] * 2

    # set the new purchase price
    contract.setCost(purchase[0], new_cost, {'from': seller})

    # check that it was set
    assert contract.transactions(purchase[0])[3] == new_cost
