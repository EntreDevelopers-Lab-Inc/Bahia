from brownie import BahiaNFTPurchase, Fish, NFTPurchase, accounts, Wei, chain
from brownie import interface
from scripts.accounts import get_admin_account
from scripts.constants import DEV_ROYALTY


def deploy():
    admin = get_admin_account()

    # deploy the bahia nft purchase and fish contracts
    Fish.deploy({'from': admin})
    BahiaNFTPurchase.deploy(DEV_ROYALTY, {'from': admin})


# a function for creating a purchase
def deploy_and_create(added_exp_time=100):
    # deploy the contract
    deploy()

    # get the nft purchase contract
    bahia_contract = BahiaNFTPurchase[-1]
    fish_contract = Fish[-1]

    # get the buyer and seller
    buyer = accounts[1]
    seller = accounts[2]

    # give the seller an nft
    fish_contract.safeMint({'from': seller})

    # set up the transaction
    exp_time = chain.time() + added_exp_time
    nft_id = 0  # the first nft in the collection

    cost = Wei("1 ether")

    # create one transaction that lasts for 100 seconds
    bahia_contract.createTransaction(
        exp_time, Fish[-1].address, nft_id, cost, buyer, {'from': seller})

    # get the purchase contract
    purchase_id = 0
    purchase_contract_address = bahia_contract.transactions(purchase_id)

    # get an nft purchase
    purchase_contract = NFTPurchase.at(
        purchase_contract_address)

    return purchase_contract, buyer, seller


# function for approving an address to move stuff
def deploy_create_approve(added_exp_time=100):
    purchase_contract, buyer, seller = deploy_and_create(
        added_exp_time=added_exp_time)

    # approve the contract to deposit nfts
    nft_contract = interface.IERC721(purchase_contract.nftManager())
    nft_contract.approve(
        purchase_contract.address, purchase_contract.nftId(), {'from': seller})

    print(nft_contract.getApproved(purchase_contract.nftId()))

    return purchase_contract, buyer, seller


def deploy_purchase_deposit_assets(added_exp_time=100):
    purchase_contract, buyer, seller = deploy_and_create(
        added_exp_time=added_exp_time)

    # have the buyer pay the price
    purchase_contract.depositETH(
        {'from': buyer, 'value': purchase_contract.cost()})

    # approve the contract to deposit nfts
    nft_contract = interface.IERC721(purchase_contract.nftManager())
    nft_contract.approve(
        purchase_contract.address, purchase_contract.nftId(), {'from': seller})

    # have the seller deposit the nft
    purchase_contract.depositNFT({'from': seller})

    return purchase_contract, buyer, seller
