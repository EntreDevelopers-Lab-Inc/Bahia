// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";


interface IBahiaNFTPoolData {
    // pool data
    struct Pool {
        uint256 poolId;  // self-aware
        address collection;
        uint256 nftId;
        uint256 approvalPercent;  // out of 100,000 --> amount to raise bid (for fractional.art)
        uint256 maxPrice;  // limits NFT owner from manipulating markets
        string shareName;  // fractional art
        string shareSymbol;  // fractional art
        uint256 startListPrice;  // fractional art

        address creator; // make sure that the creator is recognized
    }

    // getter function for the pool
    function getPool(uint256 poolId) external;

    // function to add a pool
    function addPool(Pool newPool) external;
}
