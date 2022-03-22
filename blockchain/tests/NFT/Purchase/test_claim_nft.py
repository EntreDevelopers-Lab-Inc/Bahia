import brownie
from brownie import NFTPurchase, accounts, interface, chain
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create, deploy_purchase_deposit_assets


# test a non-buyer trying to claim the nft
def test_non_buyer_claim_nft():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # try to claim the nft with the seller
    with brownie.reverts():
        purchase_contract.claimNFT({'from': seller})


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

    # try for the buyer to take out the asset without paying
    with brownie.reverts():
        purchase_contract.claimNFT({'from': buyer})


# test an expired contract
def test_expired():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets(
        added_exp_time=3)

    # sleep until the contract expires
    chain.sleep(4)

    # try to claim the nft after expiration
    with brownie.reverts():
        purchase_contract.claimNFT({'from': buyer})


# test a contract with no NFT (even though it is paid)
def test_no_nft():
    # make the contract, buyer, and seller
    purchase_contract, buyer, seller = deploy_and_create()

    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # try to claim the nft before deposit
    with brownie.reverts():
        purchase_contract.claimNFT({'from': buyer})


# successful transfer
def test_claim_nft():
    purchase_contract, buyer, seller = deploy_purchase_deposit_assets()

    # try to claim the nft with the seller
    purchase_contract.claimNFT({'from': buyer})

    # make sure teh owner is the buyer now
    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    assert nft_contract.ownerOf(purchase_contract.nftId()) == buyer.address
