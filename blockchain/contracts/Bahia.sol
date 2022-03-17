// SPDX-License-Identifier: MIT

/**
 * @title bahia contract
*/

pragma solidity ^0.8.4;

import "../interfaces/BahiaInterface.sol";
import "../interfaces/MilestoneInterface.sol";
import "./Milestone.sol";


error NotDev();

contract Bahia is
    BahiaInterface
{
    address public devAddress;
    uint256 public devRoyalty;

    // track each invoice internally
    Invoice[] public invoices;

    // track each provider
    mapping(address => uint256[]) public providerInvoices;

    // track each client
    mapping(address => uint256[]) public clientInvoices;

    constructor (uint256 devRoyalty_)
    {
        // set the dev royalty
        devRoyalty = devRoyalty_;

        // set the dev address to that in the constructor
        devAddress = msg.sender;
    }

    /**
     * @notice a modifier to mark functions that only the dev can touch
    */
    modifier onlyDev()
    {
        if (tx.origin != devAddress) revert NotDev();
        _;
    }

    /**
     * @notice a modifier that only allows the provider to interact with it
     * @param invoiceId finds the invoice
    */
    modifier onlyProvider(uint256 invoiceId)
    {
        if (tx.origin != invoices[invoiceId].providerAddress) revert NotProvider();
        _;
    }

    /**
     * @notice a modifier that only allows the client to interact with it
     * @param invoiceId finds the invoice
    */
    modifier onlyClient(uint256 invoiceId)
    {
        if (tx.origin != invoices[invoiceId].clientAddress) revert NotClient();
        _;
    }

    /**
     * @notice a function to create an invoice (can set all the milestones later)
     * @param name for setting the name
     * @param clientAddress for setting the client
     * @param tokenAddress for setting the token
     * @param milestoneEntries indicate the initial settings
    */
    function createInvoice(string memory name, address clientAddress, address tokenAddress, MilestoneEntry[] calldata milestoneEntries) external
    {
        // make all the milestones
        Milestone[] memory milestones;

        // iterate over the entries to make the milestones
        for (uint256 i = 0; i < milestoneEntries.length; i += 1)
        {
            milestones[i] = new Milestone(milestoneEntries[i].name, milestoneEntries[i].value, invoices.length, address(this));
        }

        // make a new invoice
        Invoice memory newInvoice = Invoice({
            name: name,
            providerAddress: tx.origin,
            clientAddress: clientAddress,
            tokenAddress: tokenAddress,
            milestones: milestones,
            token: IERC20(tokenAddress),
            id: invoices.length,
            milestoneCount: milestones.length
            });

        // add the invoice to both the provider and client invoices
        providerInvoices[tx.origin].push(invoices.length);
        clientInvoices[tx.origin].push(invoices.length);

        // add the invoice to the invoices list
        invoices.push(newInvoice);
    }

    /**
     * @notice adds milestones
     * actually need to check the provider here, so best to allow adding many milestones
     * @param newMilestoneEntries for the milestone information
    */
    function addMilestones(uint256 invoiceId, MilestoneEntry[] calldata newMilestoneEntries) external onlyProvider(invoiceId)
    {
        // get the milestone count
        uint256 milestoneCount = invoices[invoiceId].milestoneCount;

        // iterate over all the milestones that you want to add
        for (uint256 i = 0; i < newMilestoneEntries.length; i += 1)
        {
            // add the milestone to the list of milestones
            invoices[invoiceId].milestones[milestoneCount] = new Milestone(newMilestoneEntries[i].name, newMilestoneEntries[i].value, invoiceId, address(this));

            // increment the milestone count
            milestoneCount += 1;
        }

        // set the invoice milestone count again
        invoices[invoiceId].milestoneCount = milestoneCount;
    }

    /**
     * @notice remove milestones based on index
     * all the checks will happen within the milestone, no need to worry
     * @param milestoneIds describe the milestone ids that should be removed
    */
    function removeMilestones(uint256 invoiceId, uint256[] calldata milestoneIds) external onlyProvider(invoiceId)
    {
        for (uint256 i = 0; i < milestoneIds.length; i += 1)
        {
            // remove the milestone id
            _removeMilestone(invoiceId, milestoneIds[i]);
        }
    }

    /**
     * @notice remove the milestone
     * @param invoiceId to locate the invoice
     * @param milestoneId to locate the milestone in the array
    */
    function _removeMilestone(uint256 invoiceId, uint256 milestoneId) internal
    {
        // if the milestone is paid, refund it
        if (invoices[invoiceId].milestones[milestoneId].isPaid())
        {
            invoices[invoiceId].milestones[milestoneId].refund();
        }

        // no matter what, close the milestone, but don't delete it (as this provides no value)
        invoices[invoiceId].milestones[milestoneId].close();
    }

    /**
     * @notice return if the invoice is paid
     * @param invoiceId indicates the id of the invoice
    */
    function paid(uint256 invoiceId) external view returns (bool)
    {
        for (uint256 i = 0; i < invoices[invoiceId].milestones.length; i += 1)
        {
            // if any milestone is not paid, return false
            if (!MilestoneInterface(invoices[invoiceId].milestones[i]).isPaid())
            {
                return false;
            }
        }

        // otherwise, return true
        return true;
    }

    /**
     * @notice a function to see if the contract is cancelled
     * @param invoiceId indicates the id of the invoice
    */
    function cancelled(uint256 invoiceId) external view returns (bool)
    {
        bool foundOpen;

        // keep a milestone interface
        MilestoneInterface milestone;

        // iterate over the milestones and add their values
        for (uint256 i = 0; i < invoices[invoiceId].milestones.length; i += 1)
        {
            milestone = MilestoneInterface(invoices[invoiceId].milestones[i]);

            // if any milestone is paid, return false
            if (milestone.isPaid())
            {
                return false;
            }
            // if the contract is not paid, but is not closed, it is open
            else if (!milestone.isClosed())
            {
                foundOpen = true;
            }
        }

        // if it reaches here, return the opposite of whether or not it was found open
        return (!foundOpen);
    }

    /**
     * @notice return the value of the entire invoice
     * @param invoiceId indicates the id of the invoice
    */
    function value(uint256 invoiceId) external view returns (uint256)
    {
        // keep track of the invoice value
        uint256 invoiceValue;

        // keep a milestone interface
        MilestoneInterface milestone;

        // iterate over the milestones and add their values
        for (uint256 i = 0; i < invoices[invoiceId].milestones.length; i += 1)
        {
            milestone = MilestoneInterface(invoices[invoiceId].milestones[i]);

            // don't count if the milestone is closed and not paid --> use logical equivalent to save gas
            if (!milestone.isClosed() || milestone.isPaid())
            {
                invoiceValue += milestone.value();
            }
        }

        return invoiceValue;
    }

    /**
     * @notice add the amount outstanding on the invoice
     * @param invoiceId indicates the id of the invoice
    */
    function outstanding(uint256 invoiceId) external view returns (uint256)
    {
        // keep track of the outstanding amoutn
        uint256 outstandingAmount;

        // keep a milestone interface
        MilestoneInterface milestone;

        // iterate over the milestones and add their values
        for (uint256 i = 0; i < invoices[invoiceId].milestones.length; i += 1)
        {
            milestone = MilestoneInterface(invoices[invoiceId].milestones[i]);

            if (!milestone.isPaid() && !milestone.isClosed())
            {
                outstandingAmount += milestone.value();
            }
        }

        return outstandingAmount;
    }

    /**
     * @notice allow the devs to change their address
     * @param devAddress_ for the new dev address
    */
    function changeDevAddress(address devAddress_) external onlyDev
    {
        devAddress = devAddress_;
    }

    /**
     * @notice allow the devs to change their royalty
     * @param devRoyalty_ for the new royalty
    */
    function changeDevRoyalty(uint256 devRoyalty_) external onlyDev
    {
        devRoyalty = devRoyalty_;
    }
}
