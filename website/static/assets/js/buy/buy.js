// set the gas limit
const GAS_LIMIT = 1000000;

// disable the buy button
async function disableBuyBtn()
{
    $('#buy-btn').attr('class', 'btn btn-default btn-radius btn-block disabled');
}


// enable the buy button
async function enableBuyBtn()
{
    $('#buy-btn').attr('class', 'btn btn-default btn-radius btn-block');
}


// view a trade
async function viewTrade()
{
    // hide the nft-data
    $('#nft-data').attr('hidden', true);
    $('#nft-loading').attr('hidden', false);

    // get the trade address
    var tradeAddress = $('#trade-address').val();

    // load up the trade contract data
    var data;
    await getSaleData(tradeAddress).then(function (resp) {
        data = resp;
    }).catch((error) => {
        // alert that the trade could not be found
        alert('Could not find trade associated with ' + tradeAddress);

        $('#nft-loading').attr('hidden', true);
    });

    // return if data is undefined
    if (data == undefined)
    {
        return;
    }

    // start by adding the picture (takes the longest)

    // need to remove old picture to maintain integrity
    $('#image').attr('src', '');

    Moralis.Web3API.token.getTokenIdMetadata({chain: CHAIN_ID_STR, address: data['collectionAddress'], token_id: data['nftId'].toString()}).then(function (resp) {
        // get the metadata out
        var metadata = JSON.parse(resp.metadata);

        // set the image
        $('#image').attr('src', getIPFSLink(metadata.image));
    });

    // set the collection address
    $('#collection-address').text(data['collectionAddress']);
    $('#copy-icon').attr('hidden', false);

    // set the etherscan and looksrare links
    $('#etherscan-link').attr('href', ETHERSCAN_BASE + data['collectionAddress']);
    $('#looksrare-link').attr('href', LOOKSRARE_BASE + data['collectionAddress']);

    // set the cost
    $('#cost').text(data['cost'])
    $('#cost').attr('cost', data['cost'].split(' ')[0]);

    // set the expiration
    $('#expiration').text(data['expiration']);

    // set the seller address
    $('#seller-address').text(data['sellerAddress']);

    // set the buyer address
    $('#buyer-address').text(data['buyerAddress']);

    // set the name
    $('#name').text(data['name']);

    // set the completion
    $('#completed').text(data['completed']);

    // set the activity
    $('#activity').text(data['activityString']);

    // see if the buyer can purchase
    var canPurchase = (window.ethereum.selectedAddress == data['buyerAddress']) || (!ethers.utils.isAddress(data['buyerAddress']));

    if (data['active'] && canPurchase)
    {
        // set the button as active
        enableBuyBtn();

        // set the button's trade address
        $('#buy-btn').attr('trade-address', tradeAddress);
    }
    else
    {
        disableBuyBtn();
    }

    // show the nft-data
    $('#nft-data').attr('hidden', false);
    $('#nft-loading').attr('hidden', true);
}


async function copyAddress()
{
    /* Get the text field */
    var copyText = document.querySelectorAll('span[id="collection-address"]');

    // copy it to the clipboard
    navigator.clipboard.writeText(copyText[0].textContent);

    // change the icon
    $('i[id="copy-icon"]').attr('class', 'fa fa-check');

    // wait 3 seconds
    await delay(3000)

    // change the icon back to what it should be
    $('i[id="copy-icon"]').attr('class', 'fa fa-copy');
}


// create a function that buys the nft
async function buyNFT()
{
    var buyBtn = $('#buy-btn');
    var waitMessage = $('#wait-message');

    // get the trade address
    var purchaseHex = $('#buy-btn').attr('trade-address');

    // disable the button to make sure the user does not rebuy
    disableBuyBtn();

    // hide the buy button, show the wait message
    buyBtn.hide();
    waitMessage.show();

    // run the contract
    const purchase = CONTRACT.buy(purchaseHex, {value: ethers.utils.parseEther($('#cost').attr('cost')), gasLimit: GAS_LIMIT}).then(function () {
        // show the buy button, hide the wait message
        buyBtn.show();
        waitMessage.hide();

        // alert the user that the purchase went through
        alert('Successfully purchased ' + $('#name').text());

        // mark as completed
        $('#completed').text('[COMPLETED]');

    });

    purchase.catch((error) => {
        alert(error.message);
        enableBuyBtn();

        // show the buy button, hide the wait message
        buyBtn.show();
        waitMessage.hide();

    })
}
