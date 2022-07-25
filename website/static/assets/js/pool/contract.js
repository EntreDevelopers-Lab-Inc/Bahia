// check if there is a provider
if (window.ethereum == undefined)
{
    alert('Unable to connect to Web3 provider. Rerouting to home page...');
    location.href = '/';
}

// Refers to the Pool LR contract...
let POOL_CONTRACT_ADDRESS = '0xa9C724F1b8E6df078b03FF0dcB90d21f95456611';
let POOL_DATA_CONTRACT_ADDRESS = '0x603b2631228e2F9718dFC15521783Bdc977bD602'

// make contract
let POOL_CONTRACT = new ethers.Contract(POOL_CONTRACT_ADDRESS, POOL_CONTRACT_ABI, SIGNER);

let POOL_DATA_CONTRACT = new ethers.Contract(POOL_DATA_CONTRACT_ADDRESS, POOL_DATA_ABI, CONTRACT_PROVIDER);
