// SPDX-License-Identifier: MIT

/**
 * @title milestone contract for Bahia
*/

pragma solidity ^0.8.4;


import "../../interfaces/Invoicing/BahiaInterface.sol";
import "../../interfaces/Invoicing/MilestoneInterface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// use errors instead of requires, so it costs less gas for people to deploy
error InsufficientFunds();
error NonZeroInvoice();
error AlreadyPaid();
error NotProvider();
error NotClient();
error NotPaid();
error NotClosed();


/*
NOTES
- need to add notes to each contract
- need to figure out safeTransferFrom and ERC20Holder (like nft purchase)
    - this will make it easier for users to transfer money in and out
*/

// contract that creates the  escrow for each transaction --> call them milestones
contract Milestone is
    MilestoneInterface,
    ReentrancyGuard
{
    // backref to get the invoice
    uint256 invoiceId;

    string public name;
    uint256 public value;

    // don't show to limit confusion with getter functions
    bool paid;
    bool public closed;

    BahiaInvoiceDataInterface bahia;

    // initialize with the name, value, and bahia address (don't want to be able to create escrows without invoices, as that would make it impossible to get payment data)
    constructor (string memory name_, uint256 value_, uint256 invoiceId_, address bahiaAddress_)
    {
        // set up the contract
        name = name_;
        value = value_;
        invoiceId = invoiceId_;

        // set the backref to the contract using the bahia address
        bahia = BahiaInvoiceDataInterface(bahiaAddress_);
    }

    /**
     * @notice a function for the client to release the funds to the provider
    */
    function release() external payable nonReentrant
    {
        // only the client can call
        if(tx.origin != bahia.invoices(invoiceId).clientAddress) revert NotClient();

        // only if the milestone is paid
        if (!isPaid()) revert NotPaid();

        // only if the milestone is not closed
        if (!closed) revert NotClosed();

        // pay the devs
        uint256 devPayment = _payDevs();

        // send the funds to the provider
        bahia.invoices(invoiceId).token.transfer(bahia.invoices(invoiceId).providerAddress, (value - devPayment));

        // refund the rest (good practice)
        _refundExcess();

        // close the contract
        closed = true;
    }

    /**
     * @notice a function for refunding (only the provide can call)
    */
    function refund() external nonReentrant
    {
        // make sure the milestone has been paid first
        if (!isPaid()) revert NotPaid();

        // make sure that the provider is calling it
        if(tx.origin != bahia.invoices(invoiceId).providerAddress) revert NotProvider();

        // pay the devs
        _payDevs();

        // refund the money
        bahia.invoices(invoiceId).token.transfer(bahia.invoices(invoiceId).clientAddress, (bahia.invoices(invoiceId).token.balanceOf(address(this))));

        // set paid to false
        paid = false;

        // set closed to true
        closed = true;
    }

    /**
     * @notice close the milestone (only available by the invoice address)
    */
    function close() external nonReentrant
    {
        // check if it is the owner
        if (tx.origin != bahia.invoices(invoiceId).providerAddress) revert NotProvider();

        // close the contract
        closed = true;
    }

    /**
     * @notice function to check if this contract has been paid
    */
    function isPaid() public view returns (bool)
    {
        if (paid)
        {
            return true;
        }
        else if (bahia.invoices(invoiceId).token.balanceOf(address(this)) >= value)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * @notice refund the rest of the funds if too many
    */
    function _refundExcess() internal
    {
        // if the msg value is too much, refund it
        if (bahia.invoices(invoiceId).token.balanceOf(address(this)) > value)
        {
            bahia.invoices(invoiceId).token.transfer(bahia.invoices(invoiceId).clientAddress, bahia.invoices(invoiceId).token.balanceOf(address(this)) - value);  // pay user the excess
        }
    }

    /**
     * @notice function to pay the devs
    */
    function _payDevs() internal returns (uint256)
    {
        uint256 devPayment = value * bahia.devRoyalty() / 100000;

        bahia.invoices(invoiceId).token.transfer(bahia.devAddress(), devPayment);

        return devPayment;
    }

}
