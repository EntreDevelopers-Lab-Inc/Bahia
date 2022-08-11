const POOL_CONTRACT_ABI =[
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "devRoyalty_",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "dataAddress_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "fractionalArtContract_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "WETHaddress_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "looksRareContract_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "looksAddress_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // {
  //   "inputs": [],
  //   "name": "AlreadyJoinedPool",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "ContributionNotAllowed",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "FailedLooksTransfer",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "FailedWETHTransfer",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "InsufficientFunds",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NoParticipantFound",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NoPoolFound",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NoShares",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NotAllowed",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NotDev",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NotParticipant",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NotUser",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "PoolCompleted",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "PoolIncomplete",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "PriceTooHigh",
  //   "type": "error"
  // },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bool",
            "name": "isOrderAsk",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "signer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "collection",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "strategy",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "currency",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minPercentageToAsk",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "params",
            "type": "bytes"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct OrderTypes.MakerOrder",
        "name": "makerAsk",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "minPercentageToAsk",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "buyNow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "devAddress_",
        "type": "address"
      }
    ],
    "name": "changeDevAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "devRoyalty_",
        "type": "uint256"
      }
    ],
    "name": "changeDevRoyalty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      }
    ],
    "name": "claimShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "collection_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nftId_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxContributions_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "shareSupply_",
        "type": "uint256"
      }
    ],
    "name": "createPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "devAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "devRoyalty",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      }
    ],
    "name": "exitPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fractionalArt",
    "outputs": [
      {
        "internalType": "contract IFractionalArt",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "contribution",
        "type": "uint256"
      }
    ],
    "name": "joinPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "onERC1155Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolData",
    "outputs": [
      {
        "internalType": "contract IBahiaNFTPoolData",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "address_",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "permission_",
        "type": "bool"
      }
    ],
    "name": "setAllowedPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newContribution",
        "type": "uint256"
      }
    ],
    "name": "setContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "pauseValue",
        "type": "bool"
      }
    ],
    "name": "setPause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawLooks",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawWETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
  
const POOL_DATA_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // {
  //   "inputs": [],
  //   "name": "IncorrectParticipantId",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "IncorrectPoolId",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NoPoolFound",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NotAllowed",
  //   "type": "error"
  // },
  // {
  //   "inputs": [],
  //   "name": "NotParticipant",
  //   "type": "error"
  // },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      }
    ],
    "name": "ContributionSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "participantId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "participantAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "contribution",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paid",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct BahiaNFTPoolTypes.Participant",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "ParticipantAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "poolId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxContributions",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "shareSupply",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "collection",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "endPurchasePrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "vaultId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nextParticipantId",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct BahiaNFTPoolTypes.Pool",
        "name": "newPool",
        "type": "tuple"
      }
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      }
    ],
    "name": "_exitPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "participantId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "participantAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "contribution",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paid",
            "type": "uint256"
          }
        ],
        "internalType": "struct BahiaNFTPoolTypes.Participant",
        "name": "newParticipant",
        "type": "tuple"
      }
    ],
    "name": "addParticipant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "poolId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxContributions",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "shareSupply",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "collection",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "endPurchasePrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "vaultId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nextParticipantId",
            "type": "uint256"
          }
        ],
        "internalType": "struct BahiaNFTPoolTypes.Pool",
        "name": "newPool",
        "type": "tuple"
      }
    ],
    "name": "addPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "addressToParticipantId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      }
    ],
    "name": "getNextParticipantId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      }
    ],
    "name": "getNumberOfParticipants",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      }
    ],
    "name": "getParticipant",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "participantId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "participantAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "contribution",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paid",
            "type": "uint256"
          }
        ],
        "internalType": "struct BahiaNFTPoolTypes.Participant",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getParticipantIdFromAddress",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      }
    ],
    "name": "getPool",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "poolId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxContributions",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "shareSupply",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "collection",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "endPurchasePrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "vaultId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nextParticipantId",
            "type": "uint256"
          }
        ],
        "internalType": "struct BahiaNFTPoolTypes.Pool",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolIdToParticipants",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "participantAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "contribution",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "paid",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pools",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxContributions",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "shareSupply",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "endPurchasePrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextParticipantId",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "address_",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "permission_",
        "type": "bool"
      }
    ],
    "name": "setAllowedPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "participantId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newContribution",
        "type": "uint256"
      }
    ],
    "name": "setContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "participantId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "participantAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "contribution",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paid",
            "type": "uint256"
          }
        ],
        "internalType": "struct BahiaNFTPoolTypes.Participant",
        "name": "participant",
        "type": "tuple"
      }
    ],
    "name": "setParticipant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "poolId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxContributions",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "shareSupply",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "collection",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "endPurchasePrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "vaultId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nextParticipantId",
            "type": "uint256"
          }
        ],
        "internalType": "struct BahiaNFTPoolTypes.Pool",
        "name": "_pool",
        "type": "tuple"
      }
    ],
    "name": "updatePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]