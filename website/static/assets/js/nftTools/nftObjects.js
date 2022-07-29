// load the nft template and objects
const NFT_TEMPLATE = $('#nft-template').html();
var NFT_OBJECTS = $('#nft-objects');

// keep track of the offset
var NFT_OFFSET = 0;
var NFT_LIMIT = 20;

// keep the sale data on hand
var nftData = {};

// synchronous function for adding an nft (will want to do this sequentially to maintain structure for the user)
function addNFT(data)
{
    // add the link
    var metadata = JSON.parse(data.metadata);

    data['link'] = getIPFSLink(metadata.image);

    // render the template
    var newNft = Mustache.render(NFT_TEMPLATE, data);

    // add the nft to the objects
    NFT_OBJECTS.append(newNft);
}

async function addAllNFTs(nfts)
{
    // iterate over the nfts and add them to the list
    for (var i = 0; i < nfts.length; i += 1)
    {
        addNFT(nfts[i]);
    }

    // if the number of children less than the limit, there not another page, so hide the next button
    if ($('#nft-objects').children().length < NFT_LIMIT)
    {
        $('#next-btn').hide();
    }
    // else, show the button
    else
    {
        $('#next-btn').show();
    }
}


/*DESIGN DECISION: abstract the loadNFTs function to another JS file, will have a default that does nothing here*/
// default load NFTs function
function loadNFTs()
{

}


// get the next nfts
async function nextNFTs()
{
     // increment the offset
    NFT_OFFSET += NFT_LIMIT;

    // call the load nfts function
    loadNFTs();

    // if the nft offset is now only 1 unit, show the previous button
    if (NFT_OFFSET == NFT_LIMIT)
    {
        $('#previous-btn').show();
    }
}


// get the previous nfts
async function previousNFTs()
{
    if (NFT_OFFSET > 0)
    {
        // decrement the nft offset
        NFT_OFFSET -= NFT_LIMIT;
    }
    else
    {
        // just set the nft offset to 0 and remove the button
        NFT_OFFSET -= NFT_LIMIT;
        $('#previous-btn').hide();
    }

    // if the nft offset is now 0, hide the previous button
    if (NFT_OFFSET <= 0)
    {
        $('#previous-btn').hide();
    }

    // load the nfts
    loadNFTs();

}

// default for load nft hook (meant to be overrridden)
function loadNFT(address, id)
{

}

// select an nft (cannot be asynchronous because other data depends on it)
// important to be able to select data
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
    nftData['address'] = address;
    nftData['id'] = id;
    nftData['name'] = selected.text();  // for the modal

    // load the nft (this is a hook)
    loadNFT(address, id);
}
