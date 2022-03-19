// SPDX-License-Identifier: MIT

/**
 * @title bahia data interface
*/

pragma solidity ^0.8.4;

import "../../interfaces/Invoicing/BasicDataInterface.sol";

interface BahiaInvoiceInterface is BasicInvoiceDataInterface
{
    struct MilestoneEntry {
        string name;
        uint256 value;
    }

    function createInvoice(string memory, address, address) external;

    // add/drop a milestone
    function addMilestone(uint256, MilestoneEntry calldata) external;
    function removeMilestones(uint256, uint256[] memory) external;

    // milestone data
    function paid(uint256) external view returns(bool);
    function value(uint256) external view returns(uint256);
    function outstanding(uint256) external view returns(uint256);

    function changeDevAddress(address) external;
    function changeDevRoyalty(uint256) external;

}

interface BahiaInvoiceDataInterface is BahiaInvoiceInterface
{
    // get the invoice from the array
    function invoices(uint256) external view returns (Invoice memory);

    // ability to view the public addresses
    function devAddress() external view returns (address);
    function devRoyalty() external view returns (uint256);
}
