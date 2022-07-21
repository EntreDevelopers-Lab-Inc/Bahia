// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import {BahiaNFTPoolTypes} from "../../../contracts/NFT/Pool/libraries/BahiaNFTPoolTypes.sol";
import "../../Bahia.sol";
import "../../../interfaces/NFT/Pool/IBahiaNFTPoolData.sol";
import "../../../interfaces/NFT/Pool/IFractionalArt.sol";
import "./reference/Interfaces/IVault.sol";
import "./reference/Interfaces/IFERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error FailedWETHTransfer();
error NoPoolFound();
error NoParticipantFound();
error ContributionNotAllowed();
error PoolCompleted();
error PoolIncomplete();
error NotParticipant();
error InsufficientFunds();
error NoShares();
error AlreadyJoinedPool();

contract BahiaNFTPool is
    Bahia,
    ERC721Holder,
    IERC1155Receiver,
    ReentrancyGuard,
    Ownable,
    Pausable
{
    // events

    // keep track of the data
    IBahiaNFTPoolData public poolData;

    // interfaces to use
    IFractionalArt public fractionalArt;

    // keep ERC20 handlers for the important currencies
    IERC20 weth;

    // constructor
    constructor(uint256 devRoyalty_, address dataAddress_, address fractionalArtContract_, address WETHaddress_) Bahia(devRoyalty_)
    {
        // connect to the data contract
        poolData = IBahiaNFTPoolData(dataAddress_);

        // bind each contract
        fractionalArt = IFractionalArt(fractionalArtContract_);

        // bind the tokens
        weth = IERC20(WETHaddress_);
    }

    // function to create a pool with limited inputs (don't want user to have full control and create false creators, completion, etc.)
    function createPool(address collection_, uint256 nftId_, uint256 maxContributions_, uint256 shareSupply_) external whenNotPaused
    {
        // create a new pool
        BahiaNFTPoolTypes.Pool memory newPool = BahiaNFTPoolTypes.Pool({
                poolId: poolData.getPoolCount(),
                nftId: nftId_,
                maxContributions: maxContributions_,
                collection: collection_,
                shareSupply: shareSupply_,
                creator: msg.sender,
                completed: false,
                endPurchasePrice: 0,
                vaultId: 0,
                nextParticipantId: 1
            });

        // add the pool to the data contract
        poolData.addPool(newPool);
    }

    // a function to add a participant to a particular pool
    function joinPool(uint256 poolId, uint256 contribution) external whenNotPaused
    {
        // NOTE: no reason to check for a non-zero contribution, as this wastes gas, and a malicious attempt could just set their contribution to 0 later (which cannot be changed, as people need to maintain the ability to leave the pool)

        // get the actual pool
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        // if the pool has been completed, it cannot be joined
        if (pool.completed) revert PoolCompleted();

        if(poolData.getParticipantIdFromAddress(poolId, msg.sender) != 0) revert AlreadyJoinedPool(); 

        // make sure that the contract is allowed to spend the contribution (stops people from joining without the intention of paying --> creates excess gas for the user if they want to execute a trade)
        _checkAllowance(contribution);

        // create a participant
        BahiaNFTPoolTypes.Participant memory newParticipant = BahiaNFTPoolTypes.Participant({
                participantId: poolData.getNextParticipantId(poolId),
                participantAddress: msg.sender,
                contribution: contribution,
                paid: 0  // hasn't paid anything yet
            });

        // add the participant to the pool if this all passes (can assume this will work, as it is a valid pool id)
        poolData.addParticipant(poolId, newParticipant);
    }

    // function to set the contribution
    function setContribution(uint256 poolId, uint256 participantId, uint256 newContribution) external whenNotPaused
    {
        // get the participant
        BahiaNFTPoolTypes.Participant memory participant = _safeParticipant(poolId, participantId);
        
        // ensure that the participant is the only one who can setContribution
        if(msg.sender != participant.participantAddress) revert NotParticipant();

        // ensure that the balance is at least the contribution
        _checkAllowance(newContribution);

        // set the contribution if it passes the above constraints
        // this setter checks that the participant is the origin of this transaction
        poolData.setContribution(poolId, participant.participantId, newContribution);
    }



    // function to claim the fractionalized shares (anyone can call, allowing people to lead pooling and airdrop shares)
    function claimShares(uint256 poolId, uint256 participantId) external whenNotPaused callerIsUser
    {
        // get the pool (used to get the end purchase price and completion information)
        BahiaNFTPoolTypes.Pool memory pool = _safePool(poolId);

        // revert if not completed
        if (!pool.completed) revert PoolIncomplete();

        // get the participant
        BahiaNFTPoolTypes.Participant memory participant = _safeParticipant(poolId, participantId);

        // revert if paid is 0 (for BOTH participants that were not needed to fund AND participants that have already collected their share)
        if (participant.paid == 0) revert NoShares();

        // mark that the shares have been distributed by setting paid to 0
        participant.paid = 0;

        // upload the participant to the data contract
        poolData.setParticipant(poolId, participant);

        // get the vault
        IVault vault = IVault(fractionalArt.vaults(pool.vaultId));

        // distribute these fractionalized shares
        IFERC1155 sharesContract = IFERC1155(fractionalArt.fnft());
        
        sharesContract.safeTransferFrom(address(this), participant.participantAddress, vault.fractionsID(), (pool.shareSupply * participant.paid / pool.endPurchasePrice), bytes(""));
    }

    // function to calculate minimums
    function _min(uint256 a, uint256 b) internal returns (uint256)
    {
        return a <= b ? a : b;
    }

    // get a pool safely
    function _safePool(uint256 poolId) internal returns (BahiaNFTPoolTypes.Pool memory)
    {
        BahiaNFTPoolTypes.Pool memory pool = poolData.getPool(poolId);

        // if there is no pool, revert
        if (pool.creator == address(0)) revert NoPoolFound();

        // else, just return the pool
        return pool;
    }

    // get a participant safely (no checks needed, out of range throws immediate reversion)
    function _safeParticipant(uint256 poolId, uint256 participantId) internal returns (BahiaNFTPoolTypes.Participant memory)
    {
        BahiaNFTPoolTypes.Participant memory participant = poolData.getParticipant(poolId, participantId);

        if (participant.participantAddress == address(0)) revert NoParticipantFound();

        // if it passes checks, return the participant
        return participant;
    }

    // function to check the allowance
    function _checkAllowance(uint256 contribution) internal
    {
        if (weth.allowance(msg.sender, address(this)) < contribution) revert ContributionNotAllowed();
    }

    // create the vault
    function _createVault(BahiaNFTPoolTypes.Pool memory pool) internal
    {
        // now that the contract has the NFT, allow the fractional art vault factory to interact with it
        IERC721(pool.collection).approve(address(fractionalArt), pool.nftId);

        // create a vault & fractionalize (assuming all ERC1155 tokens mint to this contract)
        pool.vaultId = fractionalArt.mint(pool.collection, pool.nftId, pool.shareSupply);

        // mark that the pool has been completed
        pool.completed = true;

        // push the pool to the data contract
        poolData.updatePool(pool);
    }


    // function to pause the contract
    function setPause(bool pauseValue) external onlyOwner
    {
        if (pauseValue)
        {
            _pause();
        }
        else
        {
            _unpause();
        }
    }

    // must have this function for receiving ERC1155s
    function onERC1155Received(address operator, address from,uint256 id, uint256 value, bytes calldata data) external returns (bytes4)
    {
        // return the magic key for fractional art
        return this.onERC1155Received.selector;
    }

    // must have this function for receiving ERC1155s
    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external returns (bytes4)
    {
        // return the magic key for fractional art
        return this.onERC1155BatchReceived.selector;
    }

    // note that the 1155 interface is supported
    function supportsInterface(bytes4 interfaceId) external view returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
