// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";
import {BahiaNFTPoolTypes} from "./libraries/BahiaNFTPoolTypes.sol";


interface IBahiaNFTPoolData {
    // ability to see the pool count
    function getPoolCount() external view returns (uint256);

    // getter function for the pool
    function getPool(uint256 poolId) external view returns (BahiaNFTPoolTypes.Pool memory);

    // function to add a pool
    function addPool(BahiaNFTPoolTypes.Pool newPool) external;

    // getter funtion to get the count of a pool's participants
    function getParticipantCount(uint256 poolId) external view returns (uint256);

    // getter function to get a pool's participant (based on an index)
    function getParticipant(uint256 poolId, uint256 participantId) external view returns (BahiaNFTPoolTypes.Participant memory);

    // ability to add a participant to a pool
    function addParticipant(uint256 poolId, uint256 contribution) external;
}
