// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

library BahiaNFTPoolTypes {
    // pool data
    struct Pool {
        uint256 poolId;  // self-aware
        address collection;
        uint256 nftId;
        uint256 approvalPercent;  // out of 100,000 --> amount to raise bid (for fractional.art)
        uint256 maxContributions;  // limits NFT owner from manipulating markets
        string shareName;  // fractional art
        string shareSymbol;  // fractional art
        uint256 startListPrice;  // fractional art

        address creator; // make sure that the creator is recognized
    }

    // participant data
    struct Participant {
        address participantAddress;
        uint256 totalContribution;  // this will be set to allow the user to manage their contribution to the pool
    }
}
