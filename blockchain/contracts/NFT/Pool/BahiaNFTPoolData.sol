// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";

error NoPoolFound();
error NotAllowed();
error NotParticipant();
error IncorrectParticipantId();
error IncorrectPoolId();

contract BahiaNFTPoolData is
    IBahiaNFTPoolData
{
    // events
    event PoolCreated(BahiaNFTPoolTypes.Pool newPool);
    event ParticipantAdded(uint256 poolId, BahiaNFTPoolTypes.Participant);
    event ContributionSet(uint256 poolId, uint256 participantId);

    // PoolIdz
    mapping(uint256 => BahiaNFTPoolTypes.Pool) public pools;

    // mapping of mapping to track pool Id to participants
    // poolId => participantId => participant
    mapping(uint256 => mapping(uint256 => BahiaNFTPoolTypes.Participant)) public poolIdToParticipants;

    // poolId => address => participantId
    mapping(uint256 => mapping(address => uint256)) public addressToParticipantId;

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
        if (newPool.poolId != _currentIndex) revert IncorrectPoolId();
        
        pools[_currentIndex] = newPool;

        unchecked { _currentIndex++; }

        emit PoolCreated(newPool);
    }

    // function to update a pool
    function updatePool(BahiaNFTPoolTypes.Pool memory _pool) external onlyAllowed
    {
        if (_pool.poolId >= _currentIndex) revert NoPoolFound();
        
        // set the pool 
        pools[_pool.poolId] = _pool;
    }

    // getter funtion to get the nextParticipantId of a pool
    function getNextParticipantId(uint256 poolId) external view returns (uint256)
    {
        return pools[poolId].nextParticipantId;
    } 


    // Adjusted by 1 considering all pool.count are indexed @ 1 
    function getNumberOfParticipants(uint256 poolId) external view returns(uint256) {
       return pools[poolId].nextParticipantId - 1; 
    }

    // getter function to get a pool's participant (based on an index)
    function getParticipant(uint256 poolId, uint256 participantId) public view returns (BahiaNFTPoolTypes.Participant memory)
    {    
        // Return the participant; 
        // Since participantIDs are indexed @ 1 and mappings are indexed @ 0, need to add 1 to the participantId
        return poolIdToParticipants[poolId][participantId];
    }

    function getParticipantIdFromAddress(uint256 poolId, address _address) external view returns (uint256) {
        return addressToParticipantId[poolId][_address];
    }

    // ability to add a participant to a pool (allows another sequential bid)
    function addParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory newParticipant) external onlyAllowed
    {
        if (poolId >= _currentIndex) revert NoPoolFound();
        if(newParticipant.participantId != pools[poolId].nextParticipantId) revert IncorrectParticipantId();

        // add the participant to the pool
        poolIdToParticipants[poolId][newParticipant.participantId] = newParticipant;
         
        // update addressToParticipantId
        // must be tx.origin since msg.sender will always be another contract...
        addressToParticipantId[poolId][tx.origin] = newParticipant.participantId;
        
        // Increment pool.nextParticipantId variable
        unchecked {
        pools[poolId].nextParticipantId++;
        }

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

        // check that the participant is the transaction sender
        if (poolIdToParticipants[poolId][participantId].participantAddress != tx.origin) revert NotParticipant();

        // set the contribution
        poolIdToParticipants[poolId][participantId].contribution = newContribution;

        // emit that the contribution has been set
        emit ContributionSet(poolId, participantId);
    }

    function _exitPool(uint256 poolId, uint256 participantId) external onlyAllowed {
        // check if the pool exists
        if (poolId >= _currentIndex) revert NoPoolFound();

        // check that the participant is the transaction sender
        if (poolIdToParticipants[poolId][participantId].participantAddress != tx.origin) revert NotParticipant(); 

        delete poolIdToParticipants[poolId][participantId].contribution; 
    }


    // set the allowed permission
    function setAllowedPermission(address address_, bool permission_) external onlyAllowed
    {
        allowedContracts[address_] = permission_;
    }
}
