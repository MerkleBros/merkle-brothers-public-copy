//$http returns a res object, actual data is stored in res.data
angular.module('CardCtrl', []).controller('CardController', ['$scope', '$location', '$http', '$filter', function($scope, $location, $http, $filter) {

	//SET WHEN CONTRACT DEPLOYED
	var contractAddress = '0x1d7Ae6EfDaBCc50f8bc240b5FfE81C8618370B9D';

	//Set up MerkleBros Contract info 
	$scope.MerkleBrosABI = [
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

	//Setting up default selected card and selected tokens (card instances)
	$scope.selectedCardId = 7777;
	$scope.selectedCard = {};
	$scope.selectedTokens = [];
	$scope.totemSource = "images/unowned/card_not_released.jpg";
	$scope.selectedTotemId = 0;
	$scope.totemSets = [];
	$scope.toggleClaimTotemImage = false;

	//Flag for whether selected totem is claimable or not
	$scope.claimableTotem = false;

	//Setting up default selected set
	$scope.selectedSet = 0;
	$scope.selectedSetTitle = "Totems";
	$scope.selectedSetRarity = 0;
	$scope.selectedSetRarityText = "Totem set";

	//Retrieve existing sets, then check for web3
	$http.get('/sets/').then(function(res) {
		$scope.sets = res.data;

		//REMOVE AFTER TESTING
		console.log($scope.sets);
	})
	.then(checkWeb3());

	//Check for web3. If web3 exists, set user's account to $scope.account and get user's cards
	function checkWeb3() {
		if (typeof web3 !== 'undefined') {
		    web3.eth.getAccounts(function(e, result) {
		      if(e) {console.log('Unable to get accounts from Metamask in CardCtrl');}
		      else {
		      	//REMOVE AFTER TESTING
		        console.log('Retrieved accounts from Metamask in CardCtrl');

		        //Retrieve web3 account
		        $scope.account = result[0];

		        //Set up contract with ABI and set address
		        var MerkleBros = web3.eth.contract($scope.MerkleBrosABI);
				$scope.contractInstance = MerkleBros.at(contractAddress);

		        //REMOVE AFTER TESITNG
				// console.log("Trying to do stuff");
				// $scope.contractInstance.cardSetArrays(1, function(e, result) {
				// 	console.log("Stuff retrieved:");
				// 	console.log(result);
				// });
		        console.log($scope.account);

		        getCards();

		      }
		    });
		} 
		else {
      console.log('Web3 provider not detected in CardCtrl');
      getCards();
    }
	};

	
	//Function to retrieve a user's cards and add to $scope
	//Then match user's cards to card prototypes in a given set
	function getCards() {
		$http.get('/cardbook/' + $scope.account).then(function(res){
			$scope.cards = res.data;

			//REMOVE AFTER TESTING
			console.log("user's cards:");
			console.log($scope.cards);
		})

		.then(function(data) {
			//Retrieve all card prototypes
			$http.get('/cardprototypebook/').then(function(res) {
				$scope.cardPrototypes = res.data;

				//REMOVE AFTER TESTING
				console.log("Card prototypes:");
				console.log($scope.cardPrototypes);
			})
			.then(function(data) {
				//Retrieve all totem prototypes
				$http.get('/totemprototypebook/').then(function(res) {
					$scope.totemPrototypes = res.data;

					//REMOVE AFTER TESTING
					console.log("Totem prototypes:");
					console.log($scope.totemPrototypes);
				})
				.then(function(data) {
					//Retrieve all user's totems
					$http.get('/totembook/' + $scope.account).then(function(res) {
						$scope.totems = res.data;

						//REMOVE AFTER TESTING
						console.log("user's totems:");
						console.log($scope.totems);

					})
					.then(function(data) {
						//Call function to see which of user's cards match card prototypes in default set
						matchCardsToSet($scope.selectedSet);
					});
				})
			});
		});
	};


	//Filters card prototypes by a given set
	//Filters user's cards that match card prototypes in this set
	function matchCardsToSet(setId) {
		var cards = $scope.cards;
		var cardPrototypes = $scope.cardPrototypes;

		//Filter card prototypes to just those in selected set
		var filteredPrototypes = $filter('filter')(cardPrototypes, {cardSet: setId}, true);

		//Filter card prototypes to find totems
		var totemPrototypes = $filter('filter')(cardPrototypes, {cardSet: 0}, true);

		var matchingPrototypeIds = [];


		//REMOVE AFTER TESTING
		console.log("Matchingprototypeids");
		console.log(matchingPrototypeIds);
		console.log('about to call foreach');
		console.log("User's cards:");
		console.log(cards);
		console.log("Card prototypes:");
		console.log(cardPrototypes);
		console.log("Filtered Card prototypes:");
		console.log(filteredPrototypes);
		console.log("Totem prototypes");
		console.log(totemPrototypes);

		if ($scope.cardStatusArray) {
			console.log("Card status array exists")
			$scope.cardStatusArray.length = 0;
		}
		$scope.cardStatusArray = [];
		console.log("Card status array before rebuild");
		console.log($scope.cardStatusArray);

		//Push id of filtered prototypes to new array that tracks id and ownership of cards in set
		filteredPrototypes.forEach(function(element) {
			matchingPrototypeIds.push(element._id);
			$scope.cardStatusArray.push({id: element._id, owned: false});
		});

		//REMOVE AFTER TESTING
		console.log(matchingPrototypeIds);

		//Filter user's cards to those matching a card from the filtered prototypes
		$scope.filteredCards = $filter('filter')(cards, function(value, index, array) {
			var cardExists = false;
			matchingPrototypeIds.forEach(function(element) {
				if(element == value.cardPrototypeId) {
					cardExists = true;
					var index = $scope.cardStatusArray.findIndex(function(obj) {
						return obj.id == element;
					});
					$scope.cardStatusArray[index].owned = true;
				};
			});
			return cardExists;
		});

		//Filter user's cards to remove duplicates
		var userCardPrototypes = [];
		$scope.filteredCards.forEach(function(element) {
			if (!userCardPrototypes.includes(element.cardPrototypeId)) {
				userCardPrototypes.push(element.cardPrototypeId);
			}
		});

		//Store user's non-duplicate cards that match cards from the set
		$scope.userPrototypeIdsInSet = userCardPrototypes;

		//REMOVE AFTER TESTING
		console.log('card status array before sorting');
		console.log($scope.cardStatusArray);

		//Sort cardStatusArray by id
		$scope.cardStatusArray.sort(function(a, b) {
			return a.id - b.id;
		});

		//Construct inverseCardStatusArrayCount, an array used for iterating over 10 - cardStatusArray.length
		if ($scope.cardStatusArray.length == 10 || $scope.cardStatusArray.length > 10) {
			$scope.inverseCardStatusArrayCount = [];
		}
		else {
			$scope.inverseCardStatusArrayCount = new Array(10 - $scope.cardStatusArray.length);
			for (i = 0; i < 10 - $scope.cardStatusArray.length; i++) {
				$scope.inverseCardStatusArrayCount[i] = i;
			}
		}

		//Get totem belonging to this set (assuming the set is not the totem set with id 0)
    if (setId != 0) {
  		$scope.selectedTotemPrototype = $filter('filter')($scope.totemPrototypes, {'assignedSet': $scope.selectedSet}, true)[0];

  		//Get user's totem(s) matching this totemPrototype if this set has a matching totemPrototype
  		if ($scope.selectedTotemPrototype != undefined) {
  			//TotemPrototype exists for this set

  			//Check if user owns totemTokens matching the selected totemPrototype
  			$scope.selectedTotems = $filter('filter')($scope.totems, {'cardPrototypeId': $scope.selectedTotemPrototype._id}, true);
  			if ($scope.selectedTotems != undefined && $scope.selectedTotems.length != 0) {
  				//If totem is owned, show the owned card image
  				$scope.totemSource = 'images/owned/' + $scope.selectedTotemPrototype._id + '.jpg';

  				//Necessary to make angular work. True if selectedTotems not undefined or length 0
  				$scope.isSelectedTotems = true;
  			}
  			else {
  				//User does not own card, show unowned version of card image
  				$scope.totemSource = 'images/unowned/' + $scope.selectedTotemPrototype._id + '.jpg';

  				//Necessary to make angular work. True if selectedTotems not undefined or length 0
  				$scope.isSelectedTotems = false;
  			}
  		}
  		else {
  			//Totem Prototype does not exist for the set
  			$scope.selectedTotems = undefined;
  			$scope.totemSource = 'images/unowned/card_not_released.jpg';

  			//Necessary to make angular work. True if selectedTotems not undefined or length 0
  			$scope.isSelectedTotems = false;
  		}

  		//REMOVE AFTER TESTING
  		console.log("The selected set totemPrototype: " + JSON.stringify($scope.selectedTotemPrototype));
  		console.log("The user's totemTokens matching the totemPrototype: " + JSON.stringify($scope.selectedTotems));
  		console.log("Constructed inverseCardStatusArrayCount array");
  		console.log($scope.inverseCardStatusArrayCount);

  		//Check if user can claim totem for the selected set
  		$scope.setCanClaimTotem();
  		console.log("User can claim totem: " + $scope.canClaimTotem);
    }
    else {
      //Set 0 is selected so all user's totems are selected
      $scope.selectedTotems = $scope.totems;
    }


    //REMOVE AFTER TESTING
    console.log('card status array after sorting');
    console.log($scope.cardStatusArray);

    //REMOVE ALL AFTER TESTING
    console.log($scope.filteredCards);
    console.log($scope.userPrototypeIdsInSet);

	};

	$scope.updateSelectedSet = function(setId) {
		//REMOVE AFTER TESTING
		console.log('Update selected set was called with setId: ' + setId);

		$scope.selectedSet = setId;
		$scope.selectedSetJSON = $filter('filter')($scope.sets, {'_id': setId}, true)[0];

		//REMOVE AFTER TESTING
		console.log("Selected set JSON");
		console.log($scope.selectedSetJSON);
		console.log("Selected set title");

		$scope.selectedSetTitle = $scope.selectedSetJSON.setTitle;

		//REMOVE AFTER TESTING
		console.log($scope.selectedSetTitle);

		$scope.selectedSetRarity = $scope.selectedSetJSON.setRarity;

		//REMOVE AFTER TESTING
		console.log($scope.selectedSetRarity);

		if($scope.selectedSetRarity == 1) {
			$scope.selectedSetRarityText = "Common";
		}
		else if($scope.selectedSetRarity == 2) {
			$scope.selectedSetRarityText = "Rare";
		}
		else if($scope.selectedSetRarity == 3) {
			$scope.selectedSetRarityText = "Epic";
		}
		else if($scope.selectedSetRarity == 4) {
			$scope.selectedSetRarityText = "Legendary";
		}
    else if ($scope.selectedSetRarity == 0) {
      $scope.selectedSetRarityText = "Totem set";
    }
    else if ($scope.selectedSetRarity == 100) {
      $scope.selectedSetRarityText = "Promo";
    }
    else if ($scope.selectedSetRarity == 200) {
      $scope.selectedSetRarityText = "Art"
    }
		else {
			$scope.selectedSetRarityText = "";
		}
    if ($scope.selectedSet % 4 == 0 && $scope.selectedSet != 1000 && $scope.selectedSet != 9000 && $scope.selectedSet != 0) {
      $scope.selectedSetRarityText = "Rare (Sketchy)";
    }


		matchCardsToSet($scope.selectedSet);
	};

	//Called when clicking on an owned card image
	$scope.updateSelectedCard = function(cardId) {
		console.log("Update selected card was called with cardId: " + cardId);
		$scope.selectedCardId = cardId;

		//Select cardPrototype with matching id
		//True here makes matching exact
		$scope.selectedCard = $filter('filter')($scope.cardPrototypes, {'_id': cardId}, true)[0];
		
		//Add a text version of rarity to display to user
		if($scope.selectedCard.rarity == 0) {
			$scope.selectedCard.rarityText = "Totem";
		}
		if($scope.selectedCard.rarity == 1) {
			$scope.selectedCard.rarityText = "Common";
		}
		if($scope.selectedCard.rarity == 2) {
			$scope.selectedCard.rarityText = "Rare";
		}
		if($scope.selectedCard.rarity == 3) {
			$scope.selectedCard.rarityText = "Epic";
		}
		if($scope.selectedCard.rarity == 4) {
			$scope.selectedCard.rarityText = "Legendary";
		}
		if($scope.selectedCard.rarity == 100) {
			$scope.selectedCard.rarityText = "Promo";
		}
    if($scope.selectedCard.rarity == 200) {
      $scope.selectedCard.rarityText = "Art";
    }

		if($scope.selectedCard.rarity == 0 && $scope.selectedSet != 0) {
			//Retrieve the totemTokens corresponding to this totem
			$scope.selectedTokens = $scope.selectedTotems;

			//Select [0]'th element of array for default totem in case more than one is owned
			if ($scope.selectedTotemId == 0) {
				console.log("selectedTotemId is undefined");
				$scope.selectedTotemId = $scope.selectedTokens[0]._id;
			}
			$scope.updateSelectedTotem($scope.selectedTotemId);

		}
		else {
			//Retrieve all instances of the selected card that are owned by the user
			$scope.selectedTokens = $filter('filter')($scope.filteredCards, {'cardPrototypeId': cardId}, true);

      //If set 0 is selected, default selected totem is [0]'th element of array
      //Selected tokens should be totemtokens
      if($scope.selectedSet == 0) {
        $scope.selectedTotems = $filter('filter')($scope.totems, {'cardPrototypeId': cardId}, true);
        $scope.selectedTotemId = $scope.selectedTotems[0]._id;
        $scope.updateSelectedTotem($scope.selectedTotemId);
      }
		}

		console.log("selectedCard: " + JSON.stringify($scope.selectedCard));
		console.log("Selected tokens: " + JSON.stringify($scope.selectedTokens));
	};

	$scope.updateSelectedTotem = function(tokenId) {
		console.log("Update selected totem was called with tokenId: " + tokenId);
		$scope.selectedTotem = $filter('filter')($scope.selectedTotems, {'_id': tokenId}, true)[0];
		if($scope.selectedTotem == undefined || $scope.selectedTotem._id == undefined) {
			//User does not own this totem
			return;
		}
		$scope.selectedTotemId = $scope.selectedTotem._id;

		//REMOVE AFTER TESTING
		console.log("Selected totem: ");
		console.log($scope.selectedTotem);

    //If selected set is 0, selectedtotemprototype should be specified as the card that was clicked on instead of the card for the set
    if ($scope.selectedSet == 0) {
      $scope.selectedTotemPrototype = $scope.selectedCard;
    }

		$scope.getUsableTotemSets();
	}

	//Function for retrieving sets that the current selected totem can generate cards from
	$scope.getUsableTotemSets = function() {

		//Store totem rarity (rarity of cards totem generates, not rarity of totem itself)
		var rarity = $scope.selectedTotemPrototype.actionPointCost;

		//Array of sets totem has already been used on
		var usedSets = $scope.selectedTotem.usedArray;

		//Array of sets sharing the rarity of the sets this totem can generate from
		$scope.totemSets = $filter('filter')($scope.sets, {'setRarity': rarity}, true);
		var usedSetObject = {};

		for (var i = 0; i < $scope.totemSets.length; i++) {
			//For each totem set, push an object onto this array that has a used value of true or false
			var setId = $scope.totemSets[i]._id;
			usedSetObject[setId] = false;
			for (var j = 0; j < usedSets.length; j++) {

				//If set id is one of the ids in used array, mark it as used in the constructed set array
				if($scope.totemSets[i]._id == usedSets[j]) {
					usedSetObject[setId] = true;
				}
			}
		}

		$scope.usedSetsById = usedSetObject;

		//REMOVE AFTER TESTING
		console.log("UsedSetsById: " + JSON.stringify($scope.usedSetsById));
	}

	//Function for calling contract function to useTotem(tokenId, setId)
	$scope.useTotem = function(tokenId, setId) {

  	  var account = $scope.account;
  	  var gasUsed = web3.toBigNumber("500000");
  	  console.log(gasUsed);

      $scope.contractInstance.useTotem(tokenId, setId, {from: account, gas: gasUsed * 1.3},
        function(e, result) {
          if(!e) {
          	//REMOVE AFTER TESTING
            console.log('Use totem: ' + tokenId + " to generate a card from set: " + setId);
            $scope.selectedTotem.usedArray.push(setId);
            $scope.getUsableTotemSets();


          }
          else {
            console.log(e);
          }
      });
	}

	//Function to check if user can claim totem for selected set
	$scope.setCanClaimTotem = function() {
    console.log('setCanClaimTotem called');
    //If set 0 is selected, don't allow claiming totem modal to pop up
    if($scope.cardSet == 0) {
      console.log('in 1');
      $scope.canClaimTotem = false; return;
    }

		$scope.canClaimTotem = true;

		//Check if totem card prototype does not exist for this set
		if ($scope.selectedTotemPrototype == undefined) {
      console.log('in 2');
			$scope.canClaimTotem = false;
			return;
		}
		//Check if user owns totem from this set already
		if($scope.isSelectedTotems) {
      console.log('in 3');
			$scope.canClaimTotem = false;
			return;
		}

		//Another check if user owns totem assigned to this set already
		var ownedTotem = $filter('filter')($scope.totems, {cardPrototypeId: $scope.selectedTotemPrototype._id}, true)[0];
		if(ownedTotem != undefined) {
      console.log('in 4');
      console.log(JSON.stringify(ownedTotem));
			$scope.canClaimTotem = false;
		}

		//If all cards are owned, user can claim totem
		for (var i = 0; i < $scope.cardStatusArray.length; i++) {
			if ($scope.cardStatusArray[i].owned == false) {
        console.log('in 5');
				$scope.canClaimTotem = false;
			}
		}

		$scope.toggleClaimTotemImage = true;
		if($scope.selectedTotems == undefined) {
      console.log('in 6');
			$("#totem-image").attr("data-toggle", 'modal');
		}


		//If can claim totem, update html to allow clicking on image to popup claim totem modal
		if ($scope.canClaimTotem) {
      console.log('in 1');
			$("#totem-image").attr("data-toggle", 'modal');
			$('#totem-image').attr('data-target','#exampleModal');
		}
	}

	$scope.claimTotem = function() {
		if (!$scope.canClaimTotem) {
			return;
		}
		var gasUsed = 300000;

		$scope.contractInstance.claimTotem($scope.selectedSet, {from: $scope.account, gas: gasUsed * 1.3},
	        function(e, result) {
	          if(!e) {
	          	//REMOVE AFTER TESTING
	            console.log("Claim totem from set: " + $scope.selectedSet + " was successful");

	            $("#claim-totem-message").html("<p>Claim totem request received. It may take several minutes for your transaction to be confirmed.</p>");
	          }
	          else {
	            console.log(e);
	          }
	      });
	}

}]);