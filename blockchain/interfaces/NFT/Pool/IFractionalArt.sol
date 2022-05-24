// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFractionalArt {
     function fnft() external returns (address);
     function mint(address _token, uint256 _id, uint256 _supply) external returns(uint256);
     function vaults(uint256 vaultId) external view returns(address);
}
