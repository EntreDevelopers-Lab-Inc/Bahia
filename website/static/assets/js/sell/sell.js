// load moralis
Moralis.start({serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID});

// load the nft template and objects
const NFT_TEMPLATE = $('#nft-template').html();
var NFT_OBJECTS = $('#nft-objects');

// load the sale tempalte and objects
/*const SALE_TEMPLATE = $('#sale-template').html();
var SALE_OBJECTS = $('#sale-objects');
*/
// keep the sale data on hand
var saleData = {};

// keep track of the offset
var NFT_OFFSET = 0;
var NFT_LIMIT = 20;


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
    Moralis.Web3API.account.getNFTs({address: window.ethereum.selectedAddress, chain: CHAIN_ID_STR, limit: NFT_LIMIT, offset: NFT_OFFSET}).then(function(resp) {
        // add each nft from the result
        var nfts = resp.result;

        // iterate over the nfts and add them to the list
        for (var i = 0; i < nfts.length; i += 1)
        {
            addNFT(nfts[i]);
        }

        // increment the offset
        NFT_OFFSET += 1;
    });
}


// add a sale
function addSale(data)
{

}

// load the past sales
async function loadSales()
{
    var saleCount = 0;

    // get the length of the number of sales
    await CONTRACT.purchases(window.ethereum.selectedAddress).then(function (resp) {
        // set the sale count
        saleCount = resp;
    });

    // fill the list with the relevant information
    for (var i = 0; i < saleCount; i += 1)
    {
        //
    }
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
function createSale()
{
    // get all the information necessary for the sale from the frontend
    var expTime = Date.parse($('#date').val()) / 1000;  // originally in miliseconds --> need seconds for eth evmx
    var collectionAddress = saleData['address'];
    var nftId = saleData['id'];
    var cost = $('#cost').val();
    var buyerAddress = $('#buyer-address').val();

    // if there is no collection address or nftId, need to alert so
    if ((collectionAddress == undefined) || (nftId == undefined))
    {
        alert('Must select NFT');
        return;
    }

    // if the cost is < 0, return (need to convert from null)
    if (!Boolean(parseFloat(cost)))
    {
        alert('Must sell nft for more than 0 ETH.')
        return;
    }
    else
    {
        // covert eth to gwei
        cost = ethers.utils.parseEther(cost);
    }

    // if there is no date, alert so
    if (!Boolean(parseInt(expTime)))
    {
        alert('Must set expiration time.');
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
        // clear the form
        $('#sell-form')[0].reset();

        // scroll to this nft in the log

        // call approve with the erc721 contract


    });

    // get the number of transactions
    // add the new sale the transaction log --> use prepend
    return false;
}


// show modal
function showSellModal()
{

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
    loadSales();
}

// bind the frm
$('#sell-form').submit(function (e) {
    e.preventDefault();

    createSale();
});

loadDocument();
