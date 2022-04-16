pragma solidity ^0.8.12;

import "../../Bahia.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract BahiaNFTPool is
    Bahia,
    ERC721Holder,
    ReentrancyGuard,
    Ownable
{
    // events

    // addresses to track
    address looksRareContract;
    address fractionalArtContract;

    // keep ERC20 handlers for the important currencies
    IERC20 weth;
    IERC20 looks;

    // constructor
    constructor(uint256 devRoyalty_, address looksRareContract_, address fractionalArtContract_, address WETHaddress_, address looksAddress_) Bahia(devRoyalty_)
    {
        // bind each contract
        looksRareContract = looksRareContract_;
        fractionalArtContract = fractionalArtContract_;

        // bind the tokens
        weth = ERC20(WETHaddress_);
        looksAddress = ERC20(looksAddress_);

    }

    // some function for withdrawing all looks from contract to
    function withdrawLooks() external onlyOwner
    {

    }
}
