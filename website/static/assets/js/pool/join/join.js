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
var getCall;


// synchronous function for adding pool (will want to do this sequentially to maintain structure for the user)
function addPool(pool, nftData)
{
    console.log(nftData['name']);
    // Get necessary metadata from token_uri
    pool['name'] = nftData['name'];


    if (nftData['metadata'] === null) {
        pool['link'] = getIPFSLink(DEFAULT_IPFS_RAWLINK);
        pool['description'] = '';
    }
    else {
        var metadata = JSON.parse(nftData['metadata']);
        pool['link'] = getIPFSLink(metadata['image']);
        pool['description'] = metadata['description'];
    }

    // render the template
    var newPool = Mustache.render(POOL_TEMPLATE, pool);

    // add the pool to POOL_OBJECTS
    POOL_OBJECTS.append(newPool);
}

async function addAllPools(pools)
{
    console.log("All pools:  " + pools)
    // iterate over the nfts and add them to the list
    for (var i = 0; i < pools_count; i += 1)
    {
        // Only add pools that aren't completed...
        if (!pools[i]['completed']) {
            var collection_address = pools[i]['collection_address'];
            var token_id = pools[i]['token_id'];
            nftData = await Moralis.Web3API.token.getTokenIdMetadata( {address: collection_address, token_id: token_id, chain: CHAIN_ID_STR});
            console.log("Data: " + JSON.stringify(nftData));
            addPool(pools[i], nftData);

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
        
        // is this improper JSON formattiing?
        var pool_json = {
            "pool_id": pool_array[0].toString(),
            "address": pool_array[4],
            "token-id": pool_array[1].toString(),
            "cap": pool_array[2].toString(),
            "creator": pool_array[5],
            "completed": pool_array[6]
        }

        pools.push(pool_json);
        // See what this looks like in the console for debugging...
        console.log(pool_json);
    }

    // add all the nfts
    addAllPools(pools);
}

// show modal
function showJoinModal()
{   

    console.log("WHEN DOES THIS E");

    if (poolData['name'] == undefined)
    {
        alert('Must select a pool to join first');
        return;
    }

    // set the name
    $('#join-pool-name').text(poolData['name']);

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
function selectPool(id, address, cap)
{
    // deselect the other selections
    var selections = POOL_OBJECTS.find('tr');

    // select this tab as active
    for (var i = 0; i < selections.length; i += 1)
    {
        $(selections[i]).attr('class', 'tab-link');
    }

    // enable the selected
    var selected = POOL_OBJECTS.find("tr[pool-id='" + id + "']");
    selected.attr('class', 'tab-link active');

    // write the sale dict
    poolData['address'] = address;
    poolData['id'] = id;
    poolData['cap'] = cap;

    // Need to traverse the dom to get the name
    // # will give temp name for now
    poolData['name'] = "Temp Name";  // for the modal

    console.log("Does this execute first?");
}

// load document function
async function loadDocument()
{
    // wait until the wallet is connected
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let currentBlock = await provider.getBlockNumber();

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

    loadPools();
}

async function loadSamplePool(){
    
    var pool_json = {
        "pool_id": "0",
        "collection_address": "0x0000000000000000000000",
        "token_id": "3",
        "maxContributions": "80",
        "creator": "0x0000000000000000000",
        "completed": false,
        "name": "Fish",  
        "link": "google.com"
    };
    
    // render the template
    var newPool = Mustache.render(POOL_TEMPLATE, pool_json);

    // add the pool to POOL_OBJECTS
    POOL_OBJECTS.append(newPool);
}

loadSamplePool();

loadDocument();