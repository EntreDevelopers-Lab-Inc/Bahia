// this just switches between rinkeby and mainnet depending on the chain id indicated in the constants file
if (CHAIN_ID_INT == 4)
{
    const LOOKSRARE_BASE = 'https://api-rinkeby.looksrare.org/';
}
else if (CHAIN_ID_INT == 1)
{
    const LOOKSRARE_BASE = 'https://api.looksrare.org/';
}
else
{
    console.log('No looksrare API base found due to chain id mismatch');
}
