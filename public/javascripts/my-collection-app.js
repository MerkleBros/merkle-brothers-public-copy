var merkleBrosABI = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionIdToAuction",
      "outputs": [
        {
          "name": "auctionId",
          "type": "uint256"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "name": "price",
          "type": "uint256"
        },
        {
          "name": "lastActiveBlock",
          "type": "uint256"
        },
        {
          "name": "balanceOwed",
          "type": "uint256"
        },
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "cardPrototypeId",
          "type": "uint32"
        },
        {
          "name": "auctionActive",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "auctionFee",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "balances",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "auctionCount",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "cardActions",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenIdToAuctionId",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "setExists",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenIdToCardPrototypeId",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "cardPackAmount",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "cardPackPrice",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "cardAmounts",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "contractBalanceOwed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionIdToOwner",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "auctionAddress",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "cardPrototypeCount",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionIdToCardPrototypeId",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "upgradeAddress",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "admin",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionActive",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenIdToOwnerArrayIndex",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "artUrl",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "cardPrices",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "allowTotem",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenIdToOwner",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "totemUsed",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ownerToTokenIdArray",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "governance",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionIdToBalanceOwed",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "artAddress",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "cardActionsCount",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionIdToTokenId",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "setTitles",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "tokenCount",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "cardSetToTotem",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "cardSetArrays",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctionIdToPrice",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "totemToRarity",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "cardPrototytpeIdToCardPrototype",
      "outputs": [
        {
          "name": "cardPrototypeId",
          "type": "uint32"
        },
        {
          "name": "cardSet",
          "type": "uint32"
        },
        {
          "name": "cardRarity",
          "type": "uint8"
        },
        {
          "name": "cardActionPointCost",
          "type": "uint8"
        },
        {
          "name": "cardAttackValue",
          "type": "uint8"
        },
        {
          "name": "cardHealthValue",
          "type": "uint8"
        },
        {
          "name": "cardActionOne",
          "type": "uint8"
        },
        {
          "name": "cardActionTwo",
          "type": "uint8"
        },
        {
          "name": "cardActionThree",
          "type": "uint8"
        },
        {
          "name": "cardActionOneValue",
          "type": "uint8"
        },
        {
          "name": "cardActionTwoValue",
          "type": "uint8"
        },
        {
          "name": "cardActionThreeValue",
          "type": "uint8"
        },
        {
          "name": "cardTitle",
          "type": "bytes32"
        },
        {
          "name": "cardArtist",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "name": "cardSetToRarity",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "delegateAuction",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenIdToApproved",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_approved",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_creator",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_cardPrototypeId",
          "type": "uint32"
        }
      ],
      "name": "CreateCardPrototype",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_address",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_cardPrototypeId",
          "type": "uint32"
        }
      ],
      "name": "ModifyCardPrototype",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_creator",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_actionKey",
          "type": "uint8"
        },
        {
          "indexed": true,
          "name": "_action",
          "type": "bytes32"
        }
      ],
      "name": "AddAction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_creator",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_setId",
          "type": "uint32"
        },
        {
          "indexed": true,
          "name": "_setTitle",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "_setRarity",
          "type": "uint8"
        }
      ],
      "name": "AddSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_creator",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_cardPrototypeId",
          "type": "uint32"
        },
        {
          "indexed": true,
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "SetTotemToSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "UseTotem",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_cardPrototypeId",
          "type": "uint32"
        }
      ],
      "name": "MintCard",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_cardPrototypeId",
          "type": "uint32"
        }
      ],
      "name": "MintArtCard",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "CreateAuction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_auctionId",
          "type": "uint256"
        }
      ],
      "name": "CloseAuction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "BuyAuction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_auctionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "SetAuctionPrice",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "checkBalance",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "getCardSetArrayLength",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_setId",
          "type": "uint32"
        },
        {
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getCardSetArrayCard",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "getOwnerArray",
      "outputs": [
        {
          "name": "",
          "type": "uint256[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_address",
          "type": "address"
        },
        {
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "getOwnerCardSetArray",
      "outputs": [
        {
          "name": "",
          "type": "uint32[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_address",
          "type": "address"
        },
        {
          "name": "_setId",
          "type": "uint32"
        },
        {
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getOwnerCardSetArrayCard",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "getTotemUsed",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_rarity",
          "type": "uint256"
        }
      ],
      "name": "getCardRarityCount",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_rarity",
          "type": "uint256"
        }
      ],
      "name": "getCardRarityArray",
      "outputs": [
        {
          "name": "",
          "type": "uint32[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_rarity",
          "type": "uint256"
        },
        {
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getCardByRarity",
      "outputs": [
        {
          "name": "",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_auctionId",
          "type": "uint256"
        }
      ],
      "name": "claimSales",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "cashOut",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "setOwner",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_admin",
          "type": "address"
        }
      ],
      "name": "setAdmin",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_admin",
          "type": "address"
        }
      ],
      "name": "removeAdmin",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_governance",
          "type": "address"
        }
      ],
      "name": "setGovernance",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_governance",
          "type": "address"
        }
      ],
      "name": "removeGovernance",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "setCardPackPrice",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_cardPrototypeId",
          "type": "uint32"
        },
        {
          "name": "_price",
          "type": "uint256"
        },
        {
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "setCardPriceAndAmount",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "setCardPackAmount",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_allow",
          "type": "bool"
        }
      ],
      "name": "setAllowTotem",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "setArtAddress",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_cardPrototypeId",
          "type": "uint32"
        },
        {
          "name": "_url",
          "type": "bytes32"
        }
      ],
      "name": "setArtUrl",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "setAuctionAddress",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_delegate",
          "type": "bool"
        }
      ],
      "name": "setDelegateAuction",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "setAuctionFee",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "upgradeContract",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        },
        {
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "tokenOfOwnerByIndex",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "takeOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_cardPrototype",
          "type": "uint32"
        }
      ],
      "name": "buyCard",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "buyCards",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_amount",
          "type": "uint256"
        },
        {
          "name": "_cardPrototype",
          "type": "uint32"
        }
      ],
      "name": "mintCardOwner",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "claimTotem",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_totemId",
          "type": "uint256"
        },
        {
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "useTotem",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_cardSet",
          "type": "uint32"
        },
        {
          "name": "_cardRarity",
          "type": "uint8"
        },
        {
          "name": "_cardActionPointCost",
          "type": "uint8"
        },
        {
          "name": "_cardAttackValue",
          "type": "uint8"
        },
        {
          "name": "_cardHealthValue",
          "type": "uint8"
        },
        {
          "name": "_cardActionOne",
          "type": "uint8"
        },
        {
          "name": "_cardActionTwo",
          "type": "uint8"
        },
        {
          "name": "_cardActionThree",
          "type": "uint8"
        },
        {
          "name": "_cardActionOneValue",
          "type": "uint8"
        },
        {
          "name": "_cardActionTwoValue",
          "type": "uint8"
        },
        {
          "name": "_cardActionThreeValue",
          "type": "uint8"
        },
        {
          "name": "_cardTitle",
          "type": "bytes32"
        },
        {
          "name": "_cardArtist",
          "type": "bytes32"
        }
      ],
      "name": "createCardPrototype",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_cardPrototypeId",
          "type": "uint32"
        },
        {
          "name": "_cardActionPointCost",
          "type": "uint8"
        },
        {
          "name": "_cardAttackValue",
          "type": "uint8"
        },
        {
          "name": "_cardHealthValue",
          "type": "uint8"
        },
        {
          "name": "_cardActionOne",
          "type": "uint8"
        },
        {
          "name": "_cardActionTwo",
          "type": "uint8"
        },
        {
          "name": "_cardActionThree",
          "type": "uint8"
        },
        {
          "name": "_cardActionOneValue",
          "type": "uint8"
        },
        {
          "name": "_cardActionTwoValue",
          "type": "uint8"
        },
        {
          "name": "_cardActionThreeValue",
          "type": "uint8"
        }
      ],
      "name": "modifyCardPrototype",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_setId",
          "type": "uint32"
        },
        {
          "name": "_setTitle",
          "type": "bytes32"
        },
        {
          "name": "_cardRarity",
          "type": "uint8"
        }
      ],
      "name": "createSet",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_totemId",
          "type": "uint32"
        },
        {
          "name": "_setId",
          "type": "uint32"
        }
      ],
      "name": "setTotemToSet",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_action",
          "type": "bytes32"
        }
      ],
      "name": "createAction",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "createAuction",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_auctionId",
          "type": "uint256"
        }
      ],
      "name": "closeAuction",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_auctionId",
          "type": "uint256"
        }
      ],
      "name": "buyAuction",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    }
  ];

App = {
  web3Provider: null,
  contracts: {},
  web3: {},

  initWeb3: function() {
	// Is there an injected web3 instance?
	if (typeof web3 !== 'undefined') {
		App.web3Provider = web3.currentProvider;
		console.log("Web3 provider exists, using: " + web3.currentProvider);
    App.web3 = new Web3(App.web3Provider);
    web3.eth.getAccounts(function(e, result) {
      if(e) {
        console.log('Unable to get accounts from Metamask');
        $('#user-address').html("No ETH Address detected, error retrieving web3 accounts");
      }
      else {
        console.log('Retrieved accounts from Metamask');
        App.account = result[0];
        console.log(result);
        if(App.account != undefined){
          $('#user-address').html("Address detected: " + App.account + "");
        }
        else {
          $('#user-address').html("Web3 detected but no address found. Please sign in to continue.");
        }
      }
      return App.initContract();
    });

	} else {
		// If no injected web3 instance is detected, fall back to Ganache
		// App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		// console.log("using ganache");
    console.log('Web3 provider not detected');
    $('#user-address').html('No web3 provider detected.');
    return App.initContract();
	}},

  initContract: function() {
    console.log('Calling init contract');

    var MerkleBros = web3.eth.contract(merkleBrosABI);
    App.contractInstance = MerkleBros.at('0x1d7Ae6EfDaBCc50f8bc240b5FfE81C8618370B9D');

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#purchase-button', App.handleBuyPack);
  },

  handleBuyPack: function(event) {
    event.preventDefault();
    console.log('handling buy pack');

    var numberOfCards = App.web3.toBigNumber($( "#red" ).slider( "value" ));
    console.log('Number of cards: ' + numberOfCards);

  	var merkleBrosInstance;

  	web3.eth.getAccounts(function(error, accounts) {
  	  if (error) {
  	    console.log(error);
  	  }

  	  var account = accounts[0];
  	  console.log('Account: ' + account);
  	  var cardPriceEth = 0.0014;
  	  console.log('Price per card eth' + cardPriceEth);
  	  var cardPriceEthBigNum = App.web3.toBigNumber(cardPriceEth);
  	  console.log(cardPriceEthBigNum);
  	  var cardPriceWeiBigNum = App.web3.toWei(cardPriceEthBigNum, 'ether');
  	  console.log(cardPriceWeiBigNum);
  	  var gasUsed = App.web3.toBigNumber("146000");
  	  console.log(gasUsed);

      App.contractInstance.buyCards(numberOfCards, {from: account, value: cardPriceWeiBigNum * numberOfCards, gas: gasUsed * numberOfCards*1.3},
        function(e, result) {
          if(!e) {
            console.log('Bought: ' + numberOfCards);
          }
          else {
            console.log(err.message);
          }
      });
  	});
  }

};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
