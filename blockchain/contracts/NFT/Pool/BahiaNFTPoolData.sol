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

    /**
     @notice returns the number of pools
     */
    function getPoolCount() public view returns (uint256)
    {
        return _currentIndex;
    }

    /**
     @notice returns pool information from a poolId
     @param poolId the Pool ID
     */
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

    /**
     @notice returns a participant id from an address
     @param poolId the pool ID
     @param _address an address
     */
    function getParticipantIdFromAddress(uint256 poolId, address _address) external view returns (uint256) {
        return addressToParticipantId[poolId][_address];
    }

    // function to get id from pool
    function _getParticipantFromAddress (uint256 poolId, address _address) internal view returns (BahiaNFTPoolTypes.Participant memory) {
        if (poolId >= _currentIndex) revert NoPoolFound(); 

        uint256 _participantId = addressToParticipantId[poolId][_address];
        return poolIdToParticipants[poolId][_participantId];
    }

    /**
     @notice returns participant information from an address
     @param poolId the pool ID
     @param _address an address
     */
    function getParticipantFromAddress (uint256 poolId, address _address) external view returns (BahiaNFTPoolTypes.Participant memory) {
        return _getParticipantFromAddress(poolId, _address);
    } 

    /**
    @notice returns participant information of the function caller
    @param poolId the pool ID
     */
    function getMyParticipantInfo (uint256 poolId) external view returns (BahiaNFTPoolTypes.Participant memory) {
        return _getParticipantFromAddress(poolId, msg.sender);
    }

    // function to update a pool
    function updatePool(BahiaNFTPoolTypes.Pool memory _pool) external onlyAllowed
    {
        if (_pool.poolId >= _currentIndex) revert NoPoolFound();
        
        // set the pool 
        pools[_pool.poolId] = _pool;
    }

    /**
     @notice returns the next participant ID of a pool
     @param poolId the pool ID
     */
    function getNextParticipantId(uint256 poolId) external view returns (uint256)
    {
        return pools[poolId].nextParticipantId;
    } 


    
    /**
     @notice returns the number of participants in a given pool
     @param poolId the pool ID
     */
    function getNumberOfParticipants(uint256 poolId) external view returns(uint256) {
        // Adjusted by 1 considering all pool.count are indexed @ 1 
       return pools[poolId].nextParticipantId - 1; 
    }

    // getter function to get a pool's participant (based on an index)
    /**
     @notice returns a participant information of a pool given a participant ID
     @param poolId the pool ID
     @param participantId the participant ID 
     */
    function getParticipant(uint256 poolId, uint256 participantId) public view returns (BahiaNFTPoolTypes.Participant memory)
    {    
        // Return the participant; 
        // Since participantIDs are indexed @ 1 and mappings are indexed @ 0, need to add 1 to the participantId
        return poolIdToParticipants[poolId][participantId];
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
        delete addressToParticipantId[poolId][tx.origin];

    }


    // set the allowed permission
    function setAllowedPermission(address address_, bool permission_) external onlyAllowed
    {
        allowedContracts[address_] = permission_;
    }
}
