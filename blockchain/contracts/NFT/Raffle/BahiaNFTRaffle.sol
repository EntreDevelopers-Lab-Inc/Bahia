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
error FalseRaffle();
error RaffleExpired();
error InsufficientFunds();


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

    // check if a raffle exists
    modifier raffleExists(uint256 raffleId)
    {
        if (raffleId >= raffles.length) revert FalseRaffle();

        _;
    }

    // check if raffle is expired
    modifier raffleLive(uint256 raffleId)
    {
        if (raffles[raffleId].expiration < block.timestamp) revert RaffleExpired();
    }

    // create a raffle
    function createRaffle(address collectionAddress, uint256 nftId, uint256 ticketPrice, uint256 expiration, string calldata tokenURI) external callerIsUser
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
    function buyTickets(uint256 raffleId, uint256 quantity) external payable callerIsUser raffleExists(raffleId) raffleLive(raffleId) nonReentrant
    {
        // calculate the total cost
        uint256 totalCost = quantity * raffles[raffleId].price;

        // ensure the correct amount has been sent
        if (msg.value < totalCost) revert InsufficientFunds();

        // get the start and end token ids
        uint256 startId = _currentIndex + 1;
        uint256 endId = startId + quantity;

        // mint the tickets to the user
        _safeMint(msg.sender, quantity);

        // iterate over the ticket range
        for (uint256 i = startId; i <= endId; i += 1)
        {
            // add the tickets to the raffle
            raffleToTickets[raffleId].push(i);

            // add the raffle id to the ticket mapping
            ticketToRaffle[i] = raffleId;
        }

        // refund the excess
        if (msg.value)
    }

    // draw the winning ticket

    // claim (as the winner)

    // withdraw the ticket proceeds

    // overload token uri to return raffle's token uri

    // set the token URI

    // get a user's balance depending on the raffle id
}
