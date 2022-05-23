from brownie import LooksRareExchange

# make the maker ask


def list_nft(signer, collection_address, price, token_id, amount, strategy, currency, nonce, start_time, end_time, min_percentage_to_ask):
    params = b''  # used for complex orders (which are not being tested)

    # get v, r, and s
    # always make v 27
    v = 27

    # just keep r ans s as empty byte strings for now, can't tell the difference anyway
    r = b''
    s = b''

    # create a maker ask in line with the library (will add other variables later)
    maker_ask = (
        True,
        signer,
        collection_address,
        price,
        tokenId,
        amount,
        strategy,  # an address
        currency,
        nonce,
        start_time,
        end_time,
        min_percentage_to_ask,
        params
    )

    long_bytes = LooksRareExchange[-1].getHash(maker_ask)
    print(long_bytes)

    return maker_ask
