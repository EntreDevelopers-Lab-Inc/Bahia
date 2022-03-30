import brownie
from brownie import chain, interface, accounts
from scripts.accounts import get_admin_account
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_create_approve


# test the buyer changes purchase price
def test_buyer_change_cost():
    purchase_contract, buyer, seller = deploy_create_approve()

    # make an old cost
    old_cost = purchase_contract.cost()

    # set the new purchase price
    with brownie.reverts():
        purchase_contract.setCost(
            purchase_contract.cost() * 2, {'from': buyer})

    # check that it was set
    assert purchase_contract.cost() == old_cost


# test the seller sets the cost after it is expired
def test_change_cost_after_expired():
    purchase_contract, buyer, seller = deploy_create_approve(added_exp_time=3)

    # set the chain sleep
    chain.sleep(4)

    # make an old cost
    old_cost = purchase_contract.cost()

    # set the new purchase price
    with brownie.reverts():
        purchase_contract.setCost(
            purchase_contract.cost() * 2, {'from': seller})

    # check that it was set
    assert purchase_contract.cost() == old_cost


# test the seller sets the cost before approval
def test_change_cost_after_expired():
    purchase_contract, buyer, seller = deploy_and_create()

    # make an old cost
    old_cost = purchase_contract.cost()

    # set the new purchase price
    with brownie.reverts():
        purchase_contract.setCost(
            purchase_contract.cost() * 2, {'from': seller})

    # check that it was set
    assert purchase_contract.cost() == old_cost


# test the seller sets the cost after the owner changes
def test_change_cost_after_owner_change():
    purchase_contract, buyer, seller = deploy_create_approve()

    # change the owner of the token
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # make an old cost
    old_cost = purchase_contract.cost()

    # change the owner of the nft
    nft_contract.safeTransferFrom(
        seller.address, accounts[5].address, purchase_contract.nftId(), {'from': seller})

    # set the new purchase price
    with brownie.reverts():
        purchase_contract.setCost(
            purchase_contract.cost() * 2, {'from': seller})

    # check that it was set
    assert purchase_contract.cost() == old_cost


# test the seller sets the cost after the transaction is complete
def test_change_cost_after_complete():
    purchase_contract, buyer, seller = deploy_create_approve()

    # make an old cost
    old_cost = purchase_contract.cost()

    # have the buyer buy the nft
    purchase_contract.buy({'from': buyer, 'value': purchase_contract.cost()})

    # set the new purchase price
    with brownie.reverts():
        purchase_contract.setCost(
            purchase_contract.cost() * 2, {'from': seller})

    # check that it was set
    assert purchase_contract.cost() == old_cost


# test a seller changes the purchase price
def test_new_cost():
    purchase_contract, buyer, seller = deploy_create_approve()

    # make a new cost
    new_cost = purchase_contract.cost() * 2

    # set the new purchase price
    purchase_contract.setCost(new_cost, {'from': seller})

    # check that it was set
    assert purchase_contract.cost() == new_cost
