// load the sale tempalte and objects
const SALE_TEMPLATE = '';
var SALE_OBJECTS = $('#sale-objects');

// loading information from moralis --> keep with get call
var getcall;

// load the nfts
async function loadNFTs()
{
    // clear all nfts
    $('#nft-objects').empty();

    if (NFT_OFFSET == 0)
    {
        getCall = await Moralis.Web3API.account.getNFTs({address: window.ethereum.selectedAddress, chain: CHAIN_ID_STR, limit: NFT_LIMIT});
    }
    else
    {
        getCall = await getCall.next();
    }

    // add all the nfts
    addAllNFTs(getCall.result);
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

// create a sale
async function createSale()
{
    // get all the information necessary for the sale from the frontend
    var expTime = Date.parse($('#date').val()) / 1000;  // originally in miliseconds --> need seconds for eth evmx
    var collectionAddress = nftData['address'];
    var nftId = nftData['id'];
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
    if (nftData['name'] == undefined)
    {
        alert('Must select an NFT to sell first');
        return;
    }

    // set the name
    $('#sell-nft-name').text(nftData['name'])

    // set the collection address
    $('#sell-nft-collection-address').text(nftData['address']);

    // set the etherscan
    $('#sell-nft-etherscan').attr('href', ETHERSCAN_BASE + nftData['address']);

    // set the looksrare
    $('#sell-nft-looksrare').attr('href', LOOKSRARE_BASE + nftData['address']);

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
