// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";

error NoPoolFound();
error NotAllowed();
error NotParticipant();
error IncorrectParticipantId();

contract BahiaNFTPoolData is
    IBahiaNFTPoolData
{
    // events
    event PoolCreated(BahiaNFTPoolTypes.Pool newPool);
    event ParticipantAdded(uint256 poolId, BahiaNFTPoolTypes.Participant);
    event ContributionSet(uint256 poolId, BahiaNFTPoolTypes.Participant);

    // PoolIdz
    mapping(uint256 => BahiaNFTPoolTypes.Pool) public pools;

    // mapping to track pool Id to participants
    mapping(uint256 => BahiaNFTPoolTypes.Participant[]) public poolIdToParticipants;

    // allow certain contracts
    mapping(address => bool) private allowedContracts;

    uint256 private _currentIndex; 

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
        return _currentIndex;
    }

    // getter function for the pool
    function getPool(uint256 poolId) public view returns (BahiaNFTPoolTypes.Pool memory)
    {
        if (poolId >= _currentIndex) revert NoPoolFound();
        // else return a real pool
        return pools[poolId];
    }

    // function to add a pool
    function addPool(BahiaNFTPoolTypes.Pool memory newPool) external onlyAllowed
    {        
        newPool.poolId = _currentIndex;
        
        pools[_currentIndex] = newPool;

        _currentIndex++;

        emit PoolCreated(newPool);
    }

    // function to update a pool
    function updatePool(BahiaNFTPoolTypes.Pool memory _pool) external onlyAllowed
    {
        if (_pool.poolId >= _currentIndex) revert NoPoolFound();
        
        // set the pool 
        pools[_pool.poolId] = _pool;
    }

    // getter funtion to get the count of a pool's participants
    function getParticipantCount(uint256 poolId) external view returns (uint256)
    {
        return poolIdToParticipants[poolId].length;
    }

    // getter function to get a pool's participant (based on an index)
    function getParticipant(uint256 poolId, uint256 participantId) public view returns (BahiaNFTPoolTypes.Participant memory)
    {
        // otherwise, return the participant
        return poolIdToParticipants[poolId][participantId];
    }

    // ability to add a participant to a pool (allows another sequential bid)
    function addParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory newParticipant) external onlyAllowed
    {
        if (poolId >= _currentIndex) revert NoPoolFound();
        if(newParticipant.participantId != poolIdToParticipants[poolId].length) revert IncorrectParticipantId();

        // add the participant to the pool
        poolIdToParticipants[poolId].push(newParticipant);

        // emit that a new participant has been added
        emit ParticipantAdded(poolId, newParticipant);
    }

    // setter function to update participant information
    function setParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory participant) external onlyAllowed
    {
        // if there is no matching pool, return false
        if (poolId >= _currentIndex) revert NoPoolFound();

        // otherwise, set the participant
        // if no participant exists, the assignment will revert...
        poolIdToParticipants[poolId][participant.participantId] = participant;
    }


    // option to change contribution
    function setContribution(uint256 poolId, uint256 participantId, uint256 newContribution) external onlyAllowed
    {
        // check if the pool exists
        if (poolId >= _currentIndex) revert NoPoolFound();

        // get the participant
        BahiaNFTPoolTypes.Participant memory participant = poolIdToParticipants[poolId][participantId];

        // check that the participant is the transaction sender
        if (participant.participantAddress != tx.origin) revert NotParticipant();

        // set the contribution
        poolIdToParticipants[poolId][participantId].contribution = newContribution;

        // emit that the contribution has been set
        emit ContributionSet(poolId, participant);
    }

    // set the allowed permission
    function setAllowedPermission(address address_, bool permission_) external onlyAllowed
    {
        allowedContracts[address_] = permission_;
    }
}
