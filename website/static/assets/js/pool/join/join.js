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


function renameKey ( obj, oldKey, newKey ) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }

// synchronous function for adding pool (will want to do this sequentially to maintain structure for the user)
async function addPool(pool)
{
    var collection_address = pool[1];

    var getCall = Moralis.Web3API.token.getNFTMetadata({address: collection_address, chain: CHAIN_ID_STR});
    var metadata = getCall.result();

    // Get necessary metadata from token_uri
    pool['name'] = metadata['name'];
    pool['link'] = getIPFSLink(metadata.image);

    // refer to blockchain/contracts/NFT/Pool/libraries/BahiaNFTPoolTypes.sol

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
        if (!pools[0]['completed']) {
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
        var pool_array = await POOL_DATA_CONTRACT.getPool(i);
        var pool_json = JSON.stringify(pool_array);

        renameKey(pool_json, '0', 'pool_id');
        renameKey(pool_json, '1', 'collection_address');
        renameKey(pool_json, '2', 'token_id');
        renameKey(pool_json, '3', 'maxContributions');
        renameKey(pool_json, '5', 'creator');
        renameKey(pool_json, '6', 'completed');

        pools.push(pool_json);
        // See what this looks like in the console for debugging...
        console.log(pool_json);
    }

    // add all the nfts
    addAllPools(pools);
}

function random()
{
    console.log('random');
}

// show modal
function showJoinModal()
{   
    if (poolData['name'] == undefined)
    {
        alert('Must select a pool to join first');
        return;
    }
    console.log("This is working")

    // set the name
    $('#join-pool-name').text(poolData['name'])

    // set the collection address
    $('#pool-nft-collection-address').text(poolData['collection_address']);

    // set the etherscan
    $('#pool-nft-etherscan').attr('href', ETHERSCAN_BASE + poolData['collection_address']);

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
