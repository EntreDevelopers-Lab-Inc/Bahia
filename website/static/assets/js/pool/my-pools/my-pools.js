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

    // switch from text to input
}

async function closeSetter(poolId)
{
    // replace the edit with a spinning ball

    // get the input data

    // check that the weth contribution is sufficient
        // if not, set it up to the max (the amount in the input)

    // call the pool contract: setContract
        // on success, update the frontend
        // on failure, alert that it failed & replace the spinning ball with a check mark
}

// may be best to rewrite this to just query by participant address & pool id (will be more efficient on the fronted)
function addParticipation(poolId)
{
    // query the chain: getParticipantIdFromAddress(poolId, window.ethereum.selectedAddress)
    POOL_DATA_CONTRACT.getParticipantIdFromAddress(poolId, window.ethereum.selectedAddress).then(function (participantId) {
            // on success, query the chain: getParticipant(poolId, participantId)
            POOL_DATA_CONTRACT.getParticipant(poolId, participantId).then(function (resp) {
                // make the data for mustache to render
                var data = {

                };

                // render mustache.js to show the row

            });

                // after loading the row, call totalContributions, and set it on the frontend on success
    });



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
