async function viewTrade()
{
    // get the trade address
    var tradeAddress = $('#trade-address').val();

    // check if the trade address is valid
    if (!ethers.utils.isAddress(tradeAddress))
    {
        alert('Invalid Address: ' + tradeAddress);
        return;
    }

    // load up the trade contract data
    var data = await getSaleData(tradeAddress);

    if (data == undefined)
    {
        alert('Could not find trade associated with ' + tradeAddress);
        return;
    }

    console.log(data);

    // start by adding th picture (takes the longest)
    Moralis.Web3API.token.getTokenIdMetadata({chain: CHAIN_ID_STR, address: data['collectionAddress'], token_id: data['nftId'].toString()}).then(function (resp) {
        // get the metadata out
        var metadata = JSON.parse(resp.metadata);

        // set the image
        $('#image').attr('src', metadata['image']);
    });

    // set the collection address
    $('#collection-address').text(data['collectionAddress']);
    $('#copy-icon').attr('hidden', false);

    // set the etherscan and looksrare links
    $('#etherscan-link').attr('href', ETHERSCAN_BASE + data['collectionAddress']);
    $('#looksrare-link').attr('href', LOOKSRARE_BASE + data['collectionAddress']);

    // set the cost
    $('#cost').text(data['cost'])

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
        $('#buy-btn').attr('class', 'btn btn-default btn-radius btn-block');
    }
    else
    {
        $('#buy-btn').attr('class', 'btn btn-default btn-radius btn-block disabled');
    }
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
