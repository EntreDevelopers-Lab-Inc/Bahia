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

    data['link'] = getIPFSLink(metadata.image);

    // render the template
    var newNft = Mustache.render(NFT_TEMPLATE, data);

    // add the nft to the objects
    NFT_OBJECTS.append(newNft);
}


// load the nfts
async function loadNFTs()
{
    // clear all nfts
    $('#nft-objects').empty();

    // get all the nfts from the moralis api
    Moralis.Web3API.account.getNFTs({address: window.ethereum.selectedAddress, chain: CHAIN_ID_STR, limit: NFT_LIMIT, offset: NFT_OFFSET}).then(function(resp) {

        // add each nft from the result
        var nfts = resp.result;

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

    }).catch((error) => {
        alert('You have requested too much data. Please wait and try again later.');
        console.log(error);
    });
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


// add a sale
async function addSale(purchaseHex, prepend=true)
{
    // track the button to disable
    var disableBtn = false;

    var data = await getSaleData(purchaseHex);

    // if there is no data, some issue existed in the getter, so just skip it
    if (data == undefined)
    {
        return;
    }

    // if the seller address is not the selected address, return
    if (data['sellerAddress'].toLowerCase() != window.ethereum.selectedAddress.toLowerCase())
    {
        // skip the sale
        return;
    }

    // set the approved string
    if (data['completedBool'])
    {
        data['approvedString'] = 'Completed';
        disableBtn = true;
    }
    else if (data['expired'])
    {
        data['approvedString'] = 'Expired';
        disableBtn = true;
    }
    else if (data['approved'])
    {
        data['approvedString'] = 'Cancel';
    }
    else
    {
        data['approvedString'] = 'Activate';
    }

    var newSale = Mustache.render($('#sale-template').html(), data);

    // prepend the body of the table
    if (prepend)
    {
        SALE_OBJECTS.prepend(newSale);
    }
    else
    {
        SALE_OBJECTS.append(newSale);
    }

    // disable the approved button
    if (disableBtn)
    {
        $('a[trade-address="' + data['tradeAddress'] + '"]').attr('class', 'btn btn-info btn-radius disabled');
    }
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
        await CONTRACT.sales(window.ethereum.selectedAddress, (saleCount - i - 1)).then(async function (txId) {
            // now, go add the sale
            await addSale(txId, prepend=false);
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
async function createSale()
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

    await CONTRACT.createTransaction(expTime, collectionAddress, nftId, cost, buyerAddress).then(async function (resp) {

        // call approve with the contract (directly, as the sale won't load for a while)
        var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);
        await nftContract.approve(CONTRACT_ADDRESS, nftId).then(function () {
          // get the row with the correct transaction address --> set the activate button to Cancel
        }).catch((error) => {
          alert('Contract approval encountered an error. Please reload the page and try again (see sales section at bottom).' + error.message);
        });

        // add the sale data
        await CONTRACT.saleCount(window.ethereum.selectedAddress).then(async function (length) {
              const addSaleData = await CONTRACT.sales(window.ethereum.selectedAddress, (length - 1)).then(async function (txId) {
                  // resp is an integer --> go add the sale
                  addSale(txId);

                  $('#sale-objects')[0].scrollIntoView();
              });
          });

        // close the modal
        toggleModal();

        // clear the form
        $('#sell-form')[0].reset();

        // put the button back
        $('#create-sale').show();
        $('#sale-loading').hide();
    }).catch((error) => {
      alert(error.message);

      // put the button back
      $('#create-sale').show();
      $('#sale-loading').hide();
    });

    return false;
}


// function to approve a transaction to occur
async function approve(purchaseId)
{
    // store the nft id and collection address
    var nftId;
    var collectionAddress;
    var purchaseHex;

    // get the purchase info
    await CONTRACT.transactions(purchaseId).then(function (resp) {
        purchaseHex = resp[0];
        nftId = resp[2];
        collectionAddress = resp[7];
    });

    // get the nft manager
     var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);

      const contractApproval = nftContract.approve(CONTRACT_ADDRESS, nftId).then(function (resp) {
          // change the button from unapproved to approved
          var approvedBtn = $('a[type="approval-btn"][trade-address="' + purchaseHex + '"]');
          approvedBtn.text('Cancel');
          approvedBtn.attr('approved', 'true');
      });

      contractApproval.catch((error) => {
          alert(error.message);
      })

}


// fuction to unapprove the contract
async function unapprove(purchaseId)
{
    // store the nft id
    var nftId;
    var collectionAddress;
    var purchaseHex;

    // get the nft id
    await CONTRACT.transactions(purchaseId).then(function (resp) {
        purchaseHex = resp[0];
        nftId = resp[2];
        collectionAddress = resp[7]
    });

    // get the nft manager
     var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);
      nftContract.approve(NULL_ADDRESS, nftId).then(function (resp) {
          // change the button from unapproved to approved
          var approvedBtn = $('a[type="approval-btn"][trade-address="' + contractAddress + '"]');
          approvedBtn.text('Activate');
          approvedBtn.attr('approved', 'false');
      });
}


// function to toggle approval
function toggleApproval(purchaseHex)
{
    // get the approval btn
    var approvedBtn = $('a[type="approval-btn"][trade-address="' + purchaseHex + '"]');

    // check the approval status
    var approved = (approvedBtn.attr('approved') == 'true');

    // if it is approved, unapprove it
    if (approved)
    {
        unapprove(purchaseHex);
    }
    // else, approve it
    else
    {
        approve(purchaseHex);
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

    loadNFTs();
    loadSales();
}

loadDocument();
