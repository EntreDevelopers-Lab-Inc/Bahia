// SPDX-License-Identifier: MIT

/**
 * @title milestone contract for Bahia
*/

pragma solidity ^0.8.4;


import "../interfaces/InvoiceInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// use errors instead of requires, so it costs less gas for people to deploy
error InsufficientFunds();
error AlreadyPaid();
error NotProvider();
error NotClient();
error NotPaid();
error FalseCurrency();

// events for what happens
event TransferReceived(address from_, uint amount_);
event TransferSent(address from_, address destAddress_, uint amount_);

// contract that creates the  escrow for each transaction --> call them milestones
contract Milestone is
    ReentrancyGuard
{
    string public name;
    uint256 public value;
    bool paid;
    bool public closed;

    InvoiceDataInterface public invoice;

    // initialize with the name, value, and invoice address (don't want to be able to create escrows without invoices, as that would make it impossible to get payment data)
    constructor (string memory name_, string memory value_, address invoiceAddress_)
    {
        // set up the contract
        name = name_;
        value = value_;
        invoice = InvoiceDataInterface(invoiceAddress_);
    }

    /**
     * @notice a function for the client to release the funds to the provider
    */
    function release() external payable nonReentrant
    {
        // only the client can call
        if(tx.origin != invoice.cientAddress()) revert NotClient();

        // only if the invoice is paid
        if (!isPaid()) revert NotPaid();

        // pay the devs
        uint256 devPayment = _payDevs();

        // send the funds to the provider
        invoice.token.safeTransfer(invoice.providerAddress(), (value - devPayment));

        // refund the rest (good practice)
        _refundExcess();

        // close the contract
        closed = true;
    }

    /**
     * @notice a function for refunding (only the provider OR invoice can call)
    */
    function refund() external nonReentrant
    {
        // make sure the milestone has been paid first
        if (!isPaid()) revert NotPaid();

        // make sure that either the invoice or the provider is calling it
        if(tx.origin != invoice.providerAddress()) revert NotProvider();

        // pay the devs
        uint256 devPayment = _payDevs();

        // refund the money
        invoice.token.transfer(invoice.clientAddress(), (invoice.token.balanceOf(address(this))));

        // set paid to false
        paid = false;

        // set closed to true
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
        else if (invoice.token.balanceOf(address(this)) >= value)
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
        if (invoice.token.balanceOf(address(this)) > value)
        {
            invoice.token.safeTransfer(invoice.token.balanceOf(address(this) - value));  // pay user the excess
        }
        // make sure the deposit meets the transaction value
        else if (msg.value < value)
        {
            revert InsufficientFunds();
        }
    }

    /**
     * @notice function to pay the devs
    */
    function _payDevs(uint256 amount) internal returns (uint256)
    {
        uint256 devPayment = value * invoice.devRoyalty() / 100;
        invoice.token.safeTransfer(invoice.token, invoice.devAddress(), devPayment);
    }

}
