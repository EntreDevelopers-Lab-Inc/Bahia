// SPDX License-Identifier: MIT

pragma solidity ^0.8.12;

import "../../Bahia.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@chiru-labs/contracts/ERC721A.sol";

// errors
error NotOwner();
error TimeError();


contract BahiaNFTRaffle is
    Bahia,
    ERC721A,
    ERC721Holder,
    ReentrancyGuard
{
    // events

    // raffle struct
    struct Raffle {
        IERC721 collection;
        uint256 nftId;
        uint256 ticketPrice;  // in gwei
        uint256 expiration;
        address creator;
        string tokenURI; // will let people add art to their raffles
        uint256 winningTicketId;  // set to 0 --> not set yet
        bool NFTclaimed;  // if the ticket has been claimed
        bool ETHclaimed;  // if the eth has been claimed
    }

    // ticket mapping
    mapping(uint256 => uint256[]) public raffleToTickets;
    mapping(uint256 => uint256) public ticketToRaffle;

    // place to put all the raffles
    Raffle[] raffles;

    // constructor
    constructor(string memory name_, string memory symbol_, uint256 devRoyalty_) Bahia(devRoyalty_) ERC721A(name_, symbol_) {}

    // create a raffle
    function createRaffle(address collectionAddress, uint256 nftId, uint256 ticketPrice, uint256 expiration, string calldata tokenURI) external
    {
        // check if the creator is the rightful owner
        IERC721 nftManager = IERC721(collectionAddress);
        if (nftManager.ownerOf(nftId) != msg.sender) revert NotOwner();

        // check thta the expiration is later than the current time
        if (expiration < block.timestamp) revert TimeError();

        // make a raffle
        Raffle memory newRaffle = Raffle({
                collection: nftManager,
                nftId: nftId,
                ticketPrice: ticketPrice,
                expiration: expiration,
                creator: msg.sender,
                tokenURI: tokenURI,
                winningTicketId: 0,
                NFTclaimed: false,
                ETHclaimed: false
            });

        // add it to the array of raffles
        raffles.push(newRaffle);
    }

    // buy tickets

    // draw the winning ticket

    // claim (as the winner)

    // withdraw the ticket proceeds

    // overload token uri to return raffle's token uri

    // set the token URI
}
