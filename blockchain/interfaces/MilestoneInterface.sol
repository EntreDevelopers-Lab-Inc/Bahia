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
    function isPaid() external returns (bool);
    function isClosed() external returns (bool);
}
