// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IFERC1155 is IERC1155 {
  function burn(
    address,
    uint256,
    uint256
  ) external;

  function totalSupply(uint256) external view returns (uint256);
}