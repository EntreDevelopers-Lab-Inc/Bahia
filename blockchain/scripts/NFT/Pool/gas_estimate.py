from brownie import web3, BahiaNFTPoolData
from scripts.accounts import * 

def data_contract_estimate():
    admin_account = get_admin_account()
    data_contract = BahiaNFTPoolData.deploy({'from': admin_account})
