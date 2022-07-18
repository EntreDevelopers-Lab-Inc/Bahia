const { ethers } = require("ethers");

// load the nft template and objects
const POOL_TEMPLATE = $('#pool-template').html();
var POOL_OBJECTS = $('#pool-objects');

// load the sale tempalte and objects
const SALE_TEMPLATE = '';
var JOIN_OBJECTS = $('#join-objects');

// keep the pool data on hand 
var poolData = {};

// keep track of the offset
var POOL_OFFSET = 0;
var POOL_LIMIT = 20;
var pools = [];
var getcall;



// synchronous function for adding pool (will want to do this sequentially to maintain structure for the user)
function addPool(pool)
{
    // add the link
    var metadata = JSON.parse(data.metadata);
 
    var collection_address = pool[1];

    let nft_contract = new ethers.Contract(collection_address, ERC721_ABI, CONTRACT_PROVIDER);
    var metadata = JSON.parse(nft_contract.tokenURI())

    pool['link'] = getIPFSLink(metadata.image);
    // refer to blockchain/contracts/NFT/Pool/libraries/BahiaNFTPoolTypes.sol
    // pool['poolId'] = pool[0];
    pool['maxContributions'] = pool[3];

    // render the template
    var newPool = Mustache.render(POOL_TEMPLATE, pool);

    // add the pool to POOL_OBJECTS
    POOL_OBJECTS.append(newPool);
}

async function addAllPools(pools)
{
    // iterate over the nfts and add them to the list
    for (var i = 0; i < pools_count; i += 1)
    {
        // Only add pools that aren't completed...
        if (!pools[0][6]) {
            addPool(pools[i]);
        }
    }

    // if the number of children less than the limit, there not another page, so hide the next button
    if ($('#pool-objects').children().length < POOL_LIMIT)
    {
        $('#next-btn').hide();
    }
    // else, show the button
    else
    {
        $('#next-btn').show();
    }
}


// load the nfts
async function loadPools()
{
    // clear all nfts
    $('#pool-objects').empty();

    pools_count = await POOL_DATA_CONTRACT.getPoolCount();

    for (var i = 0; i < pools_count; i++) {
        pool = await POOL_DATA_CONTRACT.getPool(i);
        pools.push(pool);
    }

    // add all the nfts
    addAllPools(pools);
}

// show modal
function showJoinModal()
{   
    // if (saleData['name'] == undefined)
    // {
    //     alert('Must select an NFT to sell first');
    //     return;
    // }
    console.log("This is working")

    // set the name
    $('#join-pool-name').text(poolData['name'])

    // set the collection address
    $('#pool-nft-collection-address').text(poolData['address']);

    // set the etherscan
    $('#pool-nft-etherscan').attr('href', ETHERSCAN_BASE + poolData['address']);

    // show the modal
    toggleModal();
    $('#join-modal').show();

    // show the right stuff
    $('#create-sale').show();
    $('#sale-loading').hide();
}

// select a pool (cannot be asynchronous because other data depends on it)
function selectPool(address, id)
{
    // deselect the other selections
    var selections = POOL_OBJECTS.find('a');

    // select this tab as active
    for (var i = 0; i < selections.length; i += 1)
    {
        $(selections[i]).attr('class', 'tab-link')
    }

    // enable the selected
    var selected = POOL_OBJECTS.find("a[pool-id='" + id + "']");
    selected.attr('class', 'tab-link active');

    // write the sale dict
    poolData['address'] = address;
    poolData['id'] = id;
    poolData['name'] = selected.text();  // for the modal
}