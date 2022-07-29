// set the origin of LR
var LR_ORIGIN_TIME = '1645554222';

// this just switches between rinkeby and mainnet depending on the chain id indicated in the constants file
if (CHAIN_ID_INT == 1)
{
    var LOOKSRARE_API_BASE = 'https://api.looksrare.org/api/v1/';
    var LOOKSRARE_BUY_NOW_STRATEGY = '0x56244bb70cbd3ea9dc8007399f61dfc065190031';
}
else if (CHAIN_ID_INT == 4)
{
    var LOOKSRARE_API_BASE = 'https://api-rinkeby.looksrare.org/api/v1/';
    var LOOKSRARE_BUY_NOW_STRATEGY = '0x732319A3590E4fA838C111826f9584a9A2fDEa1a';

}
else
{
    console.log('No looksrare API base found due to chain id mismatch');
}
