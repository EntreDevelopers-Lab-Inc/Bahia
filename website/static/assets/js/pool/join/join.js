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

    pool['looksRare-href'] = LOOKSRARE_BASE + "/" + pool['address'] + "/" + pool["token-id"];

    // render the template
    var newPool = Mustache.render(POOL_TEMPLATE, pool);

    // add the pool to POOL_OBJECTS
    POOL_OBJECTS.prepend(newPool);
}

async function addAllPools(pools)
{
    // iterate over the nfts and add them to the list
    for (var i = 0; i < pools_count; i += 1)
    {
        // Only add pools that aren't completed...
        if (!pools[i]['completed']) {
            var collection_address = pools[i]['address'];
            var token_id = pools[i]['token-id'];
            nftData = await Moralis.Web3API.token.getTokenIdMetadata( {address: collection_address, token_id: token_id, chain: CHAIN_ID_STR});
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
        var pool = await POOL_DATA_CONTRACT.getPool(i);

        // is this improper JSON formattiing?
        var pool_json = {
            "pool_id": pool[0].toString(),
            "address": pool[4],
            "token-id": pool[1].toString(),
            "cap": ethers.utils.formatEther(pool[2]),
            "creator": pool[5],
            "completed": pool[6]
        }

        var totalContributionsObj = await totalContributions(pool[0]);
        console.log(totalContributionsObj.contributions.toString())
        pool_json['current-contributions'] = totalContributionsObj.contributions; 

        await $.ajax({
            url: LOOKSRARE_API_BASE + 'orders',
            method: 'GET',
            data: {
                isOrderAsk: true,
                collection: pool_json['address'],
                tokenId: pool_json['token-id'],
                strategy: LOOKSRARE_BUY_NOW_STRATEGY,
                status: ['VALID'],
                pagination: {'first': 1},
                sort: 'PRICE_DESC'
            },
            success: function (resp) {
                if (resp.data.length == 0)
                {
                    pool_json['market-price'] = 'N/A';
                }
                else
                {
                    pool_json['market-price'] = ethers.utils.formatEther(resp.data[0].price);
                }
            }
        });
        console.log(pool_json)
        pools.push(pool_json);
    }

    // add all the nfts
    addAllPools(pools);
}

// show modal
function showJoinModal()
{   

    if (poolData['name'] == undefined)
    {
        alert('Must select a pool to join first');
        return;
    }

    // set the name
    $('#join-pool-name').text(poolData['name']);

    // set the collection address
    $('#pool-nft-collection-address').text(poolData['address']);

    // set the etherscan
    $('#pool-nft-looksrare').attr('href', LOOKSRARE_BASE + poolData['address'] + '/' + poolData['token-id']);
    $('#pool-nft-etherscan').attr('href', ETHERSCAN_BASE + poolData['address']);


    // show the modal
    toggleModal();
    $('#join-modal').show();

    // show the right stuff
    $('#join-pool').show();
    $('#joining-loading').hide();
}

// select a pool (cannot be asynchronous because other data depends on it)
function selectPool(id, address, cap, collectionName, tokenId)
{
    // // deselect the other selections
    // var selections = POOL_OBJECTS.find('tr');

    // // select this tab as active
    // for (var i = 0; i < selections.length; i += 1)
    // {
    //     $(selections[i]).attr('class', 'tab-link');
    // }

    // enable the selected
    var selected = POOL_OBJECTS.find("tr[pool-id='" + id + "']");
    selected.attr('class', 'tab-link active');

    // write the sale dict
    poolData['address'] = address;
    poolData['id'] = id;
    poolData['token-id'] = tokenId;
    poolData['collection-name'] = collectionName;
    poolData['cap'] = cap;

    poolData['name'] = collectionName + " #" + tokenId;

    console.log(poolData);
}

// load document function
async function loadDocument()
{
    // wait until the wallet is connected
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let currentBlock = await provider.getBlockNumber();

    loadPools();
}

loadDocument();