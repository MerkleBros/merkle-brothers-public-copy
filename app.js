//Logging to check process env
console.log("Starting app with NODE_ENV: " + process.env.NODE_ENV);

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//Routes defined in routes folder
var index = require('./routes/index');
var cardbook = require('./routes/cardbook');
var cardprototypebook = require('./routes/cardprototypebook');
var artprototypebook = require('./routes/artprototypebook');
var totembook = require('./routes/totembook');
var totemprototypebook = require('./routes/totemprototypebook');
var promobook = require('./routes/promobook');
var setbook = require('./routes/setbook');
var myCollection = require('./routes/myCollection');
var auctionHouse = require('./routes/auctionHouse');
var submitUserInfo = require('./routes/submitUserInfo');
var authenticateUser = require('./routes/authenticateUser');
var history = require('./routes/history');
var createDeck = require('./routes/createdeck');
var getDecks = require('./routes/getdecks');
var removeDeck = require('./routes/removedeck');

/******** Database stuff start ******/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create token model
var Token = require('./models/Token');

//Create cardPrototype model
var CardPrototype = require('./models/CardPrototype');

//Create totemToken model
var TotemToken = require('./models/TotemToken');

//Create totemPrototype model
var TotemPrototype = require('./models/TotemPrototype');

//Create action model
var Action = require('./models/Action');

//Create set model
var CardSet = require('./models/CardSet');

//Create user model
var User = require('./models/User');

//Mongoose connection options
const options = {
  poolSize: 800,
};

//Open Mongoose connection to mongodb database
//Have to have mongod running sudo service mongod start
//Default runs on port 27017
//Modify pool size as needed
//Modify user:pwd () for production

//Connection for local testing
mongoose.connect('mongodb://localhost/merkle-bros-2', options); 

//Connection format for production (replace username and password)
// mongoose.connect('mongodb://merkle-bros-production:abc12345@localhost/merkle-bros-2', options); 


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database connection error:'));
// db.on('open', function() {

/******** Database stuff end ******/

//Declare app
var app = express();

/************** Start logic relating to web3 **************/
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//When updating contract have to replace ABI, and .at('') value below
//And update watcherAddress

//Watcher address for local testing
var watcherAddress = "0x959fd7ef9089b7142b6b908dc3a8af7aa8ff0fa1";

//Watcher address for Ropsten production
// var watcherAddress = "0x6cd8c2f9a39fe48b43829706a431838514a74d90";

var MerkleBros = web3.eth.contract([
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
        "name": "_auctionId",
        "type": "uint256"
      }
    ],
    "name": "buyAuction",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
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
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
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
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
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
  }
]
  );

//Contract address for local testing via ganache-cli 
var contractInstance = MerkleBros.at('0xd2e8d9173584d4daa5c8354a79ef75cec2dfa228');

//Contract address for Ropsten 
// var contractInstance = MerkleBros.at('0x1d7Ae6EfDaBCc50f8bc240b5FfE81C8618370B9D');


globalContractInstance = contractInstance;
globalWeb3 = web3;

//An interval function will poll the contract for prices of promo and art cards to store in database
//This information is shown to users when they visit the auction-house page via promobook and artprototypebook routes.
//This saves on asking the contract for the value every request which kills scalability in these routes
async function getCardPricesAndAmounts() {
  //If web3 isn't connected, try again in 5 minutes
  if(!web3.isConnected()) {setTimeout(getCardPricesAndAmounts, 300000); return;}

  var artAndPromoQueryPromise = CardPrototype.find({cardSet: {$in: [9999, 9000]}});
  var totemQueryPromise = CardPrototype.find({_id: {$in: [1,2,3]}});

  artAndPromoQueryPromise.lean().exec();
  totemQueryPromise.lean().exec();
  
  artAndPromoQueryPromise.then(function(result) {

    //If results are found, add cardPrice and cardAmount fields for each card prototype
    if(result.length != 0 && result != undefined) {
      // console.log("Inside artAndPromoQueryPromise");
      try {
        for (var i = 0; i < result.length; i++) {

          //Wrapper function to correct event loop
          (async function(j) {
            var cardPrototype = result[j];

            //Get price (in wei) and amount
            var _priceInWei = await globalContractInstance.cardPrices.call(cardPrototype._id);
            var _amount = await globalContractInstance.cardAmounts.call(cardPrototype._id).toNumber();
            var _priceInEth = await globalWeb3.fromWei(_priceInWei, 'ether');
            CardPrototype.update({_id: cardPrototype._id}, {priceEth: _priceInEth, amount: _amount}, {multi: false}, function(e, result) {
              if(e) {console.log("Error getting card price and amount during setInterval");}
              else {
              }
            });
          })(i);
        }
      } catch(e) {console.log(e);}
    }
    else {
      //Continue
    }
  });

  totemQueryPromise.then(function(result) {

    //If results are found, add cardPrice and cardAmount fields for each card prototype
    if(result.length != 0 && result != undefined) {
      try {
        // console.log("Inside totemQueryPromise");
        for (var i = 0; i < result.length; i++) {

          //Wrapper function to correct event loop
          (async function(j) {
            var cardPrototype = result[j];

            //Get price (in wei) and amount
            var _priceInWei = await globalContractInstance.cardPrices.call(cardPrototype._id);
            var _amount = await globalContractInstance.cardAmounts.call(cardPrototype._id).toNumber();
            var _priceInEth = await globalWeb3.fromWei(_priceInWei, 'ether');

            //This logic didn't work :*(
            // //Get price (in wei) and amount
            // var _priceInWei = await globalContractInstance.cardPrices.call(cardPrototype._id, function(e, result) {
            //   if(e) {console.log(e);}
            //   return new Promise(function(resolve, reject) {
            //     console.log(result + " - priceInWei in totemQuery");
            //     resolve(result);
            //   });
            // });

            // //Get amount
            // var _amount = await globalContractInstance.cardAmounts.call(cardPrototype._id, function(e, result) {
            //   if(e) {console.log(e);}
            //   return new Promise(function(resolve, reject) {
            //     resolve(result.toNumber());
            //   });
            // });

            // //Make price in eth
            // var _priceInEth = await globalWeb3.fromWei(_priceInWei, 'ether', function(e, result) {
            //   if(e) {console.log(e);}
            //   return new Promise(function(resolve, reject) {
            //     resolve(result);
            //   });
            // });

            Promise.all([_priceInWei, _amount, _priceInEth]).then( function(resultOne) {
              CardPrototype.update({_id: cardPrototype._id}, {priceEth: _priceInEth, amount: _amount}, {multi: false}, function(e, result) {
                if(e) {console.log("Error getting card price and amount during setInterval");}
                else {
                  //Continue
                }
              });
            });
          })(i);
        }
      } catch(e) {console.log(e);}
    }
    else {
      //Continue
    }
  });
}

//Get card prices and amounts at start after one minute
//Call every 1 hour
setTimeout(getCardPricesAndAmounts, 60000);
setInterval(getCardPricesAndAmounts,3600000);




//Watch for MintCard events and update db when a card is minted
//A minted card is a new token belonging to the sending address
//Token and TotemToken models are both created with this event
var mintCardEvent = contractInstance.MintCard({});
mintCardEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //MintCard(address indexed _owner, uint256 indexed _tokenId,
    //uint32 indexed _cardPrototypeId);
    try {
    var owner = result.args._owner;
    var tokenId = result.args._tokenId.toString();
    var cardPrototype = result.args._cardPrototypeId.toNumber();
    var block = result.blockNumber;
    } catch(e) {
      console.log('Error grabbing event values for minting token');}
    try {
      //Create new Token document
      Token.create({_id: tokenId, address: owner, cardPrototypeId: cardPrototype, blockNumber: block}, function(e, result) {
        if(e) {console.error(e);}

        //Just logging stuff 
        console.log('Created a token, tokenId: ' + tokenId);
        console.log('Block number: ' + block);
        console.log(result);
      });
    } catch(e) {console.log('Error while saving new token to database, tokenId: ' + tokenId);}

    async function updateTotemTokens(owner, tokenId, cardPrototypeId) {
      try {
        mongoose.connection.db.listCollections({
          name: 'totemprototypes'
        }).next(function(err, collinfo) {
          if (collinfo) {
            //collection exists

            //Check if given cardPrototype exists in TotemPrototype collection
            TotemPrototype.findOne({_id: cardPrototypeId}, function(err, result) {
              if(!result) {
                //cardPrototype does not exist in TotemPrototype collection (so is not a totem)
                return;
              }
              else {
                //Card was a totem. Save a TotemToken document to database
                TotemToken.create({_id: tokenId, address: owner, cardPrototypeId: cardPrototypeId, blockNumber: block}, function(e, result) {
                  if(e) {console.error(e);}
                  console.log('Created a totemToken, tokenId: ' + tokenId);
                  console.log(result);
                });
              }
            });
          }
          else {
            //TotemPrototypes collection does not exist
            //Skip updating
            return;
          }
        });

      } catch (e) {console.error(e); console.log('Unable to update totemTokens');}
    }

    updateTotemTokens(owner, tokenId, cardPrototype);

  }
  else {
    console.log('Failed to watch MintCard event correctly');
    console.log(e);
  }
});

//Watch for AddSet events and update db when a new set is created
var addSetEvent = contractInstance.AddSet({});
addSetEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //AddSet(address indexed _creator, uint32 indexed _setId,
    //bytes32 indexed _setTitle, uint8 _setRarity);

    try {
      //Details to save if collections already exists
      var creator = result.args._creator;
      var setId = result.args._setId.toNumber();
      var titleHex = result.args._setTitle;
      var title = web3.toAscii(result.args._setTitle).replace(/\u0000/g, '');
      var rarity = result.args._setRarity.toNumber();
      var block = result.blockNumber;
    } catch(e) {console.log('Error retrieving set details from event'); return;}

    //If collection exists, add new set to collection
    //If collection does not exist, retrieve all sets from event logs and save to collection
    async function updateSets() {
      try {
        mongoose.connection.db.listCollections({
          name: 'cardsets'
        }).next(function(err, collinfo) {
          if (collinfo) {
            //collection exists

            //Create new CardSet document  
            CardSet.create({_id: setId, setTitle: title, setTitleHex: titleHex,
            setRarity: rarity, setCreator: creator, blockNumber: block}, function(e, result) {
              if(e) {console.error(e);}
              console.log('Created a set');
              console.log(result);
            });
          }
          else {
            //Collection did not exist

            //Retrieve all AddSet event logs
            contractInstance.AddSet({}, { fromBlock: 0, toBlock: 'latest' }).get((error, result) => {
              if (error) {console.log('Error in retrieving past AddSet events ' + error);}
              else {
                for (var i = 0; i < result.length; i++) {

                  //Wrapper function for event loop
                  (async function(j) {

                    //Retrieve set args from each log 
                    var id = result[j].args._setId.toNumber();
                    var _setTitleHex = result[j].args._setTitle;
                    var _setTitle = web3.toAscii(_setTitleHex).replace(/\u0000/g, '');
                    var _setRarity = result[j].args._setRarity.toNumber();
                    var _setCreator = result[j].args._creator;
                    var block = result[j].blockNumber;

                    //Save a CardSet document for each event log
                    CardSet.create({_id: id, setTitle: _setTitle, setTitleHex: _setTitleHex,
                    setRarity: _setRarity, setCreator: _setCreator, blockNumber: block}, function(e, result) {
                      if(e) {console.error(e);}
                      console.log('Created a set');
                      console.log(result);
                    });
                  })(i);
                }
              }
            });
          }
        });
      } catch (e) {console.error(e); console.log('Unable to update sets');}
    }

    updateSets();

    }
    else {
      console.log('Failed to watch AddSet event correctly');
    }
});

//Watch for SetTotemToSet events and update db when a totem is assigned to a set
var setTotemToSetEvent = contractInstance.SetTotemToSet({});
setTotemToSetEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //SetTotemToSet(address indexed _creator, uint32 indexed _cardPrototypeId, uint32 indexed _setId);

    try {
      //Details to update totem
      var creator = result.args._creator;
      var totemId = result.args._cardPrototypeId.toNumber();
      var setId = result.args._setId.toNumber();
      var block = result.blockNumber;
    } catch(e) {console.log('Error retrieving totem details from event'); return;}

    try {
      //Update totem model with assigned set
      TotemPrototype.update({_id: totemId}, {assignedSet: setId, lastUpdateBlock: block}, {multi: false}, function(e, raw) {
        if(e) {console.error(e);}
        console.log('Totem:' + totemId + " was assigned to set:" + setId);
      });
    } catch(e) {console.log('Error while updating assign totem to new set');}
  }
  else {
    console.log('Failed to respond to SetTotemToSet event');
    console.log(e);
  }

});

//Watch for UseTotem events and update db when a totem is used to generate cards from a set
var useTotemEvent = contractInstance.UseTotem({});
useTotemEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //UseTotem(address indexed _owner, uint256 indexed _tokenId, uint32 indexed _setId);

    try {
      //Details to save if collections already exists
      var owner = result.args._owner;
      var totemId = result.args._tokenId.toString();
      var setId = result.args._setId.toNumber();
      var block = result.blockNumber;
    } catch(e) {console.log('Error retrieving totem details from usetotem event'); return;}

    try {
      //Update TotemToken model to show the totem was used to claim a card from a set
      TotemToken.update({_id: totemId}, {"$push": {"usedArray": setId}, lastUpdateBlock: block}, {multi: false}, function(e, raw) {
        if(e) {console.error(e);}
        console.log('Totem:' + totemId + " was used to generate a card from set " + setId);
      });
    } catch(e) {console.log('Error while updating useTotem');}
  }
  else {
    console.log('Failed to respond to UseTotem event');
    console.log(e);
  }

});


//Watch for AddAction events and update db when a new action is created
var addActionEvent = contractInstance.AddAction({});
addActionEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //AddAction(address indexed _creator, uint8 indexed _actionKey, bytes32 indexed _action)

    //Details to save if collection already exists
    try {
      var creator = result.args._creator;
      var actionKey = result.args._actionKey.toNumber();
      var hex = result.args._action;
      var actionString = web3.toAscii(result.args._action).replace(/\u0000/g, '');
      var block = result.blockNumber;
    } catch(e) {console.log('Error retrieving acton details from event log');}

    //If collection exists, add new action to collection
    //If collection does not exist, retrieve all actions from contract instance and save to collection
    async function updateActions() {
      try {
        mongoose.connection.db.listCollections({
          name: 'actions'
        }).next(async function(err, collinfo) {
          if (collinfo) {
            //Collection exists

            //Create new Action document  
            Action.create({_id: actionKey, action: actionString, actionHex: hex, actionCreator: creator, blockNumber: block}, async function(e, result) {
              if(e) {console.error(e);}

              //LOG
              console.log('Created an action');
              console.log(result);
              console.log('At blocknumber: ' + block);
            });
          }
          else {
            //Collection does not exist

            var actionCount = contractInstance.cardActionsCount.call({from: watcherAddress}).toNumber();
            contractInstance.AddAction({}, {fromBlock: 0, toBlock: 'latest'}).get(async function(err, logs) {
              for (var i = 1; i < actionCount; i++) {

                //Wrapper function for event loop
                (async function(j) {

                  //Retrieve action attributes from each action that exists in contract
                  var _actionHex = contractInstance.cardActions.call(j, {from: watcherAddress});
                  var _actionString = web3.toAscii(_actionHex).replace(/\u0000/g, '');
                  var _actionKey = j;
                  var _block = logs[j - 1].blockNumber;

                  //Save an Action document for each action that exists in contract
                  Action.create({_id: _actionKey, action: _actionString, actionHex: _actionHex, blockNumber: _block}, function(e, result) {
                  if(e) {console.error(e);}
                  console.log('Created an action');
                  console.log(result);
                  });
                })(i);
              }
            });
          }
        });
      } catch (e) {console.error(e); console.log('Unable to update actions');}
    }

    updateActions();
  }
  else {
    console.log('Watch event for AddActions failed');
    console.log(e);
  }

});

//Watch for Transfer event and update db when a token is transferred
var transferEvent = contractInstance.Transfer({});
transferEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)

    try {
      var from = result.args._from;
      var to = result.args._to;
      var token = result.args._tokenId.toString();
    } catch(e) {console.log('Error while retrieving transfer details from event log');}

    try {
      //Update Token model with new owner
      Token.update({_id: token}, {address: to}, {multi: false}, function(e, raw) {
        if(e) {console.error(e);}
        console.log('Token:' + token + " was transfered from:" + from + " to:" + to);
      });
    } catch(e) {console.log('Error while updating token transfer to database tokenId: ' + token);}
  }
  else {
    console.log('Failed to respond to Transfer event');
    console.log(e);
  }

});

//Watch for CreateCardPrototype events and update db when a new card prototype is created
var createCardPrototypeEvent = contractInstance.CreateCardPrototype({});
createCardPrototypeEvent.watch(function(e, result) {
  if(!e) {

    //Event schema from solidity:
    //CreateCardPrototype(address indexed _creator, uint32 indexed _cardPrototypeId);

    var creator = result.args._creator;
    var id = result.args._cardPrototypeId.toNumber();
    var block = result.blockNumber;

    try {
      //Get cardPrototype from contract instance
      var prototype = contractInstance.cardPrototytpeIdToCardPrototype.call(id, {from: watcherAddress});
    } catch(e) {console.log('Error while retrieving card prototype from contract during create event'); return;}
    
    //Get details from the cardPrototype
    var set = prototype[1].toNumber();
    var cardRarity = prototype[2].toNumber();
    var apcost= prototype[3].toNumber();
    var attack = prototype[4].toNumber();
    var health = prototype[5].toNumber();
    var action1 = prototype[6].toNumber();
    var action2 = prototype[7].toNumber();
    var action3 = prototype[8].toNumber();
    var valueOne = prototype[9].toNumber();
    var valueTwo = prototype[10].toNumber();
    var valueThree = prototype[11].toNumber();
    var titleString = web3.toAscii(prototype[12]).replace(/\u0000/g, '');
    var titleHex = prototype[12];
    var artistString = web3.toAscii(prototype[13]).replace(/\u0000/g, '');
    var artistHex = prototype[13];

    try {
      //Get action details relating to the actions this cardPrototype can perform
      var action1String = web3.toAscii(contractInstance.cardActions.call(action1, {from: watcherAddress})).replace(/\u0000/g, '');
      var action2String = web3.toAscii(contractInstance.cardActions.call(action2, {from: watcherAddress})).replace(/\u0000/g, '');
      var action3String = web3.toAscii(contractInstance.cardActions.call(action3, {from: watcherAddress})).replace(/\u0000/g, '');
    } catch(e) {console.log('Error while retrieving action details for card prototype create event');}
    
    var deploy = true;
    if(attack == 0 || health == 0) {deploy = false;}

    //artUrl, imgUrl, and flavorText will have to be updated via database or at a later point
    //as they are not created in the smart contract
    
    async function createPrototypeInfo() {

      //Temp variables for storing non-critical prototype info 
      var setTitleString;
      var _setTitleHex;


      //Queries for returning non-critical info
      var setTitleQuery = CardSet.findOne({_id: set});

      try {
        var _setTitleHex = await contractInstance.setTitles.call(set, {from: watcherAddress});
        var setTitleString = web3.toAscii(_setTitleHex).replace(/\u0000/g, '');

      } catch(e) {console.log('Could not retrieve set title'); setTitleString = ""; setTitleHex = "";} 

      try {

        //Save a new CardPrototype document to database
        let x = await CardPrototype.create({_id: id, cardSet: set, setTitle: setTitleString, setTitleHex: _setTitleHex, rarity: cardRarity,
        actionPointCost: apcost, attackValue: attack, healthValue: health, actionOne: action1, actionTwo: action2,
        actionThree: action3, actionOneValue: valueOne, actionOneString: action1String, actionTwoValue: valueTwo,
        actionTwoString: action2String, actionThreeValue: valueThree, actionThreeString: action3String,
        title: titleString, artist: artistString, deployable: deploy, blockNumber: block, lastUpdateBlock: block});
        console.log('CardPrototype with id:' + id + " was created from:" + creator);
        console.log(x);
      } catch(e) {console.error(e); console.log('Failed to create card prototype');}

      try {

        //Save a new totem document to database if the new prototype is a totem (belongs to set 0)
        if(set == 0) {
          let x = await TotemPrototype.create({_id: id, cardSet: set, setTitle: setTitleString, setTitleHex: _setTitleHex, rarity: cardRarity,
          actionPointCost: apcost, attackValue: attack, healthValue: health, actionOne: action1, actionTwo: action2,
          actionThree: action3, actionOneValue: valueOne, actionOneString: action1String, actionTwoValue: valueTwo,
          actionTwoString: action2String, actionThreeValue: valueThree, actionThreeString: action3String,
          title: titleString, artist: artistString, deployable: deploy, assignedSet: "", assignedRarity: apcost, blockNumber: block, lastUpdateBlock: block});
          console.log('TotemPrototype with id:' + id + " was created from:" + creator);
          console.log(x);
        }
      } catch(e) {console.error(e); console.log('Failed to create totem prototype');}
    }

    createPrototypeInfo();
  }

  else {
    console.log('Failed to respond to CreateCardPrototype event');
    console.log(e);
  }
});

//Watch for ModifyCardPrototype events and update db when a card prototype is modified
var modifyCardPrototypeEvent = contractInstance.ModifyCardPrototype({});
modifyCardPrototypeEvent.watch(function(e, result) {
  if(!e) {

    //Cannot delete card prototypes but can modify them by governance vote
    //Can't modify card prototype id, card set, card rarity, card title, card artist
    //Can modify action point cost, attack value, health value, card actions one, two, three,
    //card action values one, two, three

    //Event schema from solidity:
    //ModifyCardPrototype(address indexed _address, uint32 indexed _cardPrototypeId)

    var id = result.args._cardPrototypeId.toNumber();
    var block = result.blockNumber;

    try {
      //Get cardPrototype from contract instance
      var prototype = contractInstance.cardPrototytpeIdToCardPrototype.call(id, {from: watcherAddress});
    } catch(e) {console.log('Could not retrieve prototype from contract for modify event'); return;}

    //Get details from the cardPrototype
    var apcost= prototype[3].toNumber();
    var attack = prototype[4].toNumber();
    var health = prototype[5].toNumber();
    var action1 = prototype[6].toNumber();
    var action2 = prototype[7].toNumber();
    var action3 = prototype[8].toNumber();
    var valueOne = prototype[9].toNumber();
    var valueTwo = prototype[10].toNumber();
    var valueThree = prototype[11].toNumber();

    try {
      //Get action details relating to the actions this cardPrototype can perform
      var action1String = web3.toAscii(contractInstance.cardActions.call(action1, {from: watcherAddress})).replace(/\u0000/g, '');
      var action2String = web3.toAscii(contractInstance.cardActions.call(action2, {from: watcherAddress})).replace(/\u0000/g, '');
      var action3String = web3.toAscii(contractInstance.cardActions.call(action3, {from: watcherAddress})).replace(/\u0000/g, '');
    } catch(e) {consolelog('Error while retrieving action details for modify event');}

    var deploy = true;
    if(attack == 0 || health == 0) {deploy = false;}

    //Update document in database with new info from contract  
    async function updatePrototypeInfo() {
      try {
        //Find card prototype and update in database
        let x = await CardPrototype.findByIdAndUpdate(id, { $set: {
          actionPointCost: apcost, attackValue: attack, healthValue: health, actionOne: action1,
          actionTwo: action2, actionThree: action3, actionOneValue: valueOne, actionOneString: action1String,
          actionTwoValue: valueTwo, actionTwoString: action2String, actionThreeValue: valueThree,
          actionThreeString: action3String, lastUpdateBlock: block, deployable: deploy}}, { new: true });

        console.log('CardPrototype with id:' + id + " was modified:");
        console.log(x);
      } catch(e) {console.error(e); console.log('Failed to update modified card prototype');}
    }

    updatePrototypeInfo();
  }

  else {
    console.log('Failed to respond to ModifyCardPrototype event');
    console.log(e);
  }
});

//Call to check if collections are missing and if so retrieve from contract and repopulate database
reloadDatabase();

/************************** End logic relating to web3 ******************************/

/******************* Start utility functions **************/

//A function for getting a user's cards
//Get tokens of owner 
function getTokensOfOwner(owner) {
  var query = Token.find({address: owner});
  query.select('address _id cardPrototypeId');
  query.exec(function(e, cards) {
      if(e) {console.error(e);}
      console.log(cards);
  });
}

//Get sets
function getSets() {
  var query = CardSet.find({});
  query.select('setCreator setTitle setRarity');
  query.exec(function(e, sets) {
    if(e) {console.error(e);}
    console.log('Existing sets');
    console.log(sets);
  });
}

//Get actions
function getActions() {
  var query = Action.find({});
  query.select('_id action actionHex actionCreator');
  query.exec(function(e, actions) {
    if(e) {console.error(e);}
    console.log('Existing actions');
    console.log(actions);
  });
}

async function reloadDatabase() {

  //Check whether Action collection exists
  try {
    Action.count(function(err, count) {
      if (!err && count == 0) {
        //Collection did not exist, update database with all actions from contract
        updateActions();
      }
      else {
        console.log('actions collection exists');
      }
    });
  } catch(e) {console.log('Error with actions during reloadDatabase()');}
  try {
    //Check whether CardSet collection exists
    CardSet.count(function(err, count) {
      if(!err && count ==0) {
        //Collection did not exist, update database with all sets from contract
        updateSets();
      }
      else {
        console.log('set collection exists');
      }
    });
  } catch(e) {console.log('Error with sets during reloadDatabase()');}
  try {
    //Check whether CardPrototype collection exists
    //Starts a chain of functions for reloading database entries for cardPrototypes, tokens/totemtokens, setTotemToSet, and useTotems
    CardPrototype.count(function(err, count) {
      if (!err && count == 0) {
        //Collection did not exist, update database with all card prototypes from contract
        updateCardPrototypeCollection().
        then(function(resolved) {
          //Then update tokens and totemtokens (these depend on card prototype data)
          updateTokens();
        }).
        then(function(resolved) {
          //Then update setTotemToSet details
          updateSetTotemToSet();
        }).
        then(function(resolved) {
          //Then update useTotem details
          updateUseTotem();
        })
        .catch("Error wth cardprototype update or token update or setTotemToSet update or useTotem update");
      }
      else {
        console.log('cardprototypes collection exists');
        Token.count(function(err, count) {
          if(!err && count == 0) {
            //Token collection did not exist, update database with all tokens from contract
            updateTokens()
            .then(function(resolved) {
              updateUseTotem();
            })
            .catch("Error with updating tokens or totem uses.");
          }
          else {
            //Token collection exists, just update setTotemToSet information
            updateSetTotemToSet();
          }
        });
      }
    });
  } catch(e) {console.log('Error with card prototypes during reloadDatabase()');}
}

async function updateCardPrototypeCollection() {

  //Collection did not exist. Retrieve all cardPrototypes from contract and store to database
  console.log('Updating cardprototypes collection from contract');

  //Retrieve count of cardPrototypes
  try {
  var _cardPrototypeCount = contractInstance.cardPrototypeCount.call({from: watcherAddress}).toNumber();
  } catch (e) {console.log('Could not retrieve card prototype count from contract'); return;}

  //Create each card prototype
  try{
    contractInstance.CreateCardPrototype({}, {fromBlock: 0, toBlock: 'latest'}).get(async function(err, logs) {
      console.log("In updatecardprototypecollection with results: " + logs.length);
      for (var i = 1; i < _cardPrototypeCount; i++) {

        var id = i;
        try {
          //Get blocknumber
          var block = logs[i - 1].blockNumber;
        } catch(e) {}

        try {
        //Get cardPrototype from contract instance
          var prototype = contractInstance.cardPrototytpeIdToCardPrototype.call(id, {from: watcherAddress});
        } catch (e){console.log('Could not retrieve card prototype' + id + ' from contract'); continue;}

        //Get details from the cardPrototype and convert to correct types
        var set = prototype[1].toNumber();
        var cardRarity = prototype[2].toNumber();
        var apcost= prototype[3].toNumber();
        var attack = prototype[4].toNumber();
        var health = prototype[5].toNumber();
        var action1 = prototype[6].toNumber();
        var action2 = prototype[7].toNumber();
        var action3 = prototype[8].toNumber();
        var valueOne = prototype[9].toNumber();
        var valueTwo = prototype[10].toNumber();
        var valueThree = prototype[11].toNumber();
        var titleString = web3.toAscii(prototype[12]).replace(/\u0000/g, '');
        var titleHex = prototype[12];
        var artistString = web3.toAscii(prototype[13]).replace(/\u0000/g, '');
        var artistHex = prototype[13];

        try {
          //Get set title
          var _setTitleHex = await contractInstance.setTitles.call(set, {from: watcherAddress});
          var setTitleString = web3.toAscii(_setTitleHex).replace(/\u0000/g, '');

        } catch(e) {console.log('Could not retrieve set title'); setTitelString = ""; setTitleHex = "";} 

        //Get action details relating to the actions this cardPrototype can perform
        try {
          var action1String = web3.toAscii(contractInstance.cardActions.call(action1, {from: watcherAddress})).replace(/\u0000/g, '');
          var action2String = web3.toAscii(contractInstance.cardActions.call(action2, {from: watcherAddress})).replace(/\u0000/g, '');
          var action3String = web3.toAscii(contractInstance.cardActions.call(action3, {from: watcherAddress})).replace(/\u0000/g, '');
        } catch (e) {console.log('Could not retrieve action strings');}

        var deploy = true;
        if(attack == 0 || health == 0) {deploy = false;}   

        try {
        //Save a new CardPrototype document to database
        let x = await CardPrototype.create({_id: id, cardSet: set, setTitle: setTitleString, setTitleHex: _setTitleHex, rarity: cardRarity,
        actionPointCost: apcost, attackValue: attack, healthValue: health, actionOne: action1, actionTwo: action2,
        actionThree: action3, actionOneValue: valueOne, actionOneString: action1String, actionTwoValue: valueTwo,
        actionTwoString: action2String, actionThreeValue: valueThree, actionThreeString: action3String,
        title: titleString, artist: artistString, blockNumber: block, deployable: deploy});
        console.log('CardPrototype with id:' + id + " was created");
        console.log(x);
        } catch(e) {console.error(e); console.log('Error saving card prototype ' + id + ' to database');}

        try {
          //Check if card prototype is a totem (set == 0) and save a totemPrototype if so
          if(set == 0) {
            let y = await TotemPrototype.create({_id: id, cardSet: set, setTitle: setTitleString, setTitleHex: _setTitleHex, rarity: cardRarity,
            actionPointCost: apcost, attackValue: attack, healthValue: health, actionOne: action1, actionTwo: action2,
            actionThree: action3, actionOneValue: valueOne, actionOneString: action1String, actionTwoValue: valueTwo,
            actionTwoString: action2String, actionThreeValue: valueThree, actionThreeString: action3String,
            title: titleString, artist: artistString, deployable: deploy, assignedSet: "", assignedRarity: apcost, blockNumber: block});
            console.log('TotemPrototype with id:' + id + " was created");
            console.log(y);
          }
        } catch(e) {console.error(e); console.log("Error checking and saving totemPrototype");}
      }
    });
  } catch(e) {console.log('Failed to update card prototypes from updateCardPrototypeCollection()');}
}

async function updateActions() {
  //Update actions collection with all actions from contract
  try {
    var actionCount = await contractInstance.cardActionsCount.call({from: watcherAddress}).toNumber();
    await contractInstance.AddAction({}, {fromBlock: 0, toBlock: 'latest'}).get(async function(err, logs) {
      for (var i = 1; i < actionCount; i++) {

        //Wrapper function for event loop
        (async function(j) {
          try {
            //Retrieve action attributes from each action that exists in contract
            var _actionHex = contractInstance.cardActions.call(j, {from: watcherAddress});
            var _actionString = web3.toAscii(_actionHex).replace(/\u0000/g, '');
            var _actionKey = j;
            var _block = logs[j - 1].blockNumber;
          } catch(e) {console.log('Could not retrieve actions details from contract');
          console.log(e);}

          try {
            //Save an Action document for each action that exists in contract
            Action.create({_id: _actionKey, action: _actionString, actionHex: _actionHex, blockNumber: _block}, function(e, result) {
              if(e) {console.error(e);}
              console.log('Created an action');
              console.log(result);
            });
          } catch(e) {console.log('Error when saving action id ' + j + ' to the database');}
        })(i);
      
    }});
  } catch(e) {console.log('Could not retrieve actions count from contract');}
}

async function updateSets() {

  //Collection did not exist
  try {
    //Retrieve all AddSet event logs
    contractInstance.AddSet({}, {fromBlock: 0, toBlock: 'latest'}).get(async function(err, result) {
      //Cycle through all sets and save to database
      for (var i = 0; i < result.length; i++) {

        //Wrapper function for event loop
        (async function(j) {
        
          try {
            //Retrieve set args from each log 
            var id = result[j].args._setId.toNumber();
            var _setTitleHex = result[j].args._setTitle;
            var _setTitle = web3.toAscii(_setTitleHex).replace(/\u0000/g, '');
            var _setRarity = result[j].args._setRarity.toNumber();
            var _setCreator = result[j].args._creator;
            var _block = result[j].blockNumber;
          } catch(e) {console.log('Error retrieving set details in updateSets() for setId: ' + id);}
          try {
            //Save a CardSet document for each event log
            CardSet.create({_id: id, setTitle: _setTitle, setTitleHex: _setTitleHex,
            setRarity: _setRarity, setCreator: _setCreator, blockNumber: _block}, function(e, result) {
              if(e) {console.error(e);}
              console.log('Created a set');
              console.log(result);
            });
          } catch(e) {console.log('Error while saving set ' + id + ' to database in updateSets()');}
        })(i);
      }
    });
  } catch(e) {console.log('Error while retrieving AddSet event log');}
}

async function updateSetTotemToSet() {

  try {
    //Retrieve all SetTotemToSet event logs
    contractInstance.SetTotemToSet({}, { fromBlock: 0, toBlock: 'latest' }).get(async function(err, result) {
    
      //Cycle through all sets and save to database
      for (var i = 0; i < result.length; i++) {
        //Wrapper function to correct event loop
        (async function(j) {
        
          try {
            //Retrieve set args from each log 
            var _totemId = result[j].args._cardPrototypeId.toNumber();
            var _setId = result[j].args._setId.toNumber();
            var _setCreator = result[j].args._creator;
            var _block = result[j].blockNumber;
          } catch(e) {console.log('Error retrieving event details in updateSetTotemToSet() for totemId: ' + _totemId);}
          try {
            //Update TotemPrototype with assigned set from event
            TotemPrototype.update({_id: _totemId}, {assignedSet: _setId, lastUpdateBlock: _block}, {multi: false}, function(e, raw) {
              if(e) {console.error(e);}
              //This fails to account for all updates due to event loop weirdness
              //Still updates database correctly though.
              console.log('Totem:' + _totemId + " was assigned to set:" + _setId);
            });
          } catch(e) {console.log('Error while updating assign totem to new set in updateSetTotemToSet, totemId: ' + _totemId);}
        })(i);
      }
    });
  } catch(e) {console.log('Error while retrieving SetTotemToSet event log');}
}

//Update totemtoken uses in database (update usedArray for each totemtoken)
async function updateUseTotem() {
  try {
    //Retrieve all useTotem event logs
    contractInstance.UseTotem({}, { fromBlock: 0, toBlock: 'latest' }).get(async function(err, result) {

    
      //Cycle through all results and save to database
      for (var i = 0; i < result.length; i++) {
        
        //Wrapper function to correct event loop
        (async function(j) {
          try {
            //Retrieve set args from each log 
            var _tokenId = result[j].args._tokenId.toString();
            var _setId = result[j].args._setId.toNumber();
            var _owner = result[j].args._owner;
            var _block = result[j].blockNumber;
          } catch(e) {console.log('Error retrieving event details in updateUseTotem() for totemId: ' + _tokenId);}
          try {
            //Update TotemToken model to show the totem was used to claim a card from a set
            TotemToken.update({_id: _tokenId}, {"$push": {"usedArray": _setId}, lastUpdateBlock: _block}, {multi: false}, function(e, raw) {
              if(e) {console.error(e);}
              console.log('Totem:' + _tokenId + " was used to generate a card from set " + _setId);
            });
          } catch(e) {console.log('Error while updating useTotem details for TotemToken: ' + _tokenId);}
        })(i);
      }
    });
  } catch(e) {console.log('Error while retrieving useTotem event log in updateUseTotem');}
}

//Update tokens in database
async function updateTokens() {
  try {
    var count = await contractInstance.tokenCount.call({from: watcherAddress, gas: 300000});
  } catch(e) {console.log('Could not retrieve tokenCount while updating token database');}
  try {
    await contractInstance.MintCard({}, {fromBlock: 0, toBlock: 'latest'}).get(function(e, logs) {

      for (var i = 1; i < count; i++) {
        //Wrapping function to get event loop in correct order
        (async function(j) {
          try {
            
            //tokenId is technically a number but should be a string for saving to database.
            //Mongoose seems to convert it to string
            //Maybe a problem at very large count of tokens?
            var tokenId = j;
            var owner = await contractInstance.tokenIdToOwner.call(tokenId, {from: watcherAddress, gas: 300000});
            var cardPrototype = await contractInstance.tokenIdToCardPrototypeId.call(tokenId, {from: watcherAddress, gas: 300000}).toNumber();
            var block = logs[j - 1].blockNumber;
          } catch(e) {console.log('Could not retrieve token details in updateTokens()');}
          try {
            //Create new Token document
            await Token.create({_id: tokenId, address: owner, cardPrototypeId: cardPrototype, blockNumber: block}, function(e, result) {
              if(e) {console.error(e);}

              //Just logging stuff 
              console.log('Created a token');
              console.log(result);
            });
          } catch(e) {console.log('Error while saving new token to database, tokenId: ' + tokenId);}
          try {
            //Check if token is a totem (make sure updateTokens is called async after all cardPrototypes have been stored)
            await CardPrototype.find({_id: cardPrototype}, async function(e, result) {
              if(result[0].cardSet == 0) {
                //Card was a totem. Save a TotemToken document to database
                console.log("Cardprototypeid for found card" + result[0]._id);
                console.log("cardSet before saving totemtoken: " + result[0].cardSet);
                console.log("TokenId before saving totemtoken: " + tokenId);
                console.log("cardPrototypeId before saving totemtoken: " + cardPrototype);
                await TotemToken.update({_id: tokenId}, {address: owner, cardPrototypeId: cardPrototype, blockNumber: block}, {upsert: true}, function(e, result) {
                  if(e) {console.error(e);}
                  console.log('Created a totemToken, tokenId: ' + tokenId);
                  console.log(result);
                });

              }
            });
          } catch(e) {console.error(e); console.log("Error while saving new totemToken to database, tokenId: " + tokenId);}
        })(i);
      }
    });
  } catch(e) {console.log('Error while updating database for updateTokens()');}
}

/********************* End utility functions *************/

// // view engine setup
var cons = require('consolidate');

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/cardbook', cardbook);
app.use('/cardprototypebook', cardprototypebook);
app.use('/artprototypebook', artprototypebook);
app.use('/totembook', totembook);
app.use('/totemprototypebook', totemprototypebook);
app.use('/sets', setbook);
app.use('/auctionhouse', auctionHouse);
app.use('/getdecks', getDecks);
app.use('/removedeck', removeDeck);

//Post requests
app.use('/submit-user-info', [
  body('user.name').trim().escape(),
  body('user.email').trim().escape(),
  body('user.mailingAddress').trim().escape(),
  body('user.ethAddress').trim().escape(),
  sanitizeBody('user.sendPromoEmail').toBoolean()
  ],  submitUserInfo);
app.use('/authenticate-user', [
  body('address').trim().escape(),
  body('message').trim().escape(),
  body('userSignature').trim().escape()
  ], authenticateUser);
app.use('/create-deck', [
  body('newDeck.deckName').trim().escape(),
  body('newDeck.deckCards').trim().escape(),
  body('newDeck').trim().escape()
  ], createDeck);
app.use('/removedeck', [
  body('deck.deckName').trim().escape(),
  body('deck').trim().escape()
  ], removeDeck);

app.use('/promobook', promobook);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/buy-packs', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/buy-packs.html'));
});
app.get('/my-collection', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/my-collection.html'));
});
app.get('/auction-house', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/bootstraptiles.html'));
});
app.get('/about', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});
app.get('/history', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/history.html'));
});
app.get('/deckbuilder', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/deckbuilder.html'));
});
app.get('/arena', function(req,res) {
  res.sendFile(path.join(__dirname, 'public/arena.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.redirect('/');
});

module.exports = app;