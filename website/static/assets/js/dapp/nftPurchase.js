// disable file transfers
Moralis.Cloud.beforeSaveFile((request) => {
  throw "Not Allowed";
});

// load moralis
Moralis.start({serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID});

async function getSaleData(contractAddress)
{

    // store a variable for everything that will be set
    var name;
    var cost;
    var expiration;
    var expired;
    var sellerAddress;
    var buyerAddress;
    var collectionAddress;
    var completed;
    var completedBool;
    var approved;
    var nftId;
    var approvedString;

    // make a sale contract
    var saleContract = new ethers.Contract(contractAddress, PURCHASE_CONTRACT_ABI, SIGNER);

    // get the public sale information and display it
    await saleContract.cost().then(function (resp) {
        cost = resp;
    });

    await saleContract.expirationTime().then(function (resp) {
        expiration = new Date(resp * 1000).toLocaleDateString({
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

        expired = (resp < (Date.now() / 1000));
    });

    await saleContract.buyerAddress().then(function (resp) {
        if (resp == NULL_ADDRESS)
        {
            buyerAddress = '(Any)';
        }
        else
        {
            buyerAddress = resp;
        }
    });

    await saleContract.sellerAddress().then(function (resp) {
        sellerAddress = resp;
    });

    await saleContract.nftManager().then(function (resp) {
        collectionAddress = resp;
    });

    await saleContract.nftId().then(function (resp) {
        nftId = resp;
    });

    await saleContract.completed().then(function (resp) {
        completedBool = resp;
        completed = resp;
    });

    // get the collection name from moralis (from the collection address and id)
    await Moralis.Web3API.token.getNFTMetadata({chain: CHAIN_ID_STR, address: collectionAddress, token_id: nftId}).then(function (resp) {

        // set the name
        name = resp.name + ' #' + nftId;
    });

    // set the approval
    var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);
    await nftContract.getApproved(nftId).then(function (address) {
        // if the address is the sale contract, it is approved
        approved = (contractAddress == address);
    });

    // set the completed information
    if (completed)
    {
        completed = '[COMPLETED]';
    }
    else
    {
        completed = '[INCOMPLETE]';
    }

    // add some logic to toggle activity
    // figure out if this is active --> just if it is approved --> set if it is active
    var activityString;
    var active;
    if (!completedBool && approved && !expired)
    {
        activityString = '[ACTIVE]'
        active = true;
    }
    else
    {
        activityString = '[INACTIVE]'
        active = false;
    }


    // render the template
    data = {
        name: name,
        cost: ethers.utils.formatEther(cost) + ' ETH',
        expiration: expiration,
        expired: expired,
        sellerAddress: sellerAddress,
        buyerAddress: buyerAddress,
        tradeAddress: contractAddress,
        collectionAddress: collectionAddress,
        nftId: nftId,
        completed: completed,
        completedBool: completedBool,
        approved: approved,
        activityString: activityString,
        active: active
    };

    return data;
}
