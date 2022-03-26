let CURRENT_ACCOUNT = null;

// set the chain
async function setChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_STR }],
      });

    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_ID_STR,
                chainName: '...',
                rpcUrls: ['https://...'] /* ... */,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
}

// function for setting the button name
async function setButtonName()
{
  var name;
  var start;
  var end;

  start = window.ethereum.selectedAddress.substr(0, 5);
  end = window.ethereum.selectedAddress.substr(window.ethereum.selectedAddress.length - 5);
  name = start + '...' + end;


  $('#connect-btn').text(name);
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

// While you are awaiting the call to eth_requestAccounts, you should disable
// any buttons the user can click to initiate the request.
// MetaMask will reject any additional requests while the first is still
// pending.
function connect() {
  if (window.ethereum == undefined)
  {
    alert('No wallet found,.')
    return;
  }

  // window.ethereum.enable();
  window.ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        alert('Please connect wallet.');
      } else {
        alert(err);
      }
    });

    setChain();
}


// For now, 'eth_accounts' will continue to always return an array
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts

    // show the connect button
    $('#connect-btn').show();

  } else if (accounts[0] !== CURRENT_ACCOUNT) {
    CURRENT_ACCOUNT = accounts[0];

    setButtonName()
  }
}

async function handleChainChanged(_chainId) {
    await setChain();

  // We recommend reloading the page, unless you must do otherwise
  window.location.reload();
}


// make a document load function
async function loadDocument() {
    // hide the conenct wallet button if the user is already logged in
    if (window.ethereum.selectedAddress != null)
    {
      setButtonName();
    }

    // prompt the user to change their chain if it is incorrect
    if (window.ethereum.chainId != CHAIN_STRING)
    {
      setChain();
    }
}

// load the document
loadDocument();
