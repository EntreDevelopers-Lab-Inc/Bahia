// load the nft template and objects
const NFT_TEMPLATE = $('#nft-template').html();
var NFT_OBJECTS = $('#nft-objects');

// load the sale tempalte and objects
const SALE_TEMPLATE = '';
var SALE_OBJECTS = $('#sale-objects');

// keep the sale data on hand
var saleData = {};

// keep track of the offset
var NFT_OFFSET = 0;
var NFT_LIMIT = 20;
var getcall;

// show modal
function showJoinModal()
{   
    if (saleData['name'] == undefined)
    {
        alert('Must select an NFT to sell first');
        return;
    }

    // set the name
    $('#sell-nft-name').text(saleData['name'])

    // set the collection address
    $('#sell-nft-collection-address').text(saleData['address']);

    // set the etherscan
    $('#sell-nft-etherscan').attr('href', ETHERSCAN_BASE + saleData['address']);

    // set the looksrare
    $('#sell-nft-looksrare').attr('href', LOOKSRARE_BASE + saleData['address']);

    // show the modal
    toggleModal();
    $('#sell-nft-modal').show();

    // show the right stuff
    $('#create-sale').show();
    $('#sale-loading').hide();
}
