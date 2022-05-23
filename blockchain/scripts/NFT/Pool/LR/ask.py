# make the maker ask
def list_nft(signer, collection_address, price, tokenId, amount, strategy, currency, nonce, start_time, end_time, min_percentage_to_ask):
    params = b''  # used for complex orders (which are not being tested)

    # get v, r, and s
    # always make v 27
    v = 27

    # just keep r ans s as empty byte strings for now, can't tell the difference anyway
    r = b''
    s = b''

    # create a maker ask in line with the library
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
        params,
        v,
        r,
        s
    )

    return maker_ask
