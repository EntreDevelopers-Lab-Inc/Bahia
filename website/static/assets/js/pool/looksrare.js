// this just switches between rinkeby and mainnet depending on the chain id indicated in the constants file
if (CHAIN_ID_INT == 4)
{
    var LOOKSRARE_API_BASE = 'https://api-rinkeby.looksrare.org/api/v1/';
}
else if (CHAIN_ID_INT == 1)
{
    var LOOKSRARE_API_BASE = 'https://api.looksrare.org/api/v1/';
}
else
{
    console.log('No looksrare API base found due to chain id mismatch');
}
