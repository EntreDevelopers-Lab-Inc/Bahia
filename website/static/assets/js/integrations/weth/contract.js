// check if there is a provider
if (window.ethereum == undefined)
{
    alert('Unable to connect to Web3 provider. Rerouting to home page...');
    location.href = '/';
}

if (CHAIN_ID_INT == 1)
{
    var WETH_CONTRACT_ADDRESS = '0x4f5704D9D2cbCcAf11e70B34048d41A0d572993F';
}
else if (CHAIN_ID_INT == 4)
{
    var WETH_CONTRACT_ADDRESS = '0xc778417e063141139fce010982780140aa0cd5ab';
}
else
{
    console.log('Chain not recognized, so do not expect WETH to work');
}

// make contract (will err out if on wrong chain, but not too worried about that)
let WETH_CONTRACT = new ethers.Contract(WETH_CONTRACT_ADDRESS, WETH_CONTRACT_ABI, SIGNER);

