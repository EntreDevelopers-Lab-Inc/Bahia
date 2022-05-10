// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";
import "../../Bahia.sol";


contract BahiaNFTPoolData is
    IBahiaNFTPoolData
{
    // events
    event PoolCreated(BahiaNFTPoolTypes.Pool newPool);
    event ParticipantAdded(uint256 poolId, BahiaNFTPoolTypes.Participant);
    event ContributionSet(uint256 poolId, BahiaNFTPoolTypes.Participant);

    // just a log of all the pools ever created
    BahiaNFTPoolTypes.Pool[] public pools;

    // mapping to track pool Id to participants
    mapping(uint256 => BahiaNFTPoolTypes.Participant[]) poolIdToParticipants;

    // allow certain contracts
    mapping(address => bool) internal allowedContracts;

    constructor()
    {
        allowedContracts[msg.sender] = true;
    }

    // a modifier that allows contracts to access
    modifier onlyAllowed()
    {
        if (!allowedContracts[msg.sender]) revert NotAllowed();
        _;
    }


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
    function addPool(BahiaNFTPoolTypes.Pool memory newPool) external onlyAllowed
    {
        pools.push(newPool);

        emit PoolCreated(newPool);
    }

    // getter funtion to get the count of a pool's participants
    function getParticipantCount(uint256 poolId) external view returns (uint256)
    {
        return poolIdToParticipants[poolId].length;
    }

    // getter function to get a pool's participant (based on an index)
    function getParticipant(uint256 poolId, uint256 participantId) public returns (BahiaNFTPoolTypes.Participant memory)
    {
        // if there is no matching participant, return a blank one
        if (participantId <= poolIdToParticipants[poolId].length)
        {
            return _blankParticipant();
        }

        // otherwise, return the participant
        return poolIdToParticipants[poolId][participantId];
    }

    // ability to add a participant to a pool (allows another sequential bid)
    function addParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory newParticipant) external onlyAllowed returns (bool)
    {
        // check if the pool exists
        if (poolId >= getPoolCount())
        {
            return false;
        }

        // add the participant to the pool
        poolIdToParticipants[poolId].push(newParticipant);

        // emit that a new participant has been added
        emit ParticipantAdded(poolId, newParticipant);

        // return that the participant has been added
        return true;
    }

    // setter function to update participant information
    function setParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory participant) external onlyAllowed returns (bool)
    {
        // if there is no matching pool, return false
        if (poolId >= getPoolCount())
        {
            return false;
        }
        // if there is no matching participant, return false
        else if (participant.participantId <= poolIdToParticipants[poolId].length)
        {
            return false;
        }

        // otherwise, set the participant
        poolIdToParticipants[poolId][participant.participantId] = participant;

        // return true for success
        return true;
    }


    // option to change contribution
    function setContribution(uint256 poolId, uint256 participantId, uint256 newContribution) external onlyAllowed returns (bool)
    {
        // check if the pool exists
        if (poolId >= getPoolCount())
        {
            return false;
        }

        // get the participant
        BahiaNFTPoolTypes.Participant memory participant = poolIdToParticipants[poolId][participantId];

        // check that the participant is the transaction sender
        if (participant.participantAddress != tx.origin)
        {
            return false;
        }

        // set the contribution
        participant.contribution = newContribution;

        // emit that the contribution has been set
        emit ContributionSet(poolId, participant);

        // return that the contribution has been set
        return true;
    }

    // empty pool
    function _blankPool() internal pure returns (BahiaNFTPoolTypes.Pool memory)
    {
        BahiaNFTPoolTypes.Pool memory blankPool = BahiaNFTPoolTypes.Pool(0, address(0), 0, 0, 0, "", "", 0, address(0), false, 0, 0);
        return blankPool;
    }

    // empty participant
    function _blankParticipant() internal pure returns (BahiaNFTPoolTypes.Participant memory)
    {
        BahiaNFTPoolTypes.Participant memory blankParticipant = BahiaNFTPoolTypes.Participant(0, address(0), 0, 0);
        return blankParticipant;
    }
}
