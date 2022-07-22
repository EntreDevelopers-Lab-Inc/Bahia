const COLLECTION_TEMPLATE = $('#collection-template').html();
var COLLECTION_OBJECTS = $('#collection-objects');

// add a collection choice
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
                startTime: LR_ORIGIN_TIME,
                endTime: parseInt((Date.now() / 1000)).toString(),
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
        // use ajax to get a collection image (await it for synchronous operation)
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
async function addCollectionsChoices(choices)
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
            verified: true
        },
        success: function (response) {
            console.log(response);
            // add the top 3 results to the page by calling addCollectionChoices
        }
    });

    return false;
}

// select a collection
async function selectCollection(address)
{
    // highlight the appropriate collection

    // clear the existing NFTs

    // get the collection's available NFTs from LR

}

// function to get NFTs from looksrare
async function getNFTsFromLR(address)
{
    // call the looksrare API with the appropriate settings (should only show NFTs that can be pooled)
        // iterate over the NFTs and add them to the page
}


// reformat an NFT from looksrare (synchronous, as it returns something for other functions)
function reformatNFTFromLR(data)
{
    // take data, reformat it

    // return the data
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
    // get the top NFT collections from looksrare using AJAX
    $.ajax({
        url: LOOKSRARE_API_BASE + 'collections/listing-rewards',
        method: "GET",
        success: function (response) {
            addCollectionsChoices(response.data.slice(0, 3));
        }
    });

        // add each collection to the page using mustache

    // select the top collection on the page
}

loadDocument();
