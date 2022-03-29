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


// synchronous function for adding an nft (will want to do this sequentially to maintain structure for the user)
function addNFT(data)
{
    // add the link
    var metadata = JSON.parse(data.metadata);

    data['link'] = metadata.image;

    // render the template
    var newNft = Mustache.render(NFT_TEMPLATE, data);

    // add the nft to the objects
    NFT_OBJECTS.append(newNft);
}


// load the nfts
async function loadNFTs()
{
    // get all the nfts from the moralis api
    Moralis.Web3API.account.getNFTs({address: window.ethereum.selectedAddress, chain: CHAIN_ID_STR, limit: NFT_LIMIT, offset: NFT_OFFSET}).then(function(resp) {
        // add each nft from the result
        var nfts = resp.result;

        // iterate over the nfts and add them to the list
        for (var i = 0; i < nfts.length; i += 1)
        {
            addNFT(nfts[i]);
        }

        // increment the offset
        NFT_OFFSET += 1;
    });
}


// add a sale
async function addSale(contractAddress)
{
    var data = await getSaleData(contractAddress);

    var newSale = Mustache.render($('#sale-template').html(), data);

    // prepend the body of the table
    SALE_OBJECTS.prepend(newSale);
}

// load the past sales
async function loadSales()
{
    var saleCount = 0;

    // get the length of the number of sales
    await CONTRACT.saleCount(window.ethereum.selectedAddress).then(function (resp) {
        // set the sale count
        saleCount = resp;
    });

    // fill the list with the relevant information
    for (var i = 0; i < saleCount; i += 1)
    {
        // get each sale from the contract and add it (must be awaited, as these are sequential)
        await CONTRACT.sales(window.ethereum.selectedAddress, i).then(function (txId) {
            // resp is an integer --> go get the actual address of the transaction
            CONTRACT.transactions(txId).then(function (address) {
                // now, go add the sale
                addSale(address);
            });
        });
    }
}


// select an nft (cannot be asynchronous because other data depends on it)
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
    saleData['address'] = address;
    saleData['id'] = id;
    saleData['name'] = selected.text();  // for the modal
}


// create a sale
function createSale()
{
    // get all the information necessary for the sale from the frontend
    var expTime = Date.parse($('#date').val()) / 1000;  // originally in miliseconds --> need seconds for eth evmx
    var collectionAddress = saleData['address'];
    var nftId = saleData['id'];
    var cost = $('#cost').val();
    var buyerAddress = $('#buyer-address').val();

    // if there is no collection address or nftId, need to alert so
    if ((collectionAddress == undefined) || (nftId == undefined))
    {
        alert('Must select NFT');
        return;
    }

    // if the cost is < 0, return (need to convert from null)
    if (!Boolean(parseFloat(cost)))
    {
        alert('Must sell nft for more than 0 ETH.')
        return;
    }
    else
    {
        // covert eth to gwei
        cost = ethers.utils.parseEther(cost);
    }

    // if there is no date, alert so
    if (!Boolean(parseInt(expTime)))
    {
        alert('Must set expiration time.');
        return;
    }

    // set the buyer to null if there is no value
    if (buyerAddress == '')
    {
        // set the buyer to null
        buyerAddress = NULL_ADDRESS;
    }
    // else, check if the buyer exists
    else if (!ethers.utils.isAddress(buyerAddress))
    {
        alert('Invalid Buyer Address: ' + buyerAddress);
        return;
    }

    // remove the button and add a spinning icon
    $('#create-sale').hide();
    $('#sale-loading').show();

    // create a transaction
    var tradeAddress;
    CONTRACT.createTransaction(expTime, collectionAddress, nftId, cost, buyerAddress).then(function (txResp) {

        // add the sale to the log
        CONTRACT.saleCount(window.ethereum.selectedAddress).then(function (length) {
            CONTRACT.sales(window.ethereum.selectedAddress, (length - 1)).then(function (txId) {
                // resp is an integer --> go get the actual address of the transaction
                CONTRACT.transactions(txId).then(function (address) {
                    // save the trade address
                    tradeAddress = address;

                    // now, go add the sale
                    addSale(address);

                    // call approve with the erc721 contract
                    approve(tradeAddress);

                    // close the modal
                    toggleModal();

                    // clear the form
                    $('#sell-form')[0].reset();

                    // put the button back
                    $('#create-sale').show();
                    $('#sale-loading').hide();
                });
            });
        });


    });

    // get the number of transactions
    // add the new sale the transaction log --> use prepend
    return false;
}


// function to approve a transaction to occur
async function approve(contractAddress)
{
    // store the nft id
    var nftId;

    // get the purchase contract
    var saleContract = new ethers.Contract(contractAddress, PURCHASE_CONTRACT_ABI, SIGNER);

    // get the nft id
    await saleContract.nftId().then(function (id) {
        nftId = id;
    });

    // get the nft manager
    saleContract.nftManager().then(function (collectionAddress) {
       var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);
        nftContract.approve(contractAddress, nftId).then(function (resp) {
            // change the button from unapproved to approved
            var approvedBtn = $('a[type="approval-btn"][trade-address="' + contractAddress + '"]');
            approvedBtn.text('Cancel');
            approvedBtn.attr('approved', 'true');
        });
    });

}


// fuction to unapprove the contract
async function unapprove(contractAddress)
{
    // store the nft id
    var nftId;

    // get the purchase contract
    var saleContract = new ethers.Contract(contractAddress, PURCHASE_CONTRACT_ABI, SIGNER);

    // get the nft id
    await saleContract.nftId().then(function (id) {
        nftId = id;
    });

    // get the nft manager
    saleContract.nftManager().then(function (collectionAddress) {
       var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);
        nftContract.approve(NULL_ADDRESS, nftId).then(function (resp) {
            // change the button from unapproved to approved
            var approvedBtn = $('a[type="approval-btn"][trade-address="' + contractAddress + '"]');
            approvedBtn.text('Activate');
            approvedBtn.attr('approved', 'false');
        });
    });
}


// function to toggle approval
function toggleApproval(contractAddress)
{
    // get the approval btn
    var approvedBtn = $('a[type="approval-btn"][trade-address="' + contractAddress + '"]');

    // check the approval status
    var approved = (approvedBtn.attr('approved') == 'true');

    // if it is approved, unapprove it
    if (approved)
    {
        unapprove(contractAddress);
    }
    // else, approve it
    else
    {
        approve(contractAddress);
    }

}


// copy something to the clipboard
async function copyAddress(address)
{
    /* Get the text field */
    var copyText = document.querySelectorAll('span[trade-address="' + address + '"]');

    // copy it to the clipboard
    navigator.clipboard.writeText(copyText[0].textContent);

    // change the icon
    $('i[trade-address="' + address + '"]').attr('class', 'fa fa-check');

    // wait 3 seconds
    await delay(3000)

    // change the icon back to what it should be
    $('i[trade-address="' + address + '"]').attr('class', 'fa fa-copy');
}


// show modal
function showSellModal()
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


// load document function
function loadDocument()
{
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

    loadNFTs();
    loadSales();
}

loadDocument();
