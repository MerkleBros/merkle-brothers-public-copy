//$http returns a res object, actual data is stored in res.data
angular.module('ArtCardCtrl', []).controller('ArtCardController', ['$scope', '$location', '$http', '$filter', function($scope, $location, $http, $filter) {

	//SET WHEN CONTRACT DEPLOYED

  //Contract address for Ropsten
	 var contractAddress = '0x1d7Ae6EfDaBCc50f8bc240b5FfE81C8618370B9D';

  //Contract address for local testing with ganache-cli
  //var contractAddress = '0xd2e8d9173584d4daa5c8354a79ef75cec2dfa228';

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
  $scope.user = {};
  $scope.token = "";
  $scope.authenticated = false;
  $scope.signInFlag = false;
  $scope.userInfoHelpMessage = "Please authenticate by signing the Metamask personal message.";
  $scope.helpMessageColor = '#9aff9a';
  $scope.$on('$locationChangeSuccess', function(event) {
    console.log("Location was changed: " + $location.url());
    if($location.url() == '/enter-user-information') {
      $scope.signInFlag = true;
      $scope.signIn();
    }
  });
	//Retrieve existing art cards, then check for web3
  if($location.url() != '/enter-user-information') {
  	$http.get('/artprototypebook/').then(function(res) {
  		$scope.artCardPrototypes = res.data;
      $scope.selectedCard = $scope.artCardPrototypes[0];

      let newPromise = new Promise(function(resolve, reject) {
        resolve();
      });

      return newPromise;

  	})
  	.then(function(res) {
      return $http.get('/promobook/');
    }).then(function(res) {
      $scope.limitedCards = res.data;
      //  REMOVE AFTER TESTING
      // console.log('limited cards: ' + JSON.stringify($scope.limitedCards));

      // $scope.foundersTotems = $filter('filter')($scope.limitedCards, {cardSet: 0}, true);  
      // $scope.promoCards = $filter('filter')($scope.limitedCards, {cardSet: 9999}, true); 

      let newPromise = new Promise(function(resolve, reject) {
        resolve();
      });

      return newPromise; 
    })
    .then(function(res) {
      checkWeb3();
    });
  }
  else {
    checkWeb3();
  }

	//Check for web3. Update price and amount information from contract if it exists
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

            //Update card prices and amounts from contract to overwrite db (db only updated once every hour)
            if($scope.signInFlag == false) {
              for (var i = 0; i < $scope.artCardPrototypes.length; i++) {

                //Wrapping function to capture for variable values
                (async function(j) {

                  var cardPrototype = $scope.artCardPrototypes[j];
                  $scope.contractInstance.cardPrices.call(cardPrototype._id, async function(e, res) {
                    if(e) {console.log(e);}
                    else {
                      var newPrice = await web3.fromWei(res, 'ether');
                      $scope.artCardPrototypes[j].priceEth = newPrice;
                      $scope.$apply();
                    }
                  });
                  $scope.contractInstance.cardAmounts.call(cardPrototype._id, function(e, res) {
                    if(e){console.log(e);}
                    else {
                      $scope.artCardPrototypes[j].amount = res.toNumber();
                      $scope.$apply();
                    }
                  }); 
                })(i);               
              }
              for (var i = 0; i < $scope.limitedCards.length; i++) {

                //Wrapping function to capture for variable values
                (async function(j) {

                  var cardPrototype = $scope.limitedCards[j];
                  $scope.contractInstance.cardPrices.call(cardPrototype._id, async function(e, res) {
                    if(e) {console.log(e);}
                    else {
                      var newPrice = await web3.fromWei(res, 'ether');
                      $scope.limitedCards[j].priceEth = newPrice;
                      $scope.$apply();
                    }
                  });
                  $scope.contractInstance.cardAmounts.call(cardPrototype._id, function(e, res) {
                    if(e){console.log(e);}
                    else {
                      $scope.limitedCards[j].amount = res.toNumber();
                      $scope.$apply();
                    }
                  }); 
                })(i);               
              }
              // console.log(JSON.stringify($scope.artCardPrototypes));
              // $scope.$apply()
            }
            $scope.$apply();
            //REMOVE AFTER TESTING
		        // console.log($scope.account);

            if($scope.signInFlag == true) {
              $scope.signIn();
            }

		        // getCards();

		      }
		    });
		} 
		else {console.log('Web3 provider not detected in ArtCardCtrl');}
	};

  $scope.updateSelectedCard = function(id, set) {
    if (set == 9000) {
      //Art card
      $scope.selectedCard = $filter('filter')($scope.artCardPrototypes, {_id: id}, true)[0];
    }
    if (set == 9999) {
      //Promo card
      $scope.selectedCard = $filter('filter')($scope.limitedCards, {_id: id}, true)[0];
    }
    if (set == 0) {
      //Founder's totem card
      $scope.selectedCard = $filter('filter')($scope.limitedCards, {_id: id}, true)[0];
    }

    //REMOVE AFTER TESTING
    console.log("Update selected card called with id: " + id);
    console.log("Update selected card function call: " + JSON.stringify($scope.selectedCard));
  };

  $scope.buyCard = function() {
    //Call contract function buyCard
    var gasUsed = 300000;
    var priceInWei = web3.toWei($scope.selectedCard.priceEth, 'ether');
    $scope.contractInstance.buyCard($scope.selectedCard._id, {from: $scope.account, value: priceInWei, gas: gasUsed * 1.3},
      function(e, result) {
        if(!e) {
          //REMOVE AFTER TESTING
          console.log('Tried to buy a card: ' + $scope.selectedCard.title);

          if($scope.selectedCard.cardSet == 0) {
            $("#totem-buy-message").html("<p>Request received! It may take several minutes for your transaction to be confirmed.</p>");
          }

          if($scope.selectedCard.cardSet == 9999) {
            $("#promo-buy-message").html("<p>Request received! It may take several minutes for your transaction to be confirmed.</p>");
          }

          $('#auctionModal .close').click();
          $('.modal-backdrop').hide();
          if($scope.selectedCard.cardSet == 9000) {
            $location.path('/enter-user-information');
            $scope.signIn();
          }
          $scope.$apply();
        }
        else {
          console.log(e.message);
        }
    });
  };

  $scope.signIn = function() {

    //Return if user already has a cookie
    let cookie = $scope.getCookie('x-access-token');

    if (cookie !== "") {

      $scope.token = cookie;
      $scope.authenticated = true;
      $scope.userInfoHelpMessage = "You are logged in. Please submit your information."
      $scope.helpMessageColor = '#8ffff6';
      $scope.$apply();
      return;   
    }

    //A sign in function to sign in using Metamask and web3
    var msg = "Please sign this message to confirm ownership of your account.";
    var addr = web3.eth.accounts[0];

    //REMOVE AFTER TESTING
    // console.log("web3.eth.personal: ");
    // console.log(web3);

    //Sign message to verify account ownership
    web3.personal.sign(web3.toHex(msg), addr, function(e, result) {
      if(e){console.log(e);}
      else {
        $http.post('/authenticate-user', {'address': addr, 'message': msg, 'userSignature': result})
        .then(function(result) {
            // REMOVE AFTER TESTING
            // console.log(JSON.stringify(result));

            if(result.status == 200) {
              //Authentication successful, assign token that expires in 1 day
              $scope.token = result.data.token;
              console.log($scope.token);
              let expires = new Date();
              expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
              document.cookie = "x-access-token=" + $scope.token + ";expires=" + expires.toUTCString();
              $scope.authenticated = true;
              $scope.userInfoHelpMessage = "You successfully authenticated! Please submit your information below."
              $scope.helpMessageColor = '#8ffff6';
              $scope.$apply();             
            }
            else {
              $scope.authenticated = false;
            }
            //Update view to show user authenticated
            //Update JSON webtoken stuff?
        });
      }
    });
  };

  $scope.moveToUserInfo = function() {
    $location.path('/enter-user-information');
    $scope.$apply();
  };

  $scope.submitUserInfo = function() {
    $scope.user.ethAddress = web3.eth.accounts[0];
    console.log($scope.user);

    //Retrieve form data
    var formData = angular.copy($scope.user);
    // console.log('formData: ');
    // console.log(JSON.stringify(formData));

    let cookie = $scope.getCookie('x-access-token');

    $http({
      url: '/submit-user-info',
      method: 'POST',
      headers: {
        'x-access-token': cookie
      },
      data: {
        'user': $scope.user,
        'name': formData.name,
        'email': formData.email,
        'mailingAddress': formData.mailingAddress,
        'sendPromoEmails': formData.sendPromoEmails,
        'ethAddress': $scope.user.ethAddress
      }
    })
    .then(function(response) {
        $scope.userInfoHelpMessage = response.data.message;
        $scope.helpMessageColor = "#9aff9a";
      }, function(response) {
        $scope.userInfoHelpMessage = response.data.message;
        $scope.helpMessageColor = "#ffdd9c";
      }
    );
  }

  //Takes key of cookie and returns value of cookie
  $scope.getCookie = function(cookieName) {
      var name = cookieName + "=";
      var cookieAray = document.cookie.split(';');
      for(var i = 0; i < cookieAray.length; i++) {
          var c = cookieAray[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }
}]);