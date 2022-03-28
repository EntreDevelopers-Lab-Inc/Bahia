// load moralis
Moralis.start({serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID});

// load the nft template and objects
const NFT_TEMPLATE = $('#nft-template').html();
var NFT_OBJECTS = $('#nft-objects');

// keep the sale data on hand
var saleData = {};


// synchronous function for adding an nft (will want to do this sequentially to maintain structure for the user)
function addNFT(data)
{
    // add the link
    var metadata = JSON.parse(data.metadata);

    data['link'] = metadata.image;

    // render the template
    var newNft = Mustache.render(NFT_TEMPLATE, data);

    // add the nft to the objects
    NFT_OBJECTS.append(newNft);
}


// load the nfts
async function loadNFTs()
{
    // get all the nfts from the moralis api
    Moralis.Web3API.account.getNFTs({address: window.ethereum.selectedAddress, chain: CHAIN_ID_STR}).then(function(resp) {
        // add each nft from teh result
        var nfts = resp.result;

        // iterate over the nfts and add them to the list
        for (var i = 0; i < nfts.length; i += 1)
        {
            addNFT(nfts[i]);
        }
    });
}


// load the past sales
async function loadSales()
{
    // get the length of the number of sales

    // fill the list backwards with the relevant information
}


// select an nft (cannot be asynchronous because other data depends on it)
function selectNFT(address, id)
{
    // deselect the other selections
    var selections = NFT_OBJECTS.find('a');

    // select this tab as active
    for (var i = 0; i < selections.length; i += 1)
    {
        $(selections[i]).attr('class', 'tab-link')
    }

    // enable the selected
    var selected = NFT_OBJECTS.find("a[nft-id='" + id + "']");
    selected.attr('class', 'tab-link active');

    // write the sale dict
    saleData['address'] = address;
    saleData['id'] = id;
}


// create a sale
async function createSale()
{
    // get all the information necessary for the sale from the frontend
    var expTime = Date.parse($('#date').val()) / 1000;  // originally in miliseconds --> need seconds for eth evm
    var collectionAddress - saleData['address'];
    var nftId = saleData['id'];
    var cost = $('#cost').val();
    var buyerAddress = $('#buyer-address').val();

    // if the cost is < 0, return (need to convert from null)
    if (!Boolean(parseFloat(cost)))
    {
        alert('Must sell nft for more than 0 ETH.')
        return;
    }

    // set the buyer to null if there is no value
    if (buyerAddress == '')
    {
        // set the buyer to null
        buyerAddress = '0x0000000000000000000000000000000000000000';
    }
    // else, check if the buyer exists
    else if (!ethers.utils.isAddress(buyerAddress))
    {
        alert('Invalid Buyer Address: ' + buyerAddress);
        return;
    }


    // create a transaction
    CONTRACT.createTransaction(expTime, collectionAddress, nftId, cost, buyerAddress).then(function (txResp) {
        // scroll to this nft in the log

        // call approve with the erc721 contract

    });

    // get the number of transactions
    // add the new sale the transaction log --> use prepend

}

// load document function
function loadDocument()
{
    // set the date attribute
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
       dd = '0' + dd;
    }

    if (mm < 10) {
       mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("date").setAttribute("min", today);

    loadNFTs();
}

loadDocument();
