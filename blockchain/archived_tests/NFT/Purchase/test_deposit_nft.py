import pytest
import brownie
from brownie import NFTPurchase, accounts, interface
from scripts.NFT.Purchase.helpful_scripts import deploy_and_create


# setup the test
@pytest.fixture(autouse=True)
def setup():
    # have to deploy and create a contract every time
    purchase_contract, buyer, seller = deploy_and_create()


# have the buyer deposit an nft (should fail)
def test_buyer_deposit_nft():
    # make the purchase contract
    purchase_contract = NFTPurchase[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # try and have the buyer transfer in the nft (only the seller should be allowed)
    with brownie.reverts():
        purchase_contract.depositNFT({'from': buyer})


# transfer the nft, and have the seller try to deposit it
def test_seller_deposit_nft_after_transfer():
    # make the purchase contract
    purchase_contract = NFTPurchase[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # move the nft to another contract with the seller
    nft_contract.safeTransferFrom(
        seller, accounts[3], purchase_contract.nftId(), {'from': seller})

    # try and have the seller transfer in the nft after it has been moved
    with brownie.reverts():
        purchase_contract.depositNFT({'from': seller})


# deposit successfully
def test_deposit_nft():
    # make the purchase contract
    purchase_contract = NFTPurchase[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # get the nft contract
    nft_contract = interface.IERC721(purchase_contract.nftManager())

    # let the seller approve the transfer
    nft_contract.approve(purchase_contract.address,
                         purchase_contract.nftId(), {'from': seller})

    # try and have the buyer transfer in the nft (only the seller should be allowed)
    purchase_contract.depositNFT({'from': seller})

    # make sure that the transfer happened successfully
    assert nft_contract.ownerOf(
        purchase_contract.nftId()) == purchase_contract.address
