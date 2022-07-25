// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

library BahiaNFTPoolTypes {
    // pool data
    struct Pool {
        uint256 poolId;  // self-aware
        uint256 nftId;
        uint256 maxContributions;  // limits NFT owner from manipulating markets

        uint256 shareSupply;  // fractional art
        
        address collection;
        address creator; // make sure that the creator is recognized
        bool completed;
        uint256 endPurchasePrice;  // logs what the contract was executed at

        uint256 vaultId;  // the id of the fractional art vault (necessary to claim shares)
        uint256 nextParticipantId; // keeps track of size of the pool / the id of the next participant
    }

    // participant data
    struct Participant {
        uint256 participantId;  // self-aware
        address participantAddress;
        uint256 contribution;  // this will be set to allow the user to manage their contribution to the pool
        uint256 paid;  // logs how much of the contribution purchase price has been paid
    }
}
