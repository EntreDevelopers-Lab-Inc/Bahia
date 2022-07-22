// check if there is a provider
if (window.ethereum == undefined)
{
    alert('Unable to connect to Web3 provider. Rerouting to home page...');
    location.href = '/';
}

// Refers to the Pool LR contract...
let POOL_CONTRACT_ADDRESS = '0xb2a852e33Ff6D3720DFEdABa65A7788E035898ce';
let POOL_DATA_CONTRACT_ADDRESS = '0xB6aeec41C517790177420C4C33A61a130D773348'

// make contract
let POOL_CONTRACT = new ethers.Contract(POOL_CONTRACT_ADDRESS, POOL_CONTRACT_ABI, SIGNER);

let POOL_DATA_CONTRACT = new ethers.Contract(POOL_DATA_CONTRACT_ADDRESS, POOL_DATA_ABI, CONTRACT_PROVIDER);


