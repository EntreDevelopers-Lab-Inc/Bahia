// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";
import "../../Bahia.sol";


contract BahiaNFTPoolData is
    IBahiaNFTPoolData,
    Bahia
{
    // events
    event PoolCreated(Pool newPool)

    // just a log of all the pools ever created
    Pool[] public pools;

    // function
}
