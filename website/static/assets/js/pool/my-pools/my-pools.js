// a function to edit set the weth contribution (when the pencil is clicked)
async function openSetWETHContribution()
{
    // switch the text to an input

    // switch the pencil to a check
}

// a function to close the total weth setter (when the check is clicked)
async function closeSetWETHContribution()
{
    // switch the check to a spinning ball

    // get the input data

    // call the weth contract to set the weth contribution
        // on success, revert back to text & replace the spinning ball with a pencil
        // on failure, revert spinning ball to check & alert on failure
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
function addParticipation(poolId, address)
{
    // query the chain: getParticipantIdFromAddress(poolId, address)
            // on success, query the chain: getParticipant(poolId, participantId)
                // on success, render mustache.js to show the row

    // any failures --> just add a popup that the eth node failed to get data for this pool id
}

// load the document
async function loadDocument()
{
    // get the weth contribution --> set it on the frontend

    // get all the pools from the backend
        // for each pool, query the smart contract (synchronous, iterative) for the participant
            // add a row to the table
}
