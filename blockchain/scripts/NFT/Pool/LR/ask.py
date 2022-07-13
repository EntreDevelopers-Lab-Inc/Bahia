from brownie import LooksRareExchange

# make the maker ask


def create_maker_ask(signer, collection_address, price, token_id, amount, strategy, currency, nonce, start_time, end_time, min_percentage_to_ask):
    params = b''  # used for complex orders (which are not being tested)

    # create a maker ask in line with the library (will add other variables later)
    maker_ask = [
        True,
        signer,
        collection_address,
        price,
        token_id,
        amount,
        strategy,  # an address
        currency,
        nonce,
        start_time,
        end_time,
        min_percentage_to_ask,
        params
    ]

    # get v, r, and s
    long_bytes = LooksRareExchange[-1].getHash(maker_ask)

    # always make v 27
    v = 27

    # r and s are parts of the hash
    r = str(long_bytes)[2:34]
    s = str(long_bytes)[34:]

    # apped v,r,s to the ask
    maker_ask += [v, r, s]

    return maker_ask
