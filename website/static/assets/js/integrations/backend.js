if (CHAIN_ID_INT == 1)
{
    var API_BASE = 'https://api.bahia.io/';
}
else if (CHAIN_ID_INT == 4)
{
    var API_BASE = 'https://api.bahia.io/rinkeby/';

}
else
{
    console.log('No backend API base found due to chain id mismatch');
}

/*
NOTES
- this is done for 2 reasons
    - it allows for webhooks in blocknative
    - it is most consistent with other apis in how they define the chain in the link, not the request
*/
