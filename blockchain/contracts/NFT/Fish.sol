// SPDX-License-Identifier: MIT

/**
 * @title fish contract
*/

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Fish is ERC721
{
    // keep track of the token count
    uint256 tokenCount;

    constructor() ERC721("Fish", "FSH") {}

    // make a function that safe mints to a caller
    function safeMint() external
    {
        // mint internally
        _safeMint(msg.sender, tokenCount);

        // increment the token count
        tokenCount += 1;
    }
}
