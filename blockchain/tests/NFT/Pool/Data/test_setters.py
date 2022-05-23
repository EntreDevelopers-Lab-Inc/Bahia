from scripts.accounts import *
import pytest 
from web3 import Web3

# interface IBahiaNFTPoolData {
#     // ability to see the pool count
#     function getPoolCount() external view returns (uint256);

#     // getter function for the pool
#     function getPool(uint256 poolId) external returns (BahiaNFTPoolTypes.Pool memory);

#     // function to add a pool
#     function addPool(BahiaNFTPoolTypes.Pool memory newPool) external;

#     // update a pool
#     function updatePool(BahiaNFTPoolTypes.Pool memory pool) external;

#     // getter funtion to get the count of a pool's participants
#     function getParticipantCount(uint256 poolId) external view returns (uint256);

#     // getter function to get a pool's participant (based on an index)
#     function getParticipant(uint256 poolId, uint256 participantId) external returns (BahiaNFTPoolTypes.Participant memory);

#     // ability to add a participant to a pool
#     function addParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory newParticipant) external;

#     // set a participant
#     function setParticipant(uint256 poolId, BahiaNFTPoolTypes.Participant memory participant) external;

#     // set the contribution
#     function setContribution(uint256 poolId, uint256 participantId, uint256 newContribution) external;
# }

