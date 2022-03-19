// SPDX-License-Identifier: MIT

/**
 * @title agua contract
*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Agua is ERC20
{
    constructor() ERC20("Agua", "AA")
    {

    }
}
