// SPDX-License-Identifier: MIT

/**
 * @title invoice for Bahia
*/

import "../interfaces/InvoiceInterface.sol";
import "./Milstone.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

contract Invoice is InvoiceInterface
{
    address[] storage public milestoneAddresses;  // will need to push to this later

    address public providerAddress;
    address public clientAddress;
    address public bahiaAddress;  // for getting the global dev address and royalty

    // allow/disallow anyone to pay
    bool freepay;

    // use an IERC20 as the currency
    IERC20 public token;

    constructor(address providerAddress_, address clientAddress_, address bahiaAddress, IERC20 token_)
    {
        providerAddress = providerAddress_;
        clientAddress = clientAddress_;
        bahiaAddress = bahiaAddress_;
        token = token_;
    }
}
