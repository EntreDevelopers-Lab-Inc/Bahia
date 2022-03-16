// SPDX-License-Identifier: MIT

/**
 * @title invoice interfaces for Bahia
*/

pragma solidity ^0.8.4;

interface InvoiceInterface
{
    // enable freepay for letting anyone pay contract
    function setFreepay(bool) external;

    // add/drop a milestone
    function addMilestone(MilestoneEntry) external;
    function removeMilestone(MilestoneEntry) external;

    // milestone data
    function paid() external view;
    function value() external view;

    // iterate over all milestones
    function releaseAllMilestones() external;
    function refundAllMilestones() external;
    function removeAllMilestones() external;  // NOT a refund --> just will be cancelled

    // these will call a function that only allows child contracts to call it
    function devAddress() external view returns (address);
    function devRoyalty() external view returns (uint256);
}

interface InvoiceDataInterface
{
    // ability to view the public addresses
    function providerAddress() external view returns (address);
    function clientAddress() external view returns (address);

    // view freepay
    function freepay() external view returns (bool);

    // view token
    function token() external returns (IERC20);
}
