import brownie
from brownie import NFTPurchase, accounts, interface, chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_purchase_deposit_assets


# test a non-buyer trying to reclaim the eth
def test_non_buyer_claim_eth():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # try to claim the eth with the seller
    with brownie.reverts():
        purchase_contract.reclaimETH({'from': seller})

    with brownie.reverts():
        purchase_contract.reclaimETH({'from': accounts[3]})


# test a non-paid contract
def test_non_paid():
    # make the contract, buyer, and seller
    purchase_contract, buyer, seller = deploy_and_create()

    # put in the asset from the seller
    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # move the nft to another contract with the seller
    nft_contract.safeTransferFrom(
        seller, accounts[3], purchase_contract.nftId(), {'from': seller})

    # try for the buyer to take out the eth without paying
    with brownie.reverts():
        purchase_contract.reclaimETH({'from': buyer})


# test a non-expired contract
def test_non_expired():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # try to claim the eth before expiration
    with brownie.reverts():
        purchase_contract.reclaimETH({'from': buyer})

# test after buyer claims nft contract


def test_after_claim_nft():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=5)

    # claim the nft from the buyer
    purchase_contract.claimNFT({'from': buyer})

    # sleep the time, so you can try and reclaim the eth
    chain.sleep(6)

    # try to claim the eth after the eth has been claimed
    with brownie.reverts():
        purchase_contract.reclaimETH({'from': buyer})


# test after seller claims eth
def test_after_claim_eth():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=5)

    # claim the eth from the seller
    purchase_contract.claimETH({'from': seller})

    chain.sleep(6)

    # try to claim the nft after the nft has been claimed
    with brownie.reverts():
        purchase_contract.reclaimETH({'from': buyer})


# successful transfer
def test_reclaim_eth():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=5)

    chain.sleep(6)

    # get the dev account
    dev = get_admin_account()

    # save the old balances
    old_dev_balance = dev.balance()
    old_buyer_balance = buyer.balance()

    # try to reclaim the nft with the buyer
    purchase_contract.reclaimETH({'from': buyer})

    # get the dev payment
    dev_payment = (bahia_contract.devRoyalty() *
                   purchase_contract.cost() / 100000)

    # make sure the seller's balance increased by the cost
    assert buyer.balance() == (old_buyer_balance +
                               purchase_contract.cost() - dev_payment)

    # make sure the devs got paid
    assert dev.balance() == (old_dev_balance + dev_payment)
