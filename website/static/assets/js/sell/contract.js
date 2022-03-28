// contract provider https://github.com/mikec3/my_tutorials/blob/master/simple_storage/src/SimpleStorage.js
let CONTRACT_PROVIDER = new ethers.providers.Web3Provider(window.ethereum, network=CHAIN_STRING);

// contract address with (currently a test one)
const CONTRACT_ADDRESS = '0xEe4B5c343AB681ad72b09F8fff1bEF8afE0EC2D7';

// get the signer
let SIGNER = CONTRACT_PROVIDER.getSigner();

// make contract
let CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, SIGNER);
