const COLLECTION_TEMPLATE = $('#collection-template').html();
var COLLECTION_OBJECTS = $('#collection-objects');

// add a collection choice
// data is a dictionary with one required field: address
async function addCollectionChoice(data, useTopOrder=true, tokenId=1)
{
    if (useTopOrder)
    {
        // use ajax to set the collection image as the most expensive listing
        $.ajax({
            url: LOOKSRARE_API_BASE + 'orders',
            method: 'GET',
            data: {
                isOrderAsk: true,
                collection: data.address,
                strategy: LOOKSRARE_BUY_NOW_STRATEGY,
                status: ['EXECUTED', 'VALID'],
                pagination: {'first': 1},
                sort: 'PRICE_DESC'
            },
            success: function (response) {
                if (response.data.length == 0)
                {
                    // call the function but use token id 1
                    addCollectionChoice(data, useTopOrder=false);
                }
                else
                {
                    // add a collection choice with the correct tokenId
                    addCollectionChoice(data, useTopOrder=false, tokenId=response.data[0].tokenId);
                }

            }
        });

        // end the function
        return;
    }
    else
    {
        // use ajax to get a collection image
        $.ajax({
            url: LOOKSRARE_API_BASE + 'tokens',
            method: 'GET',
            data: {
                collection: data.address,
                tokenId: tokenId
            },
            success: function(response) {
                // append the data with the image information
                data.image = response.data.imageURI;

                // use mustache to render the data from the collection choice
                var newCollection = Mustache.render(COLLECTION_TEMPLATE, data);

                // add the collection to the collections
                COLLECTION_OBJECTS.append(newCollection);
            }
        });
    }
}

// add many collection choices --> can be used when loading the document and searching collections (just writing a for loop once instead of twice)
async function addCollectionChoices(choices)
{
    // iterate over all the choices and call add collection choice (want this to be sequential to maintain structure)
    for (var i = 0; i < choices.length; i += 1)
    {
        await addCollectionChoice(choices[i].collection);
    }
}

// show the collection's NFTs
async function showCollectionNFTs(nfts)
{
    // remove the highlight from all the collections

    // add a highlight to the correct collection

    // iterate over the nfts
    for (var i = 0; i < nfts.length; i += 1)
    {
        // render each template in mustach JS
    }
}

// search a collection
async function searchCollection()
{
    // get the input
    var searchPhrase = $('#collection-search').val();

    // make sure that the input is non-null (else, show an alert)
    if (searchPhrase == '')
    {
        alert('Must search for something!');
        return;
    }

    // clear the past results (want to do this here instead of later, as you wouldn't want to clear the collections unnecessarily when opening the document)
    COLLECTION_OBJECTS.empty();

    // search blockdaemon for a collection using its name
    $.ajax({
        url: BLOCKDAEMON_API_BASE + 'collections/search',
        method: 'GET',
        data: {
            name: searchPhrase,
            apiKey: BLOCKDAEMON_API_KEY,
            page_size: 3,
            verified: true
        },
        success: function (response) {
            // format the collection data
            var collections = [];
            for (var i = 0; i < response.data.length; i += 1)
            {
                collections.push({
                    collection: {
                        address: response.data[i].contracts[0]
                    }
                });
            }

            // add the top 3 results to the page by calling addCollectionChoices
            addCollectionChoices(collections);
        }
    });

    return false;
}

// select a collection
async function selectCollection(address)
{
    // get all the collections
    var selections = COLLECTION_OBJECTS.find('a');

    // deselect the other seections
    for (var i = 0; i < selections.length; i += 1)
    {
        $(selections[i]).attr('class', 'tab-link')
    }

    // enable the selected
    var selected = COLLECTION_OBJECTS.find("a[collection-address='" + address + "']");
    selected.attr('class', 'tab-link active');

    // get the collection's available NFTs from LR
    getNFTsFromLR(address);

}

// function to get NFTs from looksrare
async function getNFTsFromLR(address)
{
    // clear all the existing nfts
    NFT_OBJECTS.empty();

    // call the looksrare API with the appropriate settings (should only show NFTs that can be pooled)
    $.ajax({
        url: LOOKSRARE_API_BASE + 'orders',
        method: 'GET',
        data: {
            isOrderAsk: true,
            collection: address,
            strategy: LOOKSRARE_BUY_NOW_STRATEGY,
            status: ['VALID'],
            pagination: {
                'first': NFT_LIMIT
            },
            sort: 'PRICE_ASC'
        },
        success: function (response) {
            console.log(response.data);
            if (response.data.length == 0)
            {
                // note that there are no NFTs
                alert('No NFTs eligible for search with selected collection.')
                return;
            }

            // format the data to the moralis standard
            var nfts = [];


            // add the nfts using the function


        }
    });
        // iterate over the NFTs and add them to the page
}

// loadNFTs function to be handled in the previous & next buttons
async function loadNFTs()
{
    // clear all nfts

    // get the correct collection

    // call getNFTsFromLR
}


// function to load the document
async function loadDocument()
{
    if (CHAIN_ID_INT == 1)
    {
        // clear the current collections
        COLLECTION_OBJECTS.empty();

        // get the top NFT collections from looksrare using AJAX
        $.ajax({
            url: LOOKSRARE_API_BASE + 'collections/listing-rewards',
            method: "GET",
            success: function (response) {
                addCollectionChoices(response.data.slice(0, 3));
            }
        });
    }

    // select the top collection on the page
}

loadDocument();
