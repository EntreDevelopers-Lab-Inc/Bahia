// SPDX-License-Identifier: MIT

/**
 * @title invoice interfaces for Bahia
*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface BasicDataInterface
{
    // make an invoice struct
    struct Invoice {
        string name;
        address providerAddress;
        address clientAddress;
        address tokenAddress;  // for making isPaid a public view function in the milestone

        // keep track of all the milestone contracts
        address[] milestones;  // will need to push to this later

        // use an IERC20 as the currency
        IERC20 token;

        // keep the invoice id
        uint256 id;
    }
}
