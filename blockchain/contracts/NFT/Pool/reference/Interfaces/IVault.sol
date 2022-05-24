// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0 >=0.8.1 <0.9.0;

interface IVault {
  function token() external view returns (address);
  function id() external view returns (uint256);
  function onTransfer(
    address,
    address,
    uint256
  ) external;
}
