from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_purchase_deposit_assets


# test not paid
def test_not_paid():
    purchase_contract, buyer, seller = deploy_and_create()

    assert purchase_contract.isPaid() == False


# test paid
def test_paid():
    # just create the transaction
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # all assets are deposited
    assert purchase_contract.isPaid() == True


# test seller transfer initiated
def test_seller_transfer_initiated():
    # deploy and purchase
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # have the seller take the eth out
    purchase_contract.claimETH({'from': seller})

    # the contract should be paid
    assert purchase_contract.isPaid() == True


# test buyer transfer initiated
def test_buyer_transfer_initiated():
    # deploy and purchase
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # have the seller take the eth out
    purchase_contract.claimNFT({'from': buyer})

    # the contract should be paid
    assert purchase_contract.isPaid() == True
