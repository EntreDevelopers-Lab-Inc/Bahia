// a function to get a pool's real contributions
async function totalContributions(poolId)
{
    // track total contributions
    var count = 0;

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
        poolContibution = ethers.utils.formatEther((await POOL_DATA_CONTRACT.getParticipant(poolId, i)).contribution);

        // NOTE: these weth allowances can be turned off if they slow down the frontend too much
        // get the participant's WETH allowance (see if they are still in the pool)
        wethAllowance = ethers.utils.formatEther(await WETH_CONTRACT.allowance(window.ethereum.selectedAddress, POOL_CONTRACT_ADDRESS));

        // get the participant's total WETH (make sure they can pay for it)
        wethBalance = ethers.utils.formatEther(await WETH_CONTRACT.balanceOf(window.ethereum.selectedAddress));

        // increment the count by the minimum of the three numebrs
        count += Math.min(poolContibution, wethAllowance, wethBalance);
    }

    // return the count
    return count;
}
