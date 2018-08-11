# Merkle Brothers (<a href="https://www.merklebros.com">https://www.merklebros.com</a>)
<h3>Summary</h3>
Merkle Brothers is a trading card game built on Ethereum where users can vote on the 'meta'. 

A governance system allows user votes to modify existing card attributes and vote new cards into the game.

Artists can introduce new cards into the card ecosystem and receive a portion of the proceeds generated from users purchasing cards.

Trading cards are represented as blockchain tracked tokens following the <a href="">ERC-721 Non-Fungible Token Standard</a>, a standard for tracking unique tokens on the Ethereum blockchain. 

Users can also purchase limited edition fine-art prints of each card illustration that are tracked on the blockchain and physically connected to Ethereum using NFC technology.

<h3>Why Blockchain?</h3>
<ol>
<li>Immutable ownership. This technology allows digital assets to behave much more like physical assets.  Users have actual ownership of the cards that they play with, they can sell or trade cards as they wish, and even bring the cards to other websites and games. 
<li>Distributed governance. Users can be involved in the experience of shaping aspects of the game via weighted voting where votes are weighted by card ownership.</li>
<li>Self-balancing via governance. A user majority can agree to make over-powered cards less powerful and vice-versa, or to add new cards to balance out existing cards.</li>
<li>Immutable contracts. Ethereum allows for 'smart contracts' to run on the blockchain. This contract logic can be made viewable for all users, and cannot be altered once implemented. This means that a central authority cannot step in to override the decisions of the user majority (except for special legal or technical situations that require some small central authority). 
</ol>


# Technologies and folder organization
<h3>Ethereum</h3>
<b>Smart contract</b>

/contracts/MerkleBros.sol

The smart contract is written in <a href="https://github.com/ethereum/solidity">Solidity</a>, a language for writing smart contracts for use in the Ethereum Virtual Machine (EVM). It describes token minting and ownership as well as card prototype creation and modification.

<b>Contract artifacts</b>

/build/contracts/

/migrations

<a href="https://github.com/trufflesuite/truffle">Truffle</a> is a development framework for creating Ethereum dApps (decentralized apps). It can be used to deploy contracts to local testing blockchains, to Ethereum testnets (Ropsten/Kovan/Rinkeby), or to the live Ethereum mainnet. <a href="https://truffleframework.com/ganache">Ganache</a> is a tool used to create local testing blockchains. 

<b>Local Ethereum node</b>

<a href="https://github.com/ethereum/go-ethereum/wiki/geth">Geth (Go-Ethereum)</a> is a command-line tool for running a full Ethereum node. The node is run on the same web-server with the live website. Geth communicates changes in the Ethereum blockchain state related to the smart contract. The website listens for these events and stores state in a database.

<b>Web3/Metamask</b>

<a href="https://github.com/ethereum/web3.js/">Web3</a> is an Ethereum javascript API allowing Javascript to communicate with the local Ethereum node on the back-end. It is also used alongside <a href="https://metamask.io/">Metamask</a> for interacting with the Ethereum network in the browser.

<h3>MEAN App</h3>

./app.js

The server-backend app uses Mongodb, Express, and Nodejs. Most of app.js is event listeners waiting for updates from the local Ethereum node. The node sends updates when certain smart contract states are updated on the Ethereum network. These include things like minting new tokens, users trading tokens, and creating and altering card prototypes (the blueprints for cards). 

./models

Mongodb is used to store documents related to the Ethereum state and information from website users. Models exist for Users, CardPrototypes (card blueprints), Tokens (owned instances of cardPrototypes), CardSets (sets of CardPrototypes), Actions (defined logic that CardPrototypes can perform), and Totems (a special Token that can be used to generate more tokens).

./routes

Various Express routes are used to manage user and token information, for form submissions, etc. 

./public

Folder for serving the website and associated assets. Using Angular / CSS grid for some parts of the website (and regular html/css for others). Users can login and interact with the Ethereum smart contract using Metamask.

<h3>Game logic (in-progress)</h3>

/modules/game-utilities.js

The backend game logic is organized in an object oriented style. It uses <a href="https://socket.io/">socket.io</a> to communicate player moves and to push game state to the players. All logic is passed through a single Matchmaking object.

<b>Matchmaking</b> - Responsible for setting up new websocket connections, for adding users to the lobby, for instantiating new matches, and for routing communications between users and their associated GameLoop. Initialized by startMatchmaking().
<ul>
  <li>init - Setup handlers for new websocket connect/disconnects and routing client-communications (comms) </li>
  <li>handleAuthentication - Handle logging in users and validating cookies
  <li>routeClientCommunication - Handle comms from authenticated users (new moves, requesting state, etc)
  <li>createMatch - Instantiate new GameLoop/Game/Players/decks and update appropriate Matchmaking data structures.</li>
  <li>closeMatch - Close game and update appropriate Matchmaking data structures</li>
  <li>createPlayers</li>
  <li>createDecks</li>
  <li>getUser</li>
  <li>addUserToLobby</li>
  <li>checkLobby - Check lobby for >2 users and create matches with two random users. Called on setInterval</li>
</ul>

<b>GameLoop</b> - Responsible for altering Game state. Has a Game. A new GameLoop instance is made for each Game. 
<ul>
  <li>initGame - Starts the Game instance assigned to this GameLoop instance.</li>
  <li>Methods for altering a player's development stat (player's action points)</li>
  <ul>
    <li>incrementDev</li>
    <li>incrementMaxDev</li>
    <li>hitDev</li>
    <li>damageDev</li>
    <li>damageMaxDev</li>
  </ul>
  <li>Methods for handling turns and ending game</li>
  <ul>
    <li>incrementTurn</li>
    <li>startNewTurn</li>
    <li>endTurn</li>
    <li>autoEndTurn</li>
    <li>checkTurnOver</li>
    <li>resetTurnTimers</li>
    <li>checkGameOver</li>
    <li>endGame</li>
    <li>setActivePlayer</li>
  </ul>
  <li>Methods for handling Fighter states</li>
  <ul>
    <li>resetFighterStates - Refresh fighters for a new turn</li>
    <li>applySpecials - Apply special abilities a Fighter might have </li>
    <li>applySpecialConditions - Apply conditions a Fighter may have been afflicted with</li>
    <li>clearDead - Remove dead fighters after a submitted move is resolved</li>
    <li>getAdjacentLanes</li>
  </ul>
  <li>Methods for handling client communications</li>
  <ul>
    <li>checkNewMove - Validate a new move (playing a card, moving/commanding a Fighter, ending turn)</li>
    <li>checkActionValid - Validate actions resulting from playing a card.</li>
    <li>submitMove - Submit a valid move to be processed by the GameLoop.</li>
    <li>processPlay - Process a submitted card play</li>
    <li>processAction - Process a submitted action associated with playing a card.</li>
    <li>processMove - Process moving a Fighter between lanes</li>
    <li>processCommand - Process a Fighter attacking another Fighter or a Player</li>
    <li>processEndTurn - Process a player ending their turn</li>
    <li>processReact - Process a player's reaction when it is not their turn (caused by certain cards)</li>
  </ul>
  <li>Methods for handling card collections</li>
  <ul>
    <li>draw - Remove cards from a collection</li>
    <li>drawToHand - Remove cards from a collection to a player's hand</li>
    <li>drawToDiscard - Remove cards from a collection to a player's discard</li>
    <li>view - View cards from a collection</li>
    <li>shuffle -Shuffle cards from a collection</li>
  </ul>
</ul>

<b>Game</b> - Holds game state and has two Players.
<ul><li>getPlayer(playerNumber)</li><li>getOtherPlayer(playerNumber)</li></ul>

<b>Player</b> - Holds player stats and has an array of Fighters that have been deployed.
<ul><li>deployFighter(cardPrototype, lane)</li></ul>

<b>Fighter</b> - Represents a Fighter that exists on the board
<ul><li>buildSpecials - Build a Fighter's special abilities when it is created</li></ul>