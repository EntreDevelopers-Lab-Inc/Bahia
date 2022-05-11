// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFractionalVault {
     function initialize(address _curator, address _token, uint256 _id, uint256 _supply, uint256 _listPrice, uint256 _fee, string memory _name, string memory _symbol) external;
}
