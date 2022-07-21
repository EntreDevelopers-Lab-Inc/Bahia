// add a collection choice (want this to be sequential to maintain structure)
function addCollectionChoice(data)
{
    // use mustache to render the data from the collection choice
}

// add many collection choices --> can be used when loading the document and searching collections (just writing a for loop once instead of twice)
async function addCollectionsChoices(choices)
{
    // iterate over all the choices and call add collection choice
    for (var i = 0; i < choices.length; i += 1)
    {
        addCollectionChoice(choices[i]);
    }
}

// show the collection's NFTs
async function showCollectionNFTs(nfts)
{
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

    // make sure that the input is non-null (else, show an alert)

    // clear the past results (want to do this here instead of later, as you wouldn't want to clear the collections unnecessarily when opening the document)

    // search blockdaemon for a collection using its name
        // add the top 3 results to the page by calling addCollectionChoices
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

        // add each collection to the page using mustache

    // select the top collection on the page
}
