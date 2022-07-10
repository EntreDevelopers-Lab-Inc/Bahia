// check if there is a provider
if (window.ethereum == undefined)
{
    alert('Unable to connect to Web3 provider. Rerouting to home page...');
    location.href = '/';
}

// DAN FILLS THIS
let POOL_CONTRACT_ADDRESS = '';

// contract provider https://github.com/mikec3/my_tutorials/blob/master/simple_storage/src/SimpleStorage.js
let CONTRACT_PROVIDER = new ethers.providers.Web3Provider(window.ethereum, network=CHAIN_STRING);

// get the signer
let SIGNER = CONTRACT_PROVIDER.getSigner();

// make contract
let CONTRACT = new ethers.Contract(POOL_CONTRACT_ADDRESS, POOL_CONTRACT_ABI, SIGNER);
