from brownie import Bahia, Agua, accounts


# test creating an invoice
def test_gas():
    # deploy contracts
    admin_account = accounts[0]
    Bahia.deploy(1000, {'from': admin_account})
    Agua.deploy({'from': admin_account})
    bahia = Bahia[-1]
    agua = Agua[-1]

    # get accounts
    user_account = accounts[1]
    client_account = accounts[2]

    # call functions
    bahia.createInvoice(
        'i1', client_account, agua, {'from': user_account})

    bahia.addMilestone(0, ['m1', 100], {'from': user_account})
