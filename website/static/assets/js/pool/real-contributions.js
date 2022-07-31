// a function to get a pool's real contributions
async function totalContributions(poolId, marketPrice=0)
{
    // track total contributions
    var count = 0;
    var cutoff = 1;

    // get the max participant Id
    var maxParticipantId = (await POOL_DATA_CONTRACT.getNumberOfParticipants(poolId)).toNumber();

    // make temporary variables for the difference options
    var poolContibution = 0;
    var wethAllowance = 0;
    var wethBalance = 0;
    
    // iterate over all the participants (can mess around with threading and waiting to make this faster if nexessary)
    for (var i = 1; i <= maxParticipantId; i += 1)
    {
        // get the participant's contribution to the pool
        poolContibution = (await POOL_DATA_CONTRACT.getParticipant(poolId, i)).contribution;
        // NOTE: these weth allowances can be turned off if they slow down the frontend too much
        // get the participant's WETH allowance (see if they are still in the pool)
        wethAllowance = await WETH_CONTRACT.allowance(window.ethereum.selectedAddress, POOL_CONTRACT_ADDRESS);
        // get the participant's total WETH (make sure they can pay for it)
        wethBalance = await WETH_CONTRACT.balanceOf(window.ethereum.selectedAddress);
        // increment the count by the minimum of the three numebrs
        count += Math.min(poolContibution, wethAllowance, wethBalance);

        // if the market price is non-zero and the count is greater than the pool contribution, set the participant cutoff
        if ((marketPrice != 0) && (count > marketPrice))
        {
            // set the participant cutoff
            cutoff = i;

            // set the market price to 0 to stop checking
            marketPrice = 0;
        }
    }

    var formattedCount = ethers.utils.formatEther(count.toString());

    // return the count
    return {contributions: formattedCount, cutoff: cutoff};
}
