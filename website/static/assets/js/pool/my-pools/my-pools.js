const POOL_TEMPLATE = $('#pool-template').html()

// a function to edit set the weth contribution (when the pencil is clicked)
async function openSetWETHContribution()
{
    // fill the input with the correct data
    $('#total-contribution-input').val($('#total-weth-contribution').text());

    // switch the text to an input (just hide the data block & show the input block)
    $('#total-contribution-data-block').hide();
    $('#total-contribution-input-block').show();

}

// a function to revert the input back to the original (can be used when loading the document alsu)
async function getWETH()
{
    // switch the input to text
    $('#total-contribution-data-block').show();
    $('#total-contribution-input-block').hide();

    // call the weth contract and set the data appropriately
    WETH_CONTRACT.allowance(window.ethereum.selectedAddress, POOL_CONTRACT_ADDRESS).then(function (resp) {
        // set the pool allowance on the frontend
        $('#total-weth-contribution').text(ethers.utils.formatEther(resp));
    });
}

// a function to close the total weth setter (when the check is clicked)
async function closeSetWETHContribution()
{
    // get the check and spinnger
    var check = $('#total-contribution-input-block').find('.fa-check');
    var spinner = $('#total-contribution-input-block').find('.spinner-border');

    // switch the check to a spinning ball
    check.hide();
    spinner.show();

    // get the input data
    var newContribution = parseFloat(($('#total-contribution-input').val()));

    // make sure that the input is the appropriate
    var totalBalance = parseFloat(ethers.utils.formatEther(await WETH_CONTRACT.balanceOf(window.ethereum.selectedAddress)));

    if (newContribution > totalBalance)
    {
        alert('Your balance is ' + totalBalance + ' WETH. You cannot contribute ' + newContribution + ' WETH.');
        return;
    }
    else if (newContribution == parseFloat($('#total-weth-contribution').text()))
    {
        // just revert the block to normal
        // switch the input to text
        $('#total-contribution-data-block').show();
        $('#total-contribution-input-block').hide();

        // revert the spinner and check
        spinner.hide();
        check.show()

        return;
    }

    // call the weth contract to set the weth contribution (make sure it is stored in wei)
    await WETH_CONTRACT.approve(POOL_CONTRACT_ADDRESS, ethers.utils.parseEther(newContribution.toString())).then(function (resp) {
        // set the weth amount to the new contribution
        $('#total-weth-contribution').text(newContribution);

        // switch the input to text
        $('#total-contribution-data-block').show();
        $('#total-contribution-input-block').hide();

    }).catch(function (resp) {
        // alert the user
        alert('Error: ' + resp.message);
    });


    // revert the spinner and check
    spinner.hide();
    check.show()
}

// function to change the contribution from text to input
async function openSetter(poolId)
{
    // get the correct contribution tag
    var poolRow = $('tr[pool-id="' + poolId + '"]');
    var contributionData = poolRow.find('[name="contribution-data-block"]');
    var contributionInput = poolRow.find('[name="contribution-input-block"]');

    // fill the input with the correct amount
    contributionInput.find('input').val(contributionData.find('[name="contribution"]').text());

    // switch from text to input
    contributionData.hide();
    contributionInput.show();
}

async function closeSetter(poolId)
{
    // get the correct contribution tag
    var poolRow = $('tr[pool-id="' + poolId + '"]');
    var contributionData = poolRow.find('[name="contribution-data-block"]');
    var contributionInput = poolRow.find('[name="contribution-input-block"]');

    // get the check and spinning ball
    var check = poolRow.find('[class="fa fa-check"]');
    var spinner = poolRow.find('[class="spinner-border text-light"]');

    // hide the check, show the spinning ball (will be reverted at end of function)
    check.hide();
    spinner.show();

    // get the input data
    var newContribution = parseFloat(contributionInput.find('input').val());
    var participantId = poolRow.find('poolId').text();

    // get the weth balance
    var wethBalance = parseFloat(ethers.utils.formatEther(await WETH_CONTRACT.balanceOf(window.ethereum.selectedAddress)));

    // get the weth allowance
    var wethAllowance = parseFloat(ethers.utils.formatEther(await WETH_CONTRACT.allowance(window.ethereum.selectedAddress, POOL_CONTRACT_ADDRESS)));

    console.log(newContribution);
    console.log(wethAllowance);

    // if the input is the same as the old value, do nothing
    if (newContribution == parseFloat(contributionData.find('[name="contribution"]').text()))
    {
        // hide input, show data
        contributionInput.hide();
        contributionData.show();
    }
    // else if the input is 0, exit the pool
    else if (newContribution == 0)
    {
        POOL_DATA_CONTRACT.exitPool().then(function (resp) {
            // hide input, show data
            contributionInput.hide();
            contributionData.show();
        }).catch(function (resp) {
            alert(resp.message);
        });
    }
    // else if the contribution is greater than the weth balance, alert the user
    else if (newContribution > wethBalance)
    {
        alert('Cannot set a contribution of ' + newContribution + ' WETH, as your WETH balance is ' + wethBalance + ' WETH.');
    }
    // else if the contribution is more than the weth allowance, increase the weth allowance and then set hte contribution
    else if (newContribution > wethAllowance)
    {
        WETH_CONTRACT.approve(POOL_CONTRACT_ADDRESS, ethers.utils.parseEther(newContribution.toString())).then(function (resp) {
            // on success, set the contribution
            POOL_CONTRACT.setContribution(poolId, participantId, ethers.utils.parseEther(newContribution.toString())).then(function (resp) {
                // set the new contribution data number
                contributionData.find('[name="contribution"]').text(newContribution);

                contributionInput.hide();
                contributionData.show();
            });
        }).catch(function (resp) {
            // on error, alert that the user must increase their weth contributino
            alert('Error: ' + resp.message);
        });
    }
    // else, set the contribution
    else
    {
        // set the contribution on the pooling contract
        POOL_CONTRACT.setContribution(poolId, participantId, ethers.utils.parseEther(newContribution.toString())).then(function (resp) {
                // set the new contribution data number
                contributionData.find('[name="contribution"]').text(newContribution);

                contributionInput.hide();
                contributionData.show();
            });
    }

    // hide spinner, show check
    spinner.hide();
    check.show();

}

// function to execute a pool
async function execute(poolId)
{
    // call buyNow on smart contract
    POOL_CONTRACT.buyNow(poolId, makerAsk, minPercentageToAsk, params).then(function (resp) {
        // on success, update the frontend and show a message
        alert('Congratulations! You can view your shares of the pool on LooksRare or OpenSea (viewing shares on bahia is under development)');

        // disable the execute button

        // make the contribution non-editable
    });
}

// may be best to rewrite this to just query by participant address & pool id (will be more efficient on the fronted)
async function addParticipation(poolId)
{
    // get the pool data
    var pool = await POOL_DATA_CONTRACT.getPool(poolId);

    // get the nft information
    var nftData = await Moralis.Web3API.token.getTokenIdMetadata({chain: CHAIN_ID_STR, address: pool.collection, token_id: pool.nftId.toNumber()});

    // query the chain: getParticipantIdFromAddress(poolId, window.ethereum.selectedAddress)
    var participantId = (await POOL_DATA_CONTRACT.getParticipantIdFromAddress(poolId, window.ethereum.selectedAddress)).toNumber();
    var participant = await POOL_DATA_CONTRACT.getParticipant(poolId, participantId);

    // get the market price from looksrare
    var marketPrice;
    await $.ajax({
        url: LOOKSRARE_API_BASE + 'orders',
        method: 'GET',
        data: {
            isOrderAsk: true,
            collection: pool.collection,
            tokenId: nftData.token_id,
            strategy: LOOKSRARE_BUY_NOW_STRATEGY,
            status: ['VALID'],
            pagination: {'first': 1},
            sort: 'PRICE_DESC'
        },
        success: function (resp) {
            if (resp.data.length == 0)
            {
                marketPrice = 'N/A';
            }
            else
            {
                marketPrice = ethers.utils.formatEther(resp.data[0].price);
            }
        }
    });

    // format the mustache information
    var data = {
        uri: nftData.token_uri,
        name: nftData.name + ' #' + nftData.token_id,
        poolId: poolId,
        marketPrice: marketPrice,
        poolCap: ethers.utils.formatEther(pool.maxContributions),
        totalShares: pool.shareSupply.toNumber().toLocaleString('en-US'),
        participantId: participantId,
        lrLink: LOOKSRARE_BASE + pool.collection + '/' + pool.nftId
        // funding will be set later, so don't worry about it
    }

    // make a new row
    var newRow = Mustache.render(POOL_TEMPLATE, data);

    // prepend the new row to the table
    $('#sale-objects').prepend(newRow);

    // get the pool row by pool id
    var poolRow = $('tr[pool-id="' + poolId + '"]');
    var contributionTag = poolRow.find('[name="contribution"]');
    var fundingTag = poolRow.find('[name="funding"]');

    // if the pool is completed, just show that it is fully funded
    if (pool.completed)
    {
        fundingTag.text('[FULLY FUNDED]');
        contributionTag.text(participant.paid);
    }
    // else, show the total contributions
    else
    {
        // get the total contributions --> whenever it finishes, update it on the frontend
        totalContributions(poolId).then(function (resp) {
            // if the participant id is less than or equal to the cutoff, set the contribution to the correct amount
            if (participantId <= resp.cutoff)
            {
                contributionTag.text(ethers.utils.formatEther(participant.contribution));
            }
            // else, note that the pool has been "outfunded" (will need to explain this)
            else
            {
                contributionTag.text('[OUTFUNDED AT TICKET # ' + resp.cutoff + ']');
            }

            // set the funding
            fundingTag.text(resp.contributions);

            // enable the execute button IF there is sufficient funding
            if (resp.contributions >= parseFloat(poolRow.find('[name="marketPrice"]').text()))
            {
                poolRow.find('[name="execute-btn"]').attr('class', 'btn btn-info btn-radius');;
            }
        });
    }


    // any failures --> just add a popup that the eth node failed to get data for this pool id
}

// load the document
async function loadDocument()
{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let currentBlock = await provider.getBlockNumber();

    // get the weth contribution --> set it on the frontend
    getWETH();

    // get all the pools from the backend
    $.ajax({
        url: API_BASE + 'pool/Participation',
        method: 'GET',
        headers: {
            address: window.ethereum.selectedAddress
        },
        success: function(resp) {
            // iterate over the pools
            for (var i = 0; i < resp.data.length; i += 1)
            {
                // add each participation
                addParticipation(resp.data[i].pool_id);
            }
        }
    });
        // for each pool, query the smart contract (synchronous, iterative) for the participant
            // add a row to the table
}

loadDocument();
