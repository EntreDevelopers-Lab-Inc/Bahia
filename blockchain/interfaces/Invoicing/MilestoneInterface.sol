// SPDX-License-Identifier: MIT

/**
 * @title milestone interface
*/

pragma solidity ^0.8.4;


interface MilestoneInterface
{
    function release() external payable;
    function refund() external;
    function close() external;
    function isPaid() external view returns (bool);
}

interface MilestoneDataInterface is MilestoneInterface
{
    function value() external view returns (uint256);
    function closed() external view returns (bool);
}

