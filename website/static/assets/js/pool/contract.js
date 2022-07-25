// check if there is a provider
if (window.ethereum == undefined)
{
    alert('Unable to connect to Web3 provider. Rerouting to home page...');
    location.href = '/';
}

// Refers to the Pool LR contract...
let POOL_CONTRACT_ADDRESS = '0xb0a5Cd92aeeebBc79C35f507d0c1513234E5Dca9';
let POOL_DATA_CONTRACT_ADDRESS = '0x603b2631228e2F9718dFC15521783Bdc977bD602';



// make contract
let POOL_CONTRACT = new ethers.Contract(POOL_CONTRACT_ADDRESS, POOL_CONTRACT_ABI, SIGNER);

let POOL_DATA_CONTRACT = new ethers.Contract(POOL_DATA_CONTRACT_ADDRESS, POOL_DATA_ABI, CONTRACT_PROVIDER);
