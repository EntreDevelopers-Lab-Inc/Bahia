// load moralis
Moralis.start({serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID});

function loadNFTs()
{
    Moralis.Web3API.account.getNFTs({address: window.ethereum.selectedAddress, chain: CHAIN_ID_STR}).then(function(resp) {console.log(resp)});
}


// load document function
function loadDocument()
{
    loadNFTs();
}

loadDocument();
