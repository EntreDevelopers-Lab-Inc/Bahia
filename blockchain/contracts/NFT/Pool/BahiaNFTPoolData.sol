// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";
import "../../Bahia.sol";


contract BahiaNFTPoolData is
    IBahiaNFTPoolData,
    Bahia
{
    // events
    event PoolCreated(BahiaNFTPoolTypes.Pool newPool)

    // just a log of all the pools ever created
    BahiaNFTPoolTypes.Pool[] public pools;

    // mapping to track pool Id to participants
    mapping(uint256 => BahiaNFTPoolTypes.Participant[]) poolIdToParticipants;

    // ability to see pool count
    function getPoolCount() public view returns (uint256)
    {
        return pools.length;
    }

    // getter function for the pool
    function getPool(uint256 poolId) public view returns (BahiaNFTPoolTypes.Pool memory)
    {
        // if the pool id is greater than the total length, return an empty pool
        if (poolId >= getPoolCount())
        {
            return _blankPool();
        }
        // else return a real pool
        return pools[poolId];

    }

    // function to add a pool
    function addPool(BahiaNFTPoolTypes.Pool newPool) external onlyAllowed
    {
        pools.push(newPool);
    }

    // getter funtion to get the count of a pool's participants
    function getParticipantCount(uint256 poolId) external view returns (uint256)
    {
        return poolIdToParticipants[poolId].length;
    }

    // getter function to get a pool's participant (based on an index)
    function getParticipant(uint256 poolId, uint256 participantId) external view returns (BahiaNFTPoolTypes.Participant memory)
    {
        // if there is no matching participant, return a blank one
        if (participantId <= poolIdToParticipants[poolId].length)
        {
            return _blankParticipant();
        }

        // otherwise, return the participant
        return poolIdToParticipants[poolId][participantId];
    }

    // ability to add a participant to a pool
    function addParticipant(uint256 contribution) external onlyAllowed
    {

    }

    // empty pool
    function _blankPool() internal returns (BahiaNFTPoolTypes.Pool memory)
    {
        return (BahiaNFTPoolTypes.Pool memory BahiaNFTPoolTypes.Pool(0, address(0), 0, 0, 0, "", "", 0, address(0)));
    }

    // empty participant
    function _blankParticipant() internal returns (BahiaNFTPoolTypes.Participant memory)
    {
        return (BahiaNFTPoolTypes.Participant memory BahiaNFTPoolTypes.Participant(address(0), 0));
    }
}
