// SPDX-License-Identifier: MIT

/**
 * @title fish contract
*/

pragma solidity ^0.8.12;

import "@chiru-labs/contracts/ERC721A.sol";

contract Fish is ERC721A
{
    // keep track of the token count
    uint256 tokenCount;

    constructor() ERC721A("Fish", "FSH") {}

    // make a function that safe mints to a caller
    function safeMint(uint256 quantity) external
    {
        // mint internally
        _safeMint(msg.sender, quantity);

        // increment the token count
        tokenCount += 1;
    }

    // set the base uri --> just use the azuki one
    function _baseURI() internal view virtual override returns (string memory)
    {
        return 'https://ikzttp.mypinata.cloud/ipfs/QmQFkLSQysj94s5GvTHPyzTxrawwtjgiiYS2TBLgrvw8CW/';
    }
}
