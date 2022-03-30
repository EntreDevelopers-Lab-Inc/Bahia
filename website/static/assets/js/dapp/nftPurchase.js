// load moralis
Moralis.start({serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID});

async function getSaleData(purchaseHex)
{

    // store a variable for everything that will be set
    var purchaseHex;
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

    // get the transaction data
    await CONTRACT.transactions(parseInt(purchaseHex)).then(function (transaction) {
        // in order of the struct on the smart contract
        purchaseHex = transaction[0]._hex;
        expiration = transaction[1];
        nftId = transaction[2];
        cost = transaction[3];
        buyerAddress = transaction[4];
        sellerAddress = transaction[5];
        completed = transaction[6];
        collectionAddress = transaction[7];
    });


    // set the expiration
    expiration = new Date(expiration * 1000).toLocaleDateString({
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

    expired = (expiration < (Date.now() / 1000));

    // format the buyer address for the null address
    if (buyerAddress == NULL_ADDRESS)
    {
        buyerAddress = '(Any)';
    }
    else
    {
        buyerAddress = resp;
    }

    // save the completed bool
    completedBool = completed;

    // get the collection name from moralis (from the collection address and id)
    await Moralis.Web3API.token.getNFTMetadata({chain: CHAIN_ID_STR, address: collectionAddress, token_id: nftId}).then(function (resp) {

        // set the name
        name = resp.name + ' #' + nftId;
    });

    // set the approval
    var nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, SIGNER);
    await nftContract.getApproved(nftId).then(function (address) {
        // if the address is the sale contract, it is approved
        approved = (CONTRACT_ADDRESS == address);
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
        tradeAddress: purchaseHex,
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
