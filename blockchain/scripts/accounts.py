from brownie import accounts


# set some admin account
def get_admin_account():
    return accounts[0]
