const mongoose = require('mongoose');
const CardPrototype = require('../models/CardPrototype');
const Action = require('../models/Action');
const User = require('../models/User');
const merkleUtils = require('../modules/merkle-utilities.js');
const uuidv1 = require('uuid/v1');

//Actions
// 1 HEAL  Heal one target
// 2 DRAW_FROM_DECK  Draw cards from deck
// 3 DRAW_FROM_OP  Draw cards from opponent's hand
// 4 DMG_ENEMY Deal damage to an enemy
// 5 DMG_FRIEND  Deal damage to a friend
// 6 DRAW_DISCARD_TGT  Draw cards from discard (choose)
// 7 PARALYZE_ENEMY  Targeted enemy cannot perform action for one turn
// 8 DMG_SELF  Deal damage to self
// 9 DMG_OPP_DEV Set back opponent's development
// 10  DISCARD_SELF  Discard cards (self)
// 11  HEAL_FRIEND Heal one friend
// 12  DMG_SELF_DEV  Set back your development (self)
// 13  SWAP_FIGHTERS Swap this fighter with an enemy fighter
// 14  KILL_ENEMY_HEALTH_LT_COST Kill an enemy with health less than the cost of this card
// 15  DISCARD_OPP Opponent discards cards
// 16  DMG Deal damage to any target
// 17  KILL_ENEMY  Kill an enemy fighter
// 18  DMG_OPP Deal damage to your opponent
// 19  Evade Dodge attacks against this fighter
// 20  GIVE_CARDS  Give cards to opponent
// 21  DISCARD_AND_DRAW  Discard some number of cards and draw that many from deck
// 22  ATTACK_ON_DEPLOY  Fighter attacks when played
// 23  MULTIPLE_ATTACKS  Fighter can attack more than one time
// 24  DMG_DEFEND  Fighter deals damage when attacked
// 25  CONTROL_ENEMY Turn an enemy fighter to your side
// 26  BOOST_SELF_DEV  Boost your development
// 27  VIEW_FROM_OPP View cards from your opponent's hand
// 28  DRAW_DISCARD_RAND Draw a random card from your discard pile
// 29  FREE_PLAY Play a card from your hand for free
// 30  HEAL_SELF Heal self
// 31  OPP_DRAW_DISCARD_TGT  Opponent draws from discard (they choose)
// 32  DEPLOY  Deploy another fighter from your hand (any cost)
// 33  VIEW_FROM_DECK_SELF View cards from top of your deck

//        target is one of 'self', 'opponent', 'friend', 'enemy', 'none'
//        id is id of the targeted 'friend' or 'enemy' (ignored for 'self' and 'opponent')
// let validActionTargets = {};
// validActionTargets[1] = ['self', 'friend', 'enemy', 'opponent'];
// validActionTargets[2] = ['none'];
// validActionTargets[3] = ['none'];
// validActionTargets[4] = ['enemy', 'opponent'];
// validActionTargets[5] = ['self', 'friend'];
// validActionTargets[6] = ['none'];
// validActionTargets[7] = ['none'];
// validActionTargets[8] = ['none'];
// validActionTargets[9] = ['none'];
// validActionTargets[10] = ['none'];
// validActionTargets[11] = ['self', 'friend'];
// validActionTargets[12] = ['none'];
// validActionTargets[13] = ['none'];
// validActionTargets[14] = ['none'];
// validActionTargets[15] = ['none'];
// validActionTargets[16] = ['self', 'friend', 'enemy', 'opponent'];
// validActionTargets[17] = ['none'];
// validActionTargets[18] = ['none'];
// validActionTargets[19] = ['none'];
// validActionTargets[20] = ['none'];
// validActionTargets[21] = ['none'];
// validActionTargets[22] = ['opponent, enemy'];
// validActionTargets[23] = ['none'];
// validActionTargets[24] = ['none'];
// validActionTargets[25] = ['none'];
// validActionTargets[26] = ['none'];
// validActionTargets[27] = ['none'];
// validActionTargets[28] = ['none'];
// validActionTargets[29] = ['none'];
// validActionTargets[30] = ['none'];
// validActionTargets[31] = ['none'];
// validActionTargets[32] = ['none'];
// validActionTargets[33] = ['none'];


/************************** Data structures *************************/
//Communication object represents one unique action on a player's turn
//A turn may consist of submitting multiple comm objects
//A commb object is submitted via websocket on 'client-communication' events to the Matchmaking object
//Matchmaking object processes comm object via routeClientCommunication
//Comm object can 'requestState', 'new' for new move, 'react' for submitting a move when it is not the player's turn
//Player moves are sent to the Gameloop for validation, returned to Matchmaking, and submitted back to the Gameloop
//Gameloop updates the state of its Game object
//action - one of 'play', 'move', 'command', 'end'
//If play is chosen, type of card played is specified as 'fighter' or 'resource'
//    type of card played is specified as 'fighter' or 'resource'
//    cardPrototypeId is specified
//    actionOne, actionTwo, actionThree are specified
//        target is one of 'self', 'opponent', 'friend', 'enemy', 'none'
//        id is the array id of the targeted 'friend' or 'enemy' (ignored for 'self' and 'opponent')
//If move is chosen, id and lane are specified
//    id is the unique fighter id who will move
//    lane is the chosen lane to move to (0 - Development lane, 1 - Health Lane, 2 - Deck lane)
//If 'command' is chosen, a friendly fighter is commanded to attack an enemy
//    actionOne is specified
//        target is one of 'opponent' or 'enemy'
//        id is the id of the targeted 'enemy' (ignored for 'opponent')
//    id is the id of the targeted friendly fighter who will attack
//status - one of 'init', new', 'requestState', accepted', 'rejected', 'react'
//      let communication = {
      //   action: '',
      //   type: '',
      //   cardPrototypeId: '',
      //   actions: {
      //    actionId: {
      //      target: 'string',
      //      index: [Number]
      //      id: [Number]
      //    }
      //    actionId: {
      //      target: 'string']
      //      index: Number
      //      id: [Number]
      //    }
      //    actionId: {
      //      target: 'string',
      //      index: Number
      //      id: [Number]
      //    }
      //   }
      //   index: '',
      //   lane: '',
      //   token: user.token,
      //   ethAddress: user.ethAddress,
      //   status: 'init',
      //   message: 'A new communication object was just created.',
      //   socketId: '',
      //   playerNumber: '',
      //   state: ''
      // };
// let communication = {
//   action: '',
//   type: '',
//   cardPrototypeId: 0,

//   index: 999,
//   lane: 999,
//   token: 'asdflkjklfsdwoe.1298ujkadfkadsfdfsa.saldfkjasfdlf',
//   ethAddress: '0xljasdfjlkdafskljdafs9329adsf'
// }

/*************************************************GAME OBJECT******************************************** */
//A new Game object is created for each game between two players
//@id - unique identifier for game instance
//@playerOne/playerTwo - Player objects representing players one and two
//@actions - 
//status - 'starting', 'playing', 'over', 'error'
//turn - the current turn
//activePlayer - the current player who is allowed to take actions and play cards
//turnTimeLimit - the static set time in ms that a player is allowed to be activePlayer before switching to the next player
//turnStartTimeUnix - unix time that turn was started (ms since start of epoch)
//cardActions - an object with key actionId and value function that impliments that action {actionId: function(){}}
//actionsLength - How many card actions were used to construct the cardActions object
//cardPrototypes - An object with key _id and value of every card prototype retrieved from database
//cardPrototypesLength - How many prototypes were used to construct cardPrototypes object
//history - An array of move objects (objects constructed after processing a player's actions). Shows history of player moves starting at [0]
//winnerNumber - Number of winning player (1 or 2)
class Game {
  constructor({ id, playerOne, playerTwo, actions, prototypes, cardPrototypesLength, actionsLength }) {
    this.id = id;
    this.status = 'starting';
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
    this.turn = 0;
    this.activePlayer = 0;
    this.turnTimeLimit = 32000;
    this.turnStartTimeUnix = 0;
    this.cardActions = actions;
    this.actionsLength = actionsLength;
    this.cardPrototypes = prototypes;
    this.cardPrototypesLength = cardPrototypesLength;
    this.history = [];
    this.winnerNumber = 0;
  }
  getPlayer(playerNumber) {
    if(playerNumber === 1) {
      return this.playerOne;
    }
    if(playerNumber === 2) {
      return this.playerTwo;
    }
    return false;
  }
  getOtherPlayer(playerNumber) {
    if(playerNumber === 1) {
      return this.playerTwo;
    }
    if(playerNumber === 2) {
      return this.playerOne;
    }
    return false; 
  }
}

//Each game will have two Player objects
//dev - Amount of action points available for player to use, short for 'development'
//devHits - Two hits to dev cause player to lose a dev point
//maxDev - A player's max dev that is incremented each time they start a new turn
//hand - An array of card objects {id: num, cost: num, actionOne: num, actionTwo: num, actionThree: num}
//deployed - An array of Fighter objects who have been deployed (played to a lane on the board)
//deck - An array of cardPrototypeIds used for drawing to player's hand
//discard - An array of discarded cardPrototypeIds
//active - Bool is it this player's turn (is this player the activePlayer)
//deployCount - Incremental counter for giving deployed fighters unique ids
//number - Player number (1 or 2), 1 always goes first
//reactEvents - Array containing react events that player must respond to {actionId: Number, value: Number}
//  reaction object could include {target: 'self/opponent/friend/enemy', id: Number(fighterId), collection: player.hand/deck/discard}
//  reaction object is submitted via communication object from client to Matchmaking#routeClientCommunication => Gameloop#processReact
//commanded - Bool whether player has attacked this turn (if player is able to attack)
//canAttack - Bool whether player is able to attack
//freePlay - A counter allowing playing this number of cards without using action points
//freeDeploy - A counter allowing deploying a fighter for free (freePlay but restricted to fighter cards)
class Player{
  constructor(user) {
    if(user.ethAddress) {
      this.ethAddress = user.ethAddress;
    }
    this.health = 30;
    this.maxHealth = 30;
    this.dev = 0;
    this.devHits = 0;
    this.maxDev = 0;
    this.hand = [];
    this.deployed = [];
    this.deck = [];
    this.discard = [];
    this.active = false;
    this.deployCount = 0;
    this.number = user.playerNumber;
    this.reactEvents = [];
    this.commanded = false;
    this.canAttack = false;
    this.freePlay = 0;
    this.freeDeploy = 0;
  }
  deployFighter(cardPrototype, lane) {
    let fighter = new Fighter(cardPrototype, lane);
    this.deployCount++;
    fighter.id = this.deployCount;
    fighter.condition = 'deploying';
    fighter.deployed = true;
    this.deployed.push(fighter);
  }
}

//An object representing a deployed fighter
//Initial health, attack, and cardPrototypeId are retrieved based on the card's cardPrototype
//commanded - a boolean indicating whether the fighter has been commanded to attack this turn
//moved - a boolean indicating whether the fighter has been moved this turn
//lane - a number (0, 1, 2) indicating which lane the fighter is in
//special - an array of residual actions a fighter might have if the actions didn't occur when the fighter was deployed
//special actions might correspond to actions like 'deal 2 damage when hit' or 'attack twice'
//special actions are checked in the 'react()' check every time a player communicates an action like 'play', 'move', 'command'
//condition (String) Condition applying to this fighter for the current round of the turn
//example conditions 'attacking', 'defending', 'moving', 'deploying', 'ready'
//specialConditions - An array of condition objects tracking special conditions like paralyze
//condition object {condition: 'paralyze', timesUsed: 0, value: 3}
class Fighter {
  constructor(cardPrototype, lane) {
    this.id = 999;
    this.cardPrototype = cardPrototype;
    this.cardPrototypeId = cardPrototype._id;
    this.health = cardPrototype.healthValue;
    this.maxHealth = cardPrototype.healthValue;
    this.attack = cardPrototype.attackValue;
    this.commanded = true;
    this.moved = true;
    this.lane = lane;
    this.specials = this.buildSpecials();
    this.condition = 'none';
    this.specialConditions = [];
    this.deployed = false;
  }
  buildSpecials() {
    let availableSpecials = [19, 23, 24];

    this.availableSpecials = availableSpecials;

    let specials = {};

    let actionOne = this.cardPrototype.actionOne;
    let actionTwo = this.cardPrototype.actionTwo;
    let actionThree = this.cardPrototype.actionThree;
    let actionOneValue = this.cardPrototype.actionOneValue;
    let actionTwoValue = this.cardPrototype.actionTwoValue;
    let actionThreeValue = this.cardPrototype.actionThreeValue;

    for(let i = 0; i < availableSpecials.length; i++) {
      if(actionOne === availableSpecials[i]) {
        specials[actionOne] = {timesUsed: 0, value: actionOneValue};
      }
      if(actionTwo === availableSpecials[i]) {
        specials[actionTwo] = {timesUsed: 0, value: actionTwoValue};
      }
      if(actionThree === availableSpecials[i]) {
        specials[actionThree] = {timesUsed: 0, value: actionThreeValue}; 
      }
    }

    return specials;
  }
}

/************************************ Game loop **********************************/
/*************************************** Matchmaking *************************/
//Player visits /arena page
//  Player visits /arena, page loads, /matchmaking is called via client side handler on /arena
//  handler opens a websocket connection and post/matchmaking with user eth address in req body and jwt in header
//  /matchmaking is an authenticated route, uses verifyToken from merkle-utilities 
//  If authention resolves, user is added to the matchmaking object's array of Users looking for a game
//  matchmaking holds copies of contract variables, loaded from database on server start
//    cardPrototypes {_id: cardPrototypeId, cardPrototype: cardPrototype}
//    actions {_id: actionId, action: action}
//  #addUser: Add user to lobby array of users looking for game
//  matchmaking object handles randomly matching two Users to a game (identified via eth address)
//  matchmaking object assigns websockets for the new game to the two Users
//  createMatch instantiates the two players objects
//  createMatch retrieves User's selected decks 
//  createMatch instantiates a unique game with unique id
//  createMatch generates a random number to pick which player is playerOne and playerTwo
//  createMatch sets player.number to one or two for playerOne and playerTwo
//  createMatch sets playerOne and playerTwo on game object
//  createMatch instantiates a new gameLoop object and passes game object in 
//  gameLoop constructor assigns this.game
//    sets first player to active player
//    increments turn to first turn
class Matchmaking {

  constructor({ prototypes, actions, io, cardPrototypesLength, actionsLength}) {

    this.cardPrototypes = prototypes;
    this.cardPrototypesLength = cardPrototypesLength;
    this.actions = actions;
    this.actionsLength = actionsLength;
    this.lobby = [];
    this.gameIdToGame = {};
    this.gameIdToGameLoop = {};
    this.io = io;
    this.socketIdToGameId = {};
    this.socketIdToAuthenticated = {};
    this.socketIdToInitiated = {};
    this.genericDecks = [{
      deckName: 'deckOne', 
      deckCards: [{id: 4}, {id: 4}, {id: 4}, {id: 4}, {id: 5}, {id: 5}, {id: 5}, 
      {id: 5}, {id: 6}, {id: 6}, {id: 6}, {id: 6}, {id: 7}, {id: 7}, {id: 7}, 
      {id: 7}, {id: 56}, {id: 56}, {id: 56}, {id: 56}, {id: 9}, {id: 9}, {id: 9}, 
      {id: 9}, {id: 10}, {id: 10}, {id: 10}, {id: 10}, {id: 11}, {id: 11}, {id: 11}, {id: 11}]
    }];
    this.checkLobbyInterval = {};
    this.init();

  }
  async init() {

    this.io.setMaxListeners(0);

    //Setup handlers for new user connections
    this.io.on('connection', async(socket) => {

      socket.setMaxListeners(0);

      socket.on('client-communication', async (comm) => {
        try {
          if(this.socketIdToAuthenticated[socket.id]) {
            this.routeClientCommunication(comm, socket);
          }
        }
        catch(e) {
          console.log(e);
        }
      });

      socket.on('client-send-authentication', async (data) => {

        try {
          let socketData = await this.handleAuthentication(data, socket);
          if(!socketData) {return;}

          this.socketIdToAuthenticated[socket.id] = true;

          let initComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: socketData.data.user.token,
            ethAddress: socketData.data.user.ethAddress,
            status: 'init',
            message: 'A new communication object was just created.',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
          };

          this.routeClientCommunication(initComm, socket);
        } 
        catch(e) {
          console.log(e);
          socket.emit('server-error', {message: 'Error encountered while joining Matchmaking.'});
          socket.disconnect();
          return;
        }

      });

      socket.on('disconnect', async () => {
        try {
        
          let id;

          //Remove user from lobby if necessary
          let remove = this.lobby.find((user) => {
            return user.socketId === socket.id;
          });

          let index = this.lobby.indexOf(remove);
          if(index !== -1) {
            this.lobby.splice(index, 1);
          }

          if(this.socketIdToInitiated[socket.id]) {
            delete this.socketIdToInitiated[socket.id];
          }

          if(this.socketIdToAuthenticated[socket.id]) {
            delete this.socketIdToAuthenticated[socket.id];
          }
          //Save user game details if necessary
          if(this.socketIdToGameId[socket.id]) {
            id = this.socketIdToGameId[socket.id];
          }
          if(!id) {
            return;
          }
          let game = this.gameIdToGame[id];
          let gameLoop = this.gameIdToGameLoop[id];
          if(!game || !gameLoop) {
            return;
          }
          if(gameLoop.userOneSocketId === socket.id) {
            let query = User.findByIdAndUpdate(gameLoop.userOne._id, {gameId: id});
            if(query) {
              await query.exec();
            }
          }
          if(gameLoop.userTwoSocketId === socket.id) {
            let query = User.findByIdAndUpdate(gameLoop.userTwo._id, {gameId: id});
            if(query) {
              await query.exec();
            }
          }
        } catch(e) {
          console.log(e);
            socket.emit('server-error', {message: 'Error encountered while processing disconnect.'});
        }
      });

      socket.emit('server-request-authentication');
    });

    //Add waiting users in lobby to games
    this.checkLobbyInterval = setInterval(() => {
      this.checkLobby();
    }, 400)
  }
  async getUser({ethAddress}) {

    let query, userArray, user;

    if(ethAddress) {
      query = User.find({ethAddress: ethAddress});
      userArray = await query.lean().exec();
      user = userArray[0];
    }
    return user;
  }
  addUserToLobby(user) {
    try {
      if (user && user.socket && !user.gameId && !user.inLobby) {
        user.socketId = user.socket.id.slice(0);
        user.inLobby = true;
        this.lobby.push(user);
      }
    }
    catch(e) {
      console.log(e);
    }
  }
  async createMatch({ userOne, userTwo }) {
    try {

      let actions = this.actions;
      let prototypes = this.cardPrototypes;
      let actionsLength = this.actionsLength;
      let cardPrototypesLength = this.cardPrototypesLength;

      //Create players
      let players = this.createPlayers(userOne, userTwo);
      if(players.created === false) {
        userOne.socket.emit('server-failed-create-match', players);
        userTwo.socket.emit('server-failed-create-match', players);
        return;
      }

      //Create decks (and assign to players inside createDecks)
      let decks = this.createDecks(userOne, userTwo);
      if(decks.created === false) {
        userOne.socket.emit('server-failed-create-match', decks);
        userTwo.socket.emit('server-failed-create-match', decks);
      }

      players.playerOne.deck = decks.deckOne;
      players.playerTwo.deck = decks.deckTwo;

      //Create game and gameLoop
      let gameId = uuidv1();
      let game = new Game({ id: gameId, playerOne: players.playerOne, playerTwo: players.playerTwo, 
        actions: actions, prototypes: prototypes, actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength });
      let gameLoop = new GameLoop(game, userOne, userTwo, this);

      //Update matchmaking states
      this.gameIdToGame[gameId] = game;
      this.gameIdToGameLoop[gameId] = gameLoop;
      this.socketIdToGameId[userOne.socket.id] = gameId;
      this.socketIdToGameId[userTwo.socket.id] = gameId;

      this.lobby.splice(this.lobby.indexOf(userOne), 1);
      this.lobby.splice(this.lobby.indexOf(userTwo), 1);
    }
    catch(e) {
      console.log(e);
    }
  }
  closeMatch(gameId) {
    try {

      let gameLoop = this.gameIdToGameLoop[gameId];
      let socketOne = gameLoop.userOne.socket;
      let socketTwo = gameLoop.userTwo.socket;

      delete this.gameIdToGame[gameId];
      delete this.gameIdToGameLoop[gameId];
      delete this.socketIdToGameId[gameLoop.userOneSocketId];
      delete this.socketIdToGameId[gameLoop.userTwoSocketId];
      delete this.socketIdToInitiated[gameLoop.userOneSocketId];
      delete this.socketIdToInitiated[gameLoop.userTwoSocketId];

      socketOne.emit('server-match-end');
      socketTwo.emit('server-match-end');

    }
    catch(e) {
      console.log(e);
    }
  }
  createPlayers(userOne, userTwo) {

    if(!userOne.decks || !userOne.selectedDeck || userOne.decks.length === 0) {
      return {'message': 'Failed to create match, incomplete information found for selected deck for player 1', created: false};
    }

    if(!userTwo.decks || !userTwo.selectedDeck || userTwo.decks.length === 0) {
      return {'message': 'Failed to create match, incomplete information found for selected deck for player 2', created: false};
    }

    if(!userOne.socket.id) {
      return {'message': 'Failed to create match, no socket id found for player 1', created: false};
    }
    if(!userTwo.socket.id) {
      return {'message': 'Failed to create match, no socket id found for player 2', created: false};
    }

    userOne.playerNumber = 1;
    userTwo.playerNumber = 2;

    let playerOne = new Player(userOne);
    let playerTwo = new Player(userTwo);

    return {'message': 'Created players for new match.', created: true, playerOne: playerOne, playerTwo: playerTwo};

  }
  createDecks(userOne, userTwo) {

    let userArray = [userOne, userTwo];

    let userDecksArray = 
    userArray.map((user) => {

      let decks = user.decks;
      let selectedDeck = user.selectedDeck;
      let cards = false;

      for (let i = 0; i < decks.length; i++) {
        if (selectedDeck === decks[i].deckName) {
          cards = decks[i].deckCards;
        }
      }
      return cards;

    });

    if (userDecksArray[0] === false) {
      return {'message': 'Failed to create decks, could not retrieve selected deck for player 1', created: false};
    }
    if (userDecksArray[1] === false) {
      return {'message': 'Failed to create decks, could not retrieve selected deck for player 2', created: false};
    }

    return {'message': 'Created decks successfully', created: true, deckOne: userDecksArray[0], deckTwo: userDecksArray[1]};
  }
  async handleAuthentication(data, socket) {

    return new Promise(async (resolve, reject) => {
      try {
        let tempAuth = {authenticated: false, message: 'No address or token provided.'};
        if(!data || !data.user.ethAddress || !data.user.token) {
          socket.emit('server-failed-authentication', tempAuth, data);
          resolve(false);
          return;
        }

        //Check if user is authenticated
        let authenticated = await merkleUtils.verifyToken(data.user.ethAddress, data.user.token);

        if(authenticated.authenticated) {
          socket.emit('server-authenticated', authenticated, data);
          resolve({data: data, socket: socket});
          return;
        }
        else {

          socket.emit('server-failed-authentication', authenticated, data);
          resolve(false);
          return;
        }
      }
      catch(e) {
        // console.log(e);
        socket.emit('server-error', {message: 'Error during authentication handling.'});
        resolve(false);
        return;
      }
    });
  }
  async routeClientCommunication(comm, socket) {

    let gameId, game, gameLoop, user;

    try {
      //Status for a newly connected user
      if(comm.status === 'init') {


        if(this.socketIdToInitiated[socket.id]) {
          return;
        }

        this.socketIdToInitiated[socket.id] = true;


        user = await this.getUser({ethAddress: comm.ethAddress});

        if(!user || !user.selectedDeck || !user.decks) {

          let deckCopy = JSON.parse(JSON.stringify(this.genericDecks));

          user = {
            decks: deckCopy,
            selectedDeck: 'deckOne'
          };
        }

        user.socketId = socket.id.slice(0);
        user.socket = socket;

        if(user.gameId) {
          //User has an ongoing game

          gameId = user.gameId;
          game = this.gameIdToGame[gameId];
          gameLoop = this.gameIdToGameLoop[gameId];

          if(game && gameLoop) {
            if(gameLoop.userOne._id === user._id) {
              gameLoop.userOne.socket = socket;
              gameLoop.userOneSocketId = socket.id;
              this.socketIdToGameId[socket.id] = gameId;

            }

            if(gameLoop.userTwo._id === user._id) 
            {
              gameLoop.userTwo.socket = socket;
              gameLoop.userTwoSocketId = socket.id;
              this.socketIdToGameId[socket.id] = gameId;

            }

            comm.status = 'requestState';
            this.routeClientCommunication(comm, socket);
            return;

          }

          await User.findByIdAndUpdate(user._id, {gameId: ''});
        }

        this.addUserToLobby(user);
        socket.emit('server-added-to-lobby');
        return;
      }
      
    }
    catch(e) {
      console.log(e);
      return;
    }

    try {
      //Find the corresponding game and gameLoop

      comm.socketId = socket.id;

      gameId = this.socketIdToGameId[socket.id];
      gameLoop = this.gameIdToGameLoop[gameId];

      if(!gameId || !gameLoop) {
        socket.emit('server-game-not-found', comm);
        return;
      }

      game = gameLoop.game;

      if(game.status === 'over') {
        socket.emit('server-game-over', comm);
        return;
      }

      if(game.status !== 'playing') {
        socket.emit('server-game-inactive', comm);
        return;
      }

      
      //Comm should be from one of the players
      comm.playerNumber = 0;

      if(gameLoop.userOne.socket.id === socket.id) {
        comm.playerNumber = 1;
      }
      else if (gameLoop.userTwo.socket.id === socket.id) {
        comm.playerNumber = 2;
      }
      else {
        socket.emit('server-player-not-found', comm);
        return;
      }
    }
    catch(e) {
      console.log(e);
      return;
    }

    try {
      //Send game state if client is requesting state
      if(comm.status === 'requestState') {

        //Get game state relative to this player
        let state = await gameLoop.getState(comm.playerNumber);
        comm.state = state;
        socket.emit('server-request-state', comm);
        return;

      }    
    }
    catch(e) {
      console.log(e);
      return;
    }

    try {
      //Send new move if player is submitting a move
      if(comm.status === 'new' || comm.status === 'react') {

        comm.submissionTime = (new Date()).getTime();

        let player = game.getPlayer(comm.playerNumber);

        if(player.active === false && comm.status === 'new') {
          comm.message = "You cannot submit a new move when it is not your turn."
          socket.emit('server-reject', comm);
          return;
        }

        comm.uuid = uuidv1();
        gameLoop.stack.push(comm);
        socket.emit('server-add-move', comm)
        return;
      }
    }
    catch(e) {
      console.log(e);
      return;
    }
  }
  checkLobby() {
    //Check lobby for users and attempt to place two in a match together
    try {
      let userOne, userTwo, randomNumber, randomNumberTwo;
      let lobbyCount = this.lobby.length;
      
      if(lobbyCount < 2) {
        return {'message': 'Waiting for users in lobby...', created: false};
      }

      randomNumber = Math.floor(Math.random() * lobbyCount);
      userOne = this.lobby[randomNumber];
      
      if(lobbyCount === 2) {
        if(randomNumber === 0) {
          userTwo = this.lobby[1];
        } 
        else {
          userTwo = this.lobby[0];
        }
      }
      else {
        randomNumberTwo = Math.floor(Math.random() * lobbyCount);
        userTwo = this.lobby[randomNumberTwo];
      }

      if(!userOne || !userTwo || userOne === userTwo) {
        return {'message': 'Waiting for users in lobby...', created: false};
      }

      this.createMatch({userOne: userOne, userTwo: userTwo});

    }
    catch(e) {console.log(e);}
  }
}

class GameLoop {
  constructor(game, userOne, userTwo, matchmaking) {
    this.id = game.id;
    this.game = game;
    this.userOne = userOne;
    this.userTwo = userTwo;
    if(userOne.socket) {
      this.userOneSocketId = userOne.socket.id.slice(0);
    }
    if(userTwo.socket) {
      this.userTwoSocketId = userTwo.socket.id.slice(0);
    }
    this.stack = [];
    this.processingInterval = {};
    this.processing = undefined;
    this.processingCounter = 0;
    this.processingCounterLimit = 10;
    this.matchmaking = matchmaking;

    let validActionTargets = {};
    validActionTargets[1] = ['self', 'friend', 'enemy', 'opponent'];
    validActionTargets[2] = ['none'];
    validActionTargets[3] = ['none'];
    validActionTargets[4] = ['enemy', 'opponent'];
    validActionTargets[5] = ['self', 'friend'];
    validActionTargets[6] = ['none'];
    validActionTargets[7] = ['none'];
    validActionTargets[8] = ['none'];
    validActionTargets[9] = ['none'];
    validActionTargets[10] = ['none'];
    validActionTargets[11] = ['self', 'friend'];
    validActionTargets[12] = ['none'];
    validActionTargets[13] = ['none'];
    validActionTargets[14] = ['none'];
    validActionTargets[15] = ['none'];
    validActionTargets[16] = ['self', 'friend', 'enemy', 'opponent'];
    validActionTargets[17] = ['none'];
    validActionTargets[18] = ['none'];
    validActionTargets[19] = ['none'];
    validActionTargets[20] = ['none'];
    validActionTargets[21] = ['none'];
    validActionTargets[22] = ['opponent', 'enemy'];
    validActionTargets[23] = ['none'];
    validActionTargets[24] = ['none'];
    validActionTargets[25] = ['none'];
    validActionTargets[26] = ['none'];
    validActionTargets[27] = ['none'];
    validActionTargets[28] = ['none'];
    validActionTargets[29] = ['none'];
    validActionTargets[30] = ['none'];
    validActionTargets[31] = ['none'];
    validActionTargets[32] = ['none'];
    validActionTargets[33] = ['none'];

    this.validActionTargets = validActionTargets;
    this.initGame();

  }
  initGame() {
    this.setActivePlayer(this.game.playerOne);
    this.game.status = 'playing';

    this.shuffle(this.game.playerOne.deck);
    this.shuffle(this.game.playerOne.deck);
    this.shuffle(this.game.playerTwo.deck);    
    this.shuffle(this.game.playerTwo.deck);    

    let historyObject = {};
    historyObject['playerNumber'] = this.game.activePlayer;
    historyObject['playerAction'] = 'startGame'; 
    historyObject['turnNumber'] = this.game.turn;
    this.game.history.push(historyObject);

    this.drawToHand({playerNumber: 1, collection: this.game.playerOne.deck});
    this.drawToHand({playerNumber: 1, collection: this.game.playerOne.deck});

    this.drawToHand({playerNumber: 2, collection: this.game.playerTwo.deck});
    this.drawToHand({playerNumber: 2, collection: this.game.playerTwo.deck});
    this.drawToHand({playerNumber: 2, collection: this.game.playerTwo.deck});
    this.startNewTurn();

    this.processingInterval = setInterval(() => {
      this.checkProcessing();
    }, 300);
  }
  view({ collection, index, random} ) {
    if (!collection || !Array.isArray(collection)) {
      return false;
    }
    if (collection.length == 0) {
      return false;
    }
    if (index) {
      if (index <= 0 || index >= collection.length || !Number.isInteger(index)) {
        return false;
      }
    }

    if(random === true) {
      let length = collection.length;
      let randomNumber = Math.floor(Math.random() * length);

      return collection[randomNumber];
    }

    if (index) {
      return collection[index];
    }

    return collection[0];
  }
  shuffle(array) {
    let index = array.length, temp, randomNumber;
    while (index !== 0) {

      //Pick a random number between 0 and index - 1
      randomNumber = Math.floor(Math.random() * index);
      index -= 1;

      temp = array[index];
      array[index] = array[randomNumber];
      array[randomNumber] = temp;
    }

    return array;
  }
  draw({ collection, random, matchId }) {
    if (!collection || !Array.isArray(collection)) {
      return false;
    }
    if (collection.length <= 0) {
      return false;
    }
    if(matchId) {
      let index = collection.findIndex((card) => {
        return card.id === matchId;
      });
      if(index >= 0) {
        let array = collection.splice(index, 1);
        return array[0];
      }
      else {return false;}
    }

    if(random === true) {
      let index = collection.length;
      let randomNumber = Math.floor(Math.random() * index);
      let array = collection.splice(randomNumber, 1);
      return array[0];
    }

    return collection.shift();
  }
  drawToHand({ playerNumber, collection, random, matchId}) {
    if(!playerNumber || !collection) {
      return false;
    }
    let player = this.game.getPlayer(playerNumber);
    let card = false;

    if(random) {
      card = this.draw({collection: collection, random: random});
    }
    else if(matchId) {
      card = this.draw({collection: collection, matchId: matchId});
    }
    else {
      card = this.draw({collection: collection});
    }

    if(card) {
      player.hand.push(card);
    }

    let historyObject = {};
    historyObject['playerNumber'] = playerNumber;
    historyObject['playerAction'] = 'drawToHand'; 
    historyObject['turnNumber'] = this.game.turn;
    this.game.history.push(historyObject);
  }
  drawToDiscard({ playerNumber, collection, random, matchId}) {
    if(!playerNumber || !collection) {
      return false;
    }
    let player = this.game.getPlayer(playerNumber);
    let card = false;

    if(random) {
      card = this.draw({collection: collection, random: random});
    }
    else if(matchId) {
      card = this.draw({collection: collection, matchId: matchId});
    }
    else {
      card = this.draw({collection: collection});
    }

    if(card) {
      player.discard.push(card);
    }

    let historyObject = {};
    historyObject['playerNumber'] = playerNumber;
    historyObject['playerAction'] = 'drawToDiscard'; 
    historyObject['turnNumber'] = this.game.turn;
    this.game.history.push(historyObject);
  }
  setActivePlayer(player) {
    if(player.number === 1) {
      this.game.playerTwo.active = false;
    }
    if(player.number === 2) {
      this.game.playerOne.active = false;
    }
    if(player.number === 1 || player.number === 2) {
      this.game.activePlayer = player.number;
      player.active = true;
    }

  }
  incrementDev({ playerNumber }) {
    if(!playerNumber) {
      return;
    }
    if(playerNumber !== 1 && playerNumber !== 2) {
      return;
    }
    let player = this.game.getPlayer(playerNumber);
    player.dev++;
  }
  incrementMaxDev({ playerNumber }) {
    if(!playerNumber) {
      return;
    }
    if(playerNumber !== 1 && playerNumber !== 2) {
      return;
    }
    let player = this.game.getPlayer(playerNumber);
    player.maxDev++;
  }
  hitDev(value, defender) {
    for (let i = 0; i < value; i++) {
      defender.devHits++;
      if(defender.devHits > 1) {
        this.damageMaxDev(1, defender);
        defender.devHits = 0;
      }
    }
  }
  damageDev(value, defender) {
    for (let i = 0; i < value; i++) {
      if(defender.dev && defender.dev > 0) {
        defender.dev--;
      }
    }
  }
  damageMaxDev(value, defender) {
    for (let i = 0; i < value; i++) {
      if(defender.maxDev && defender.maxDev > 0) {
        defender.maxDev--;
      }
    }
  }
  hitDeck(value, defender) {
    for (let i = 0; i < value; i++) {
      this.draw({ collection: defender.deck });
    }
  }
  clearDead() {

    let playerOneDeployed 
    = this.game.playerOne.deployed.filter(
      fighter => fighter.health > 0
    );

    let playerTwoDeployed 
    = this.game.playerTwo.deployed.filter(
      fighter => fighter.health > 0
    );

    this.game.playerOne.deployed = playerOneDeployed;
    this.game.playerTwo.deployed = playerTwoDeployed;
  }
  incrementTurn() {
    this.game.turn++;
  }
  startNewTurn() {

    let player = this.game.getPlayer(this.game.activePlayer);

    this.incrementTurn();
    this.incrementMaxDev({playerNumber: player.number});
    player.dev = player.maxDev;
    this.drawToHand({ playerNumber: player.number, collection: player.deck });
    
    this.resetFighterStates();
    this.resetTurnTimers();
    this.pushState();
  }
  endTurn({playerNumber, turn}) {
    if(turn !== this.game.turn) {
      //The turn has already ended
      return;
    }
    if(playerNumber === 1) {
      this.setActivePlayer(this.game.playerTwo);
    }
    if(playerNumber === 2) {
      this.setActivePlayer(this.game.playerOne)
    }
    //Add history object
    this.startNewTurn();
  }
  autoEndTurn({playerNumber, turn}) {
    this.endTurn({
      playerNumber: playerNumber,
      turn: turn
    });
    //Add history object
  }
  async endGame(winnerNumber) {

    this.game.status = 'over';
    this.game.winnerNumber = winnerNumber;

    clearInterval(this.processingInterval);

    this.pushState();

    this.matchmaking.closeMatch(this.id);
  }
  checkTurnOver({turn}) {
    if(this.game.turn !== turn) {
      return true;
    }
    else {
      return false;
    }

  }
  checkGameOver() {
    if(!this.game) {
      return;
    }
    if(this.game.playerOne.health < 1 || this.game.playerTwo.health < 1) {
      return true;
    }
    else {
      return false;
    }
  }
  resetTurnTimers() {

    let now = new Date();
    let playerNumberOuter = this.game.activePlayer;
    let turnOuter = this.game.turn;
    let turnTimeLimit = this.game.turnTimeLimit;

    this.game.turnStartTimeUnix = now.getTime();

    let closure = function(turn, playerNumber) {
      setTimeout(() => {

        let turnEnded = this.checkTurnOver({turn: turn});
        if(!turnEnded) {

          //Check moves stack
          if(this.stack.length === 0) {
            this.autoEndTurn({
              playerNumber: playerNumber,
              turn: turn
            });
          }
          else {
            //Add an endTurn comm to the stack
            let comm = {
              action: 'end',
              playerNumber: playerNumber,
              turn: turn,
            };
            this.stack.push(comm);
          }

        }
      }, turnTimeLimit);
      
    }
    closure.call(this, turnOuter, playerNumberOuter);
  }
  resetFighterStates() {
    let fightersOne = this.game.playerOne.deployed;
    let fightersTwo = this.game.playerTwo.deployed;
    if(fightersOne.length > 0) {
      fightersOne.forEach((fighter) => {
        fighter.moved = false;
        fighter.commanded = false;
        this.applySpecialConditions({fighter: fighter});
      });
    }
    if(fightersTwo.length > 0) {
      fightersTwo.forEach((fighter) => {
        fighter.moved = false;
        fighter.commanded = false;
        this.applySpecialConditions({fighter: fighter});
      });
    }
  }
  getAdjacentLanes(lane) {

    let adjacentLanes = [];
    adjacentLanes.push(lane);

    if (lane === 0) {
      adjacentLanes.push(1);
    }
    if(lane === 1) {
      adjacentLanes.push(0);
      adjacentLanes.push(2);      
    }
    if(lane === 2) {
      adjacentLanes.push(1);
    }
    return adjacentLanes;

  }
  applySpecials({ playerAction, attacker, defender, history }) {
    return new Promise((resolve) => {
      if(playerAction === 'move') {
        //Apply move related specials
        //Currently are none
        resolve();
        return
      }
      else if(playerAction === 'command') {
        try {

          //Apply evade (actionId 19)
          if(defender.id && defender.specials[19]) {
            let evade = defender.specials[19];
            if(evade.timesUsed < evade.value) {
              defender.health = defender.health + attacker.attack;
              evade.timesUsed++;
              history['specials'].push(evade);
            }
          }

          //Apply multi attacks (actionId 23)
          if(attacker.id && attacker.specials[23]) {
            let multipleAttacks = attacker.specials[23];
            if(multipleAttacks.timesUsed < multipleAttacks.value - 1) {
              attacker.commanded = false;
              multipleAttacks.timesUsed++;
              history['specials'].push(multipleAttacks);
            }
          }

          //Apply damage defend (actionId 24)
          if(defender.id && defender.specials[24]) {
            let damageDefend = defender.specials[24];
            attacker.health = attacker.health - damageDefend.value;
            damageDefend.timesUsed++;
            history['specials'].push(damageDefend);
          }

          resolve();
          return;

        }
        catch(e) {
          console.log(e);
          resolve();
          return;
        }
      }
      else if(playerAction === 'play') {
        //Apply effects of deploying specials
        resolve();
        return;
      }
      else {
        resolve();
        return;
      }
    });
  }
  applySpecialConditions({ fighter }) {
    let specialConditions = fighter.specialConditions;
    specialConditions.forEach((conditionObj) => {

      if(conditionObj.condition === 'paralyze') {

        fighter.moved = true;
        fighter.commanded = true;
        conditionObj.timesUsed++;

        if(conditionObj.timesUsed >= conditionObj.value) {

          let update = fighter.specialConditions.filter((c) => {
            return c.condition !== 'paralyze';
          });

          fighter.specialConditions = update;
        }
      }
    });
  }
  async checkNewMove(comm) {
    return new Promise(async (resolve, reject) => {

      let action, moved, commanded, cardPrototypeId,
          prototype, actionsObject, lane,
          playerNumber, player, type;

      try {

        if(!comm) {
          let newObj = {};
          newObj.status = 'rejected';
          newObj.message = "No comm object provided.";
          resolve(newObj);
          return;
        }

        comm.status = 'rejected';
        comm.message = "An error was encountered during validity checking.";

        if(!comm.turn) {
          comm.message = 'No turn number provided.';
          resolve(comm);
          return;
        }   

        if (!comm.action || comm.action === '') {
          comm.message = 'No action provided.';
          resolve(comm);
          return;
        }      
      }

      catch(e) {
        console.log(e);
        resolve(comm);
        return;
      }

      try {

        action = comm.action;
        moved = comm.moved;
        commanded = comm.commanded;
        cardPrototypeId = comm.cardPrototypeId;
        actionsObject = comm.actions;
        lane = comm.lane;
        playerNumber = comm.playerNumber;
        player = this.game.getPlayer(playerNumber);

        if(!player || !playerNumber) {
          comm.message = "No player was found for the submitted move.";
          resolve(comm);
          return;
        }

        // let communication = {
        //   action: '',
        //   turn: Number,
        //   cardPrototypeId: '',
        //   actions: {}
        //   lane: '',
        //   status: 'init',
        //   message: 'A new communication object was just created.',
        //   playerNumber: '',
        //   moved {
        //     id: Number,
        //     lane: Number (0,1,2)
        //   },
        //   commanded: {
        //     friendId: Number,
        //     enemyId: Number,
        //   },
        //   reactActionId: Number,
        //   reactAction: {
        //     target: String,
        //     id: [Number]
        //   }
        //};

        // Actions object (three is max number of actions, should have all three filled out even if not three)
        // {
        //    actionId: {
        //      target: 'string',
        //      id: [Number]
        //    }
        //    actionId: {
        //      target: 'string']
        //      id: [Number]
        //    }
        //    actionId: {
        //      target: 'string',
        //      id: [Number]
        //    }
        // }


        //React actions do not have to be submitted on the player's turn
        //React events must be resolved before a player can submit a new move
        if(player.reactEvents.length === 0) {

          if(this.game.activePlayer !== playerNumber || player.active === false) {
            comm.message = "It is not your turn.";
            resolve(comm);
            return;
          }

          if(comm.turn !== this.game.turn) {
            comm.message ="The move was submitted on a turn that has already ended."
            resolve(comm);
            return;
          }                
        }
        else {
          if(
            comm.reactActionId === undefined                      ||
            comm.reactAction   === undefined                      ||
            comm.reactAction.target === undefined                 ||
            comm.reactActionId !== player.reactEvents[0].actionId) 
          {
            comm.message = "You have a react event that must be resolved.";
            resolve(comm);
            return;
          }
          if(comm.turn > this.game.turn) {
            comm.message = "The provided turn for this react event has not happened yet.";
            resolve(comm);
            return;
          }
        }




      }
      catch(e) {
        console.log(e);
        resolve(comm)
        return;
      }


      if(action === 'play') {

        try {


          //cardPrototypeId must exist
          if(!cardPrototypeId || cardPrototypeId > this.game.cardPrototypesLength || cardPrototypeId < 0) {
            comm.message = "Card prototype could not be found."
            resolve(comm);
            return;
          }

          prototype = this.game.cardPrototypes[cardPrototypeId];

          if(prototype.deployable) {
            type = 'fighter';
          }
          else {
            type = 'resource';
          }

          //Player must have enough dev to play card
          if(player.dev < prototype.actionPointCost && player.freePlay < 1) {
            if(player.freeDeploy < 1 
              || (player.freeDeploy > 0 && type === 'resource')) {
              comm.message = "Not enough action points to play card.";
              resolve(comm);
              return;
            }
          }

          //Card must be fighter or resource
          if(type !== 'fighter' && type !== 'resource') {
            comm.message = 'No type of card provided.';
            resolve(comm);
            return;
          }

          //Lane must be specified for deploying
          if(type === 'fighter') {
            if(lane !== 0 && lane !== 1 & lane !== 2) {
              comm.message = "No lane chosen for playing deployable card."
              resolve(comm);
              return;
            }
          }

          //Card must exist in user's hand
          let hand = player.hand;
          let cardInHand = false;
          for (let i = 0; i < hand.length; i++) {
            if(cardPrototypeId === hand[i].id) {
              cardInHand = true;
            }
          }

          if(!cardInHand) {
            comm.message = "Card is not in hand.";
            resolve(comm);
            return;
          }

          //Check that submitted actionIds match those of the cardPrototype
          let actionOne = prototype.actionOne;
          let actionTwo = prototype.actionTwo;
          let actionThree = prototype.actionThree;

          if(!actionsObject[actionOne] || !actionsObject[actionTwo] || !actionsObject[actionThree]) {
            comm.message = "Submitted actions do not match card prototype.";
            resolve(comm);
            return;
          }

          //Check actions are valid
          let actionOneValid = await this.checkActionValid({ 
            actionId: actionOne, 
            actionsObject: actionsObject[actionOne], 
            cardPrototypeId: cardPrototypeId, 
            playerNumber: playerNumber
          });

          let actionTwoValid = await this.checkActionValid({
            actionId: actionTwo, 
            actionsObject: actionsObject[actionTwo], 
            cardPrototypeId: cardPrototypeId, 
            playerNumber: playerNumber
          });

          let actionThreeValid = await this.checkActionValid({
            actionId: actionThree, 
            actionsObject: actionsObject[actionThree], 
            cardPrototypeId: cardPrototypeId, 
            playerNumber: playerNumber
          });

          if(!actionOneValid || !actionTwoValid || !actionThreeValid) {
            comm.message = "Submitted action(s) were invalid.";
            resolve(comm);
            return;
          }

        }

        catch(e) {
          console.log(e);
          resolve(comm);
          return;
        }


      }
      else if(action === 'move') {

        try {

          let lane, id, fighter, adjacentLanes, laneChoiceIsAdjacent;

          if(!moved) {
            comm.message = "No move object found."
            resolve(comm);
            return;
          }

          lane = moved.lane;
          id = moved.id;

          if(!id || (!lane && lane !== 0)) {
            comm.message = "No lane or fighter information provided for moving."
            resolve(comm);
            return;
          }

          if(lane !== 0 && lane !== 1 && lane !== 2) {
            comm.message = "Specified lane does not exist."
            resolve(comm);
            return;
          }

          fighter = player.deployed.find((fighter) => {
            return fighter.id === moved.id;
          });

          if(!fighter) {
            comm.message = "No matching fighter found for moving.";
            resolve(comm);
            return;
          }

          if(fighter.moved === true) {
            comm.message = "Fighter already moved this turn.";
            resolve(comm);
            return;
          }

          if(fighter.lane === lane) {
            comm.message = "Fighter is already in the specified lane.";
            resolve(comm);
            return;
          }

          adjacentLanes = this.getAdjacentLanes(fighter.lane);
          laneChoiceIsAdjacent = false;
          for (let i = 0; i < adjacentLanes.length; i++) {
            if(adjacentLanes[i] === lane) {
              laneChoiceIsAdjacent = true;
            }
          }

          if(!laneChoiceIsAdjacent) {
            comm.message = "Targeted lane for move is not adjacent.";
            resolve(comm);
            return;
          }

        }
        catch(e) {
          console.log(e);
          resolve(comm);
          return;
        }

      }
      else if(action === 'command') {

        try {

          let friendId, enemyId, friend, enemy, otherPlayer, 
          adjacentLanes, laneChoiceIsAdjacent

          if(!commanded) {
            comm.message = "No command object found.";
            resolve(comm);
            return;
          }

          friendId = commanded.friendId;
          enemyId = commanded.enemyId;

          if(friendId === undefined || enemyId === undefined) {
            comm.message = "No friend or enemy id found for attack.";
            resolve(comm);
            return;
          }

          if(friendId === 0) {

            friend = player;
            
            if(!friend.canAttack) {
              comm.message = "Player cannot attack.";
              resolve(comm);
              return;
            }
          }
          else{
            friend = player.deployed.find((fighter) => {
              return fighter.id === friendId;
            });
          }

          otherPlayer = this.game.getOtherPlayer(playerNumber);
          
          if(enemyId !== 0) {
            enemy = otherPlayer.deployed.find((fighter) => {
              return fighter.id === enemyId;
            });
          }
          else {
            enemy = otherPlayer;
          }

          if(!friend || !enemy) {
            comm.message = "Targetted friendly or enemy fighter was not found.";
            resolve(comm);
            return;
          }

          if(friend.commanded === true) {
            comm.message = "Friendly fighter has already attacked this turn.";
            resolve(comm);
            return;
          }

          if(friend.moved === true) {
            comm.message = "Friendly fighter has already moved this turn.";
            resolve(comm);
            return;
          }

          if(friendId !== 0 && enemyId !== 0) {
            let adjacentLanes = this.getAdjacentLanes(friend.lane);
            let laneChoiceIsAdjacent = false;
            for (let i = 0; i < adjacentLanes.length; i++) {
              if(adjacentLanes[i] === enemy.lane) {
                laneChoiceIsAdjacent = true;
              }
            }

            if(!laneChoiceIsAdjacent) {
              comm.message = "Enemy is not in an adjacent lane.";
              resolve(comm);
              return;
            }
          }

        }
        catch(e) {
          console.log(e);
          resolve(comm);
          return;
        }

      }
      else if(action === 'end') {
        //Only need to be active player to end the turn
      }
      else {
        comm.message = "Invalid action provided.";
        resolve(comm);
        return;
      }

      comm.status = 'new';
      comm.message = "Player action is valid.";
      resolve(comm);
      return;
    });

  }
  async checkActionValid({ actionId, actionsObject, 
    cardPrototypeId, playerNumber }) {

    return new Promise((resolve, reject) => {

      // actionsObject
      // {
      //     target: 'string',
      //     id: [Number]
      // }

      let prototype, target, id, thisPlayer, opponent, actionOne, 
      actionTwo, actionThree, actionOneValue, actionTwoValue, 
      actionThreeValue, actionValue;
      
      try {

        //Actions not requiring a target or actionsObject
        if (
          actionId === 0 ||
          actionId === 2 ||
          actionId === 3 ||
          actionId === 8 ||
          actionId === 9 ||
          actionId === 12 ||
          actionId === 15 ||
          actionId === 18 ||
          actionId === 19 ||
          actionId === 23 ||
          actionId === 24 ||
          actionId === 26 ||
          actionId === 27 ||
          actionId === 28 ||
          actionId === 30 ||
          actionId === 31 ||
          actionId === 33 
        ) 
        {
          resolve(true);
          return;
        }

        if(
          actionId === undefined ||
          actionsObject === undefined ||
          actionsObject.target === undefined ||
          typeof actionsObject.target !== "string" ||
          actionsObject.id === undefined ||
          !Array.isArray(actionsObject.id) ||
          cardPrototypeId === undefined ||
          typeof cardPrototypeId !== "number" ||
          playerNumber === undefined ||
          typeof playerNumber !== "number"
        ) 
        {
          resolve(false);
          return;
        }

        for (let i = 0; i < actionsObject.id.length; i++) {
          if(typeof actionsObject.id[i] !== "number"){
            resolve(false);
            return;
          }
        }

        target = actionsObject.target;
        id = actionsObject.id;

        prototype = this.game.cardPrototypes[cardPrototypeId];

        actionOne = prototype['actionOne'];
        actionTwo = prototype['actionTwo'];
        actionThree = prototype['actionThree'];

        actionOneValue = prototype['actionOneValue'];
        actionTwoValue = prototype['actionTwoValue'];
        actionThreeValue = prototype['actionThreeValue'];

        if(actionOne === actionId) {
          actionValue = prototype['actionOneValue'];
        }
        if(actionTwo === actionId) {
          actionValue = prototype['actionTwoValue'];
        }
        if(actionThree === actionId) {
          actionValue = prototype['actionThreeValue'];
        }

        if(actionValue === undefined) {
          resolve(false);
          return;
        }

        if(playerNumber === 1) {
          thisPlayer = this.game.playerOne;
          opponent = this.game.playerTwo;
        }
        if(playerNumber === 2) {
          thisPlayer = this.game.playerTwo;
          opponent = this.game.playerOne;
        }

        //Check that action target string is valid
        let validTargets = this.validActionTargets[actionId];
        let validString = false;

        for (let i = 0; i < validTargets.length; i++) {
          if(actionsObject.target === validTargets[i]) {
            validString = true;
          }
        }

        if(!validString) {
          resolve(false);
          return;
        }
      }
      catch(e) {
        console.log(e);
        resolve(false);
        return;
      }


      try {

        //Validate actions
        switch(actionId) {

          case 0: {
            //Specified if no action exists for this space on the cardPrototype
            break;
          }
          case 1: {
            //Heal self, friend, enemy, or opponent
            if(target === 'self' || target === 'opponent') {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }
            if(target === 'friend') {
              let exists = thisPlayer.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            if(target === 'enemy') {
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            break;
          }
          case 2: {
            //Draw cards from your own deck. 
            break;
          }
          case 3: {
            //Draw from opponent's hand randomly
            break;
          }
          case 4: {
            //Damage enemy or opponent
            if(target === 'opponent') {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }
            if(target === 'enemy') {
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            break;
          }
          case 5: {
            //Damage friend
            if(target === 'self') {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }
            if(target === 'friend') {
              let exists = thisPlayer.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            break;
          }
          case 6: {
            //Draw from your discard (targeted)

            if(thisPlayer.discard.length === 0 && id.length === 0) {
              break;
            }

            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }

            //id array length should be <= cardPrototype value
            if(id.length > actionValue) {
              resolve(false);
              return;
            }

            //Check that needed cards exist in discard
            let cardCountObject = {};
            let discard = thisPlayer.discard;

            if(id.length < actionValue && discard.length > id.length) {
              resolve(false)
              return;
            }

            for (let i = 0; i < id.length; i++) {

              if(!cardCountObject[id[i]]) {
                cardCountObject[id[i]] = 1;
              }
              else {
                cardCountObject[id[i]]++;
              }

              let cards = discard.filter((card) => {
                return card.id === id[i];
              });

              if(cards.length < cardCountObject[id[i]]) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 7: {
            //Paralyze enemy
            if(opponent.deployed.length === 0) {
              break;
            }
            if(id.length === 0) {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }

            let exists = opponent.deployed.find((fighter) => {
              return fighter.id === id[0];
            });
            if(!exists) {
              resolve(false);
              return;
            }

            break;
          }
          case 8: {
            //Damage self
            break;
          }
          case 9: {
            //Damage opponent's development
            break;
          }
          case 10: {
            //Discard cards (self)

            //Don't discard more cards than exist in hand
            if(id.length > thisPlayer.hand.length) {
              resolve(false);
              return;
            }

            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }
            //Don't discard more than allowed by cardPrototype
            if(id.length > actionValue) {
              resolve(false);
              return;
            }

            //Don't allow player to discard less than told to by cardPrototype if more cards are still left in hand
            if(id.length < actionValue && thisPlayer.hand.length > id.length) {
              resolve(false);
              return;
            }

            //Check that needed cards exist in hand
            let cardCountObject = {};
            let hand = thisPlayer.hand;

            for (let i = 0; i < id.length; i++) {

              if(!cardCountObject[id[i]]) {
                cardCountObject[id[i]] = 1;
              }
              else {
                cardCountObject[id[i]]++;
              }

              let cards = hand.filter((card) => {
                return card.id === id[i];
              });

              if(cards.length < cardCountObject[id[i]]) {
                resolve(false);
                return;
              }
            }
            break;
          }
          case 11: {
            //Heal friend
            if(target === 'self') {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }
            if(target === 'friend') {
              let exists = thisPlayer.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 12: {
            //Damage your development (self)
            break;
          }
          case 13: {
            //Swap fighter with an enemy fighter

            if(id.length !== 2) {
              resolve(false);
              return;
            }

            //Friend doesn't need to exist if fighter is being deployed by the card that spawned this action
            // Handle this by having deployable Fighters deploy
            // before actions take effect
            let friendExists = thisPlayer.deployed.find((fighter) => {
              return fighter.id === id[0];
            });
            if(!friendExists) {
              resolve(false);
              return;
            }

            let enemyExists = opponent.deployed.find((fighter) => {
              return fighter.id === id[1];
            });
            if(!enemyExists) {
              resolve(false);
              return;
            }

            break;
          }
          case 14: {
            //Kill enemies with health less than cost of this card
            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }
            if(id.length > actionValue) {
              resolve(false);
              return;
            }

            let fighterIdObject = {};

            for (let i = 0; i < id.length; i++) {

              //All fighters should be unique
              if(!fighterIdObject[id[i]]) {
                fighterIdObject[id[i]] = 1;
              }
              else {
                fighterIdObject[id[i]]++;
              }

              if(fighterIdObject[id[i]] > 1) {
                resolve(false);
                return;
              }

              //All fighters should exist
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[i];
              });
              if(!exists) {
                resolve(false);
                return;
              }
              if(exists.health >= prototype.actionPointCost) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 15: {
            //Opponent discards cards
            break;
          }
          case 16: {
            //Deal damage to any target
            if(target === 'self' || target === 'opponent') {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }
            if(target === 'friend') {
              let exists = thisPlayer.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            if(target === 'enemy') {
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 17: {
            //Kill enemy fighters
            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }
            if(id.length > actionValue) {
              resolve(false);
              return;
            }

            let fighterIdObject = {};

            for (let i = 0; i < id.length; i++) {

              //All fighters should be unique
              if(!fighterIdObject[id[i]]) {
                fighterIdObject[id[i]] = 1;
              }
              else {
                fighterIdObject[id[i]]++;
              }

              if(fighterIdObject[id[i]] > 1) {
                resolve(false);
                return;
              }

              //All fighters must exist
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[i];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 18: {
            //Deal damage to opponent
            break;
          }
          case 19: {
            //This fighter gets an 'evade' condition
            break;
          }
          case 20: {
            //Give cards to your opponent
            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }
            //Don't give more cards than card allows
            if(id.length > actionValue) {
              resolve(false);
              return;
            }

            //Don't give less cards than cardPrototype says to unless not enough cards in hand
            if(id.length < actionValue && thisPlayer.hand.length > id.length) {
              resolve(false);
              return;
            }
            let cardCountObject = {};
            let hand = thisPlayer.hand;

            for (let i = 0; i < id.length; i++) {

              if(!cardCountObject[id[i]]) {
                cardCountObject[id[i]] = 1;
              }
              else {
                cardCountObject[id[i]]++;
              }

              let cards = hand.filter((card) => {
                return card.id === id[i];
              });

              if(cards.length < cardCountObject[id[i]]) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 21: {
            //Discard some number of cards and draw that many from deck

            if(id.length === 0) {
              break;
            }
            //Don't discard more cards than in hand
            if(id.length > thisPlayer.hand.length) {
              resolve(false);
              return;
            }

            //Check that needed cards exist in hand
            let cardCountObject = {};
            let hand = thisPlayer.hand;

            for (let i = 0; i < id.length; i++) {

              if(!cardCountObject[id[i]]) {
                cardCountObject[id[i]] = 1;
              }
              else {
                cardCountObject[id[i]]++;
              }

              let cards = hand.filter((card) => {
                return card.id === id[i];
              });

              if(cards.length < cardCountObject[id[i]]) {
                resolve(false);
                return;
              }
            }

            break;
          }
          case 22: {
            //Fighter attacks on deploy
            if(target === 'opponent') {
              break;
            }
            if(id.length !== 1) {
              resolve(false);
              return;
            }
            if(target === 'enemy') {
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            break;
          }
          case 23: {
            //Fighter gains condition 'mutliple attacks'
            break;
          }
          case 24: {
            //Fighter gains condition 'damage defend'
            break;
          }
          case 25: {
            //Control enemy (turn enemy fighter to your side)
            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }
            if(id.length > actionValue) {
              resolve(false);
              return;
            }

            let fighterIdObject = {};

            for (let i = 0; i < id.length; i++) {

              //All fighters should be unique
              if(!fighterIdObject[id[i]]) {
                fighterIdObject[id[i]] = 1;
              }
              else {
                fighterIdObject[id[i]]++;
              }

              if(fighterIdObject[id[i]] > 1) {
                resolve(false);
                return;
              }

              //All fighters must exist
              let exists = opponent.deployed.find((fighter) => {
                return fighter.id === id[i];
              });
              if(!exists) {
                resolve(false);
                return;
              }
            }
            break;
          }
          case 26: {
            //Boost self dev
            break;
          }
          case 27: {
            //View cards from opponent's hand
            break;
          }
          case 28: {
            //Draw a random card from your discard
            break;
          }
          case 29: {
            //Free play (play cards from hand for free)
            //This action just increments player.freePlay
            //A freePlay is resolved through a reactEvent

            // if(id.length === 0) {
            //   break;
            // }
            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }
            //Don't play more cards than allowed by card prototype
            // if(id.length > actionValue) {
            //   resolve(false);
            //   return;
            // }

            // //Check that needed cards exist in hand
            // let cardCountObject = {};
            // let hand = thisPlayer.hand;

            // for (let i = 0; i < id.length; i++) {

            //   if(!cardCountObject[id[i]]) {
            //     cardCountObject[id[i]] = 1;
            //   }
            //   else {
            //     cardCountObject[id[i]]++;
            //   }

            //   let cards = hand.filter((card) => {
            //     return card.id === id[i];
            //   });

            //   if(cards.length < cardCountObject[id[i]]) {
            //     resolve(false);
            //     return;
            //   }
            // }
            break;
          }
          case 30: {
            //Heal self
            break;
          }
          case 31: {
            //Opponent draws discard target
            break;
          }
          case 32: {
            //Deploy another fighter from your hand
            //This action just increments player.freeDeploy
            //Actual free deploy is handled in a reactEvent

            if(prototype === {} || !actionValue) {
              resolve(false);
              return;
            }

            //Don't play more cards than allowed by card prototype
            // if(id.length > actionValue) {
            //   resolve(false);
            //   return;
            // }

            // //Check that needed cards exist in hand
            // let cardCountObject = {};
            // let hand = thisPlayer.hand;

            // for (let i = 0; i < id.length; i++) {

            //   if(!cardCountObject[id[i]]) {
            //     cardCountObject[id[i]] = 1;
            //   }
            //   else {
            //     cardCountObject[id[i]]++;
            //   }

            //   let cards = hand.filter((card) => {
            //     return card.id === id[i];
            //   });

            //   if(cards.length < cardCountObject[id[i]]) {
            //     resolve(false);
            //     return;
            //   }

            //   //Also check cards are deployable
            //   if (
            //     this.game.cardPrototypes[cards[i].id].deployable
            //     === false
            //   )
            //   {
            //     resolve(false);
            //     return;
            //   }

            // }

            break;
          }
          case 33: {
            //View cards from top of deck (self)
            break;
          }
          default: {
            //Case not provided, action invalid
            resolve(false);
            break;
          }
        }

      }
      catch(e) {
        console.log(e);
        resolve(false);
        return;
      }

      resolve(true);
    });
  }
  async submitMove(comm) {
    return new Promise(async (resolve, reject) => {

      try {

        let serverComm = false;

        if(!comm) {
          let newObj = {};
          newObj.status = 'rejected';
          newObj.message = 'No communication object provided to submitMove.';
          resolve(newObj);
          return;
        }
        if(comm.status === 'new') {
          if(comm.action === 'play') {
            serverComm = await this.processPlay(comm);
            resolve(serverComm);
            return;
          }
          else if(comm.action === 'move') {
            serverComm = await this.processMove(comm);
            resolve(serverComm);
            return;
          }
          else if(comm.action === 'command') {
            serverComm = await this.processCommand(comm);
            resolve(serverComm);
            return;
          }
          else if(comm.action === 'end') {
            serverComm = await this.processEndTurn(comm);
            resolve(serverComm);
            return;
          }
          else {
            comm.status = 'rejected';
            comm.message = "An invalid action was provided to submitMove.";
            resolve(comm);
            return;
          }
        }
        else if(comm.status === 'react') {
            serverComm = await this.processReact(comm);
            resolve(serverComm);
            return;
        }
        else {
          comm.status = 'rejected';
          comm.message = "An invalid status was provided to submitMove.";
          resolve(comm);
          return;
        }

      }

      catch(e) {
        console.log(e);
        comm.status = 'rejected';
        comm.message = "An error was encountered in submitMove.";
        resolve(comm);
      }

    });
  }
  async processPlay(comm) {
    return new Promise(async (resolve) => {

      let actions = comm.actions;
      let playerNumber = comm.playerNumber;
      let lane = comm.lane;
      let player = this.game.getPlayer(playerNumber);
      let cardPrototypeId = comm.cardPrototypeId;
      let prototype = this.game.cardPrototypes[cardPrototypeId];

      if(prototype.deployable) {
        player.deployFighter(prototype, comm.lane)
      }

      if(player.freePlay > 0 || player.freeDeploy > 0) {
        if(player.freeDeploy > 0 && prototype.deployable === true) {
          player.freeDeploy--;
        }
        else {
          player.freePlay--;
        }
      }
      else {
        player.dev -= prototype.actionPointCost;
      }

      this.drawToDiscard({ playerNumber: playerNumber, collection: player.hand, matchId: cardPrototypeId });

      let actionOne = prototype.actionOne;
      let actionTwo = prototype.actionTwo;
      let actionThree = prototype.actionThree;

      let responseOne = await this.processAction({ 
        actionId: actionOne, 
        actionsObject: actions[actionOne], 
        cardPrototypeId: cardPrototypeId, 
        playerNumber: playerNumber, 
        lane: lane 
      });

      let responseTwo = await this.processAction({ 
        actionId: actionTwo, 
        actionsObject: actions[actionTwo], 
        cardPrototypeId: cardPrototypeId, 
        playerNumber: playerNumber, 
        lane: lane 
      });

      let responseThree = await this.processAction({ 
        actionId: actionThree, 
        actionsObject: actions[actionThree], 
        cardPrototypeId: cardPrototypeId, 
        playerNumber: playerNumber, 
        lane: lane 
      });

      comm.responseOne = responseOne;
      comm.responseTwo = responseTwo;
      comm.responseThree = responseThree;
      
      // If any of the special conditions applied to plays, would enable this
      // this.applySpecials('play', actions);

      comm.status = 'accepted';

      this.emitMessage({
        message: 'server-accepted-play', 
        comm: comm, 
        playerNumber: playerNumber
      });
      
      this.clearDead();

      resolve(comm);
      return;
    });
    
  }
  async processAction({ actionId, actionsObject, cardPrototypeId, playerNumber, lane }) {
    return new Promise((resolve) => {

      try {

        if(actionId === 0) {
          resolve(true);
          return;
        }
        //actionsObject {target: String, id: [Number]}

        let response = true;

        let target = actionsObject.target;
        let id = actionsObject.id;
        let player = this.game.getPlayer(playerNumber);
        let opponent = this.game.getOtherPlayer(playerNumber);

        let prototype = this.game.cardPrototypes[cardPrototypeId];
        let actionOne, actionTwo, actionThree, actionOneValue, actionTwoValue, actionThreeValue, actionValue;

        actionOne = prototype['actionOne'];
        actionTwo = prototype['actionTwo'];
        actionThree = prototype['actionThree'];

        actionOneValue = prototype['actionOneValue'];
        actionTwoValue = prototype['actionTwoValue'];
        actionThreeValue = prototype['actionThreeValue'];

        if(actionOne === actionId) {
          actionValue = prototype['actionOneValue'];
        }
        if(actionTwo === actionId) {
          actionValue = prototype['actionTwoValue'];
        }
        if(actionThree === actionId) {
          actionValue = prototype['actionThreeValue'];
        }

        let historyObject = {};
        historyObject['player'] = playerNumber;
        historyObject['turnNumber'] = this.game.turn;
        historyObject['playerAction'] = 'play';
        historyObject['actionId'] = actionId;
        historyObject['target'] = target;
        historyObject['id'] = id;
        historyObject['actionValue'] = actionValue;

        switch(actionId) {

          case 0:
            //Specified if no action exists for this space on the cardPrototype
            break;

          case 1: {
            //Heal self, friend, enemy, or opponent
            if(target === 'self') {

              if(player.health + actionValue > player.maxHealth) {
                player.health = player.maxHealth;
                break;
              }

              player.health += actionValue;
              break;
            }
            if(target === 'opponent') {

              if(opponent.health + actionValue > opponent.maxHealth) {
                opponent.health = opponent.maxHealth;
                break;
              }

              opponent.health += actionValue;
              break;
            }
            if(target === 'friend') {

              let friend = player.deployed.find((fighter) => {
                return fighter.id === id[0];
              });

              if(friend.health + actionValue > friend.maxHealth) {
                friend.health = friend.maxHealth;
                break;
              }

              friend.health += actionValue;
              break;
            }
            if(target === 'enemy') {

              let enemy = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });

              if(enemy.health + actionValue > enemy.maxHealth) {
                enemy.health = enemy.maxHealth;
                break;
              }

              enemy.health += actionValue;
              break;
            }
            break;
          }
          case 2: {

            //Draw cards from your own deck.
            for (let i = 0; i < actionValue; i++) {

              this.drawToHand({
                playerNumber: playerNumber, 
                collection: player.deck
              });

            }
            break;
          }
          case 3: {

            //Draw from opponent's hand randomly
            for (let i = 0; i < actionValue; i++) {

              this.drawToHand({
                playerNumber: playerNumber, 
                collection: opponent.hand, 
                random: true
              });

            }
            break;
          }
          case 4: {
            //Damage enemy or opponent
            if(target === 'opponent') {
              opponent.health -= actionValue;
              break;
            }
            if(target === 'enemy') {
              let enemy = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              enemy.health -= actionValue;
              break;
            }
            break;
          }
          case 5: {
            //Damage friend
            if(target === 'self') {
              player.health -= actionValue;
              break;
            }
            if(target === 'friend') {
              let friend = player.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              friend.health -= actionValue;
              break;
            }
            break;
          }
          case 6: {

            //Draw from your discard (targeted)

            if(player.discard.length === 0) {
              break;
            }

            for (let i = 0; i < actionValue; i++) {
              this.drawToHand({ 
                playerNumber: playerNumber, 
                collection: player.discard, 
                matchId: id[i] 
              });
            }
            break;
          }
          case 7: {
            //Paralyze enemy
            if(opponent.deployed.length === 0) {
              break;
            }
            if(id.length === 0) {
              break;
            }
            let enemy = opponent.deployed.find((fighter) => {
              return fighter.id === id[0];
            });

            if(!enemy) {
              break;
            }

            enemy.specialConditions.push({
              condition: 'paralyze', 
              timesUsed: 0, 
              value: 3
            });
            enemy.moved = true;
            enemy.commanded = true;
            break;
          }
          case 8: {
            //Damage self
            player.health -= actionValue;
            break;
          }
          case 9: {
            //Damage opponent's development
            this.damageMaxDev(actionValue, opponent);
            break;
          }
          case 10: {
            //Discard cards (self)

            for (let i = 0; i < actionValue; i++) {

              this.drawToDiscard({ 
                playerNumber: playerNumber, 
                collection: player.hand, 
                matchId: id[i] 
              });

            }
            break;
          }
          case 11: {
            //Heal friend
            if(target === 'self') {

              if(player.health + actionValue > player.maxHealth) {
                player.health = player.maxHealth;
                break;
              }

              player.health += actionValue;
              break;
            }
            if(target === 'friend') {

              let friend = player.deployed.find((fighter) => {
                return fighter.id === id[0];
              });

              if(friend.health + actionValue > friend.maxHealth) {
                friend.health = friend.maxHealth;
                break;
              }

              friend.health += actionValue;
              break;
            }
            break;
          }
          case 12: {
            //Damage your development (self)
            this.damageMaxDev(actionValue, player);
            break;
          }
          case 13: {
            //Swap fighter with an enemy fighter
            //Player should own first element, enemy should own second element

            let friend = player.deployed.find((fighter) => {
              return fighter.id === id[0];
            });

            let enemy = opponent.deployed.find((fighter) => {
              return fighter.id === id[1];
            });

            let enemyCopy = JSON.parse(JSON.stringify(enemy));
            let friendCopy = JSON.parse(JSON.stringify(friend));

            player.deployCount++;
            opponent.deployCount++;

            enemy.id = player.deployCount;
            enemy.moved = true;
            enemy.commanded = true;
            enemy.lane = friendCopy.lane;
            
            friend.id = opponent.deployCount;
            friend.lane = enemyCopy.lane;

            player.deployed.push(enemy);
            opponent.deployed.push(friend);

            let playerDeployed = player.deployed.filter((fighter) => {
              return fighter.id !== friend.id
            });

            let opponentDeployed = opponent.deployed.filter((fighter) => {
              return fighter.id !== enemy.id
            });

            player.deployed = playerDeployed;
            opponent.deployed = opponentDeployed;
            break;
          }
          case 14: {
            //Kill enemies with health less than cost of this card
              for (let i = 0; i < id.length; i++) {
                let enemy = opponent.deployed.find((fighter) => {
                  return fighter.id === id[i];
                });
                enemy.health = 0;
              }
            break;
          }
          case 15: {
            //Opponent discards cards
            opponent.reactEvents.push({actionId: 15, value: actionValue});
            break;
          }
          case 16: {
            //Deal damage to any target
            if(target === 'self') {
              player.health -= actionValue;
              break;
            }
            if(target === 'opponent') {
              opponent.health -= actionValue;
              break;
            }

            if(target === 'friend') {
              let friend = player.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              friend.health -= actionValue;
              break;
            }
            if(target === 'enemy') {
              let enemy = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              enemy.health -= actionValue;
              break;
            }

            break;
          }
          case 17: {
            //Kill enemy fighters

            for (let i = 0; i < id.length; i++) {

              let enemy = opponent.deployed.find((fighter) => {
                return fighter.id === id[i];
              });
              if(enemy) {
                enemy.health = 0;
              }
            }
            break;
          }
          case 18: {
            //Deal damage to opponent
            opponent.health -= actionValue;
            break;
          }
          case 19: {
            //This fighter gets an 'evade' condition. 
            //Handled when a fighter is deployed (fighter#buildSpecials)
            break;
          }
          case 20: {
            //Give cards to your opponent
            for (let i = 0; i < id.length; i++) {

              this.drawToHand({ 
                playerNumber: opponent.number, 
                collection: player.hand, 
                matchId: id[i]
              });
            }

            break;
          }
          case 21: {
            //Discard some number of cards and draw that many from deck
            for (let i = 0; i < id.length; i++) {

              this.drawToDiscard({ 
                playerNumber: playerNumber, 
                collection: player.hand, 
                matchId: id[i] 
              });
            }
            for (let i = 0; i < id.length; i++) {

              this.drawToHand({ 
                playerNumber: playerNumber, 
                collection: player.deck 
              });
            }

            break;
          }
          case 22: {
            //Fighter attacks on deploy
            if(target === 'opponent') {
              if(lane === 0) {
                this.hitDev(1, opponent);
              }
              if(lane === 1) {
                opponent.health -= prototype.attackValue;
              }
              if(lane === 2) {
                this.hitDeck(1, opponent);
              }
            }
            let enemy;
            if(target === 'enemy') {
              enemy = opponent.deployed.find((fighter) => {
                return fighter.id === id[0];
              });
              enemy.health -= prototype.attackValue;
            }

            break;
          }
          case 23: {
            //Fighter gains condition 'mutliple attacks'
            //Handled when a fighter is deployed (fighter#buildSpecials)
            break;
          }
          case 24: {
            //Fighter gains condition 'damage defend'
            //Handled when a fighter is deployed (fighter#buildSpecials)
            break;
          }
          case 25: {
            //Control enemy (turn enemy fighter to your side)
            for (let i = 0; i < id.length; i++) {

              let temp = opponent.deployed.filter((fighter) => {
                return fighter.id !== id[i];
              });
              let enemy = opponent.deployed.find((fighter) => {
                return fighter.id === id[i];
              });

              player.deployCount++;

              enemy.id = player.deployCount;
              enemy.moved = true;
              enemy.commanded = true;

              player.deployed.push(enemy);
              opponent.deployed = temp;
            }
            break;
          }
          case 26: {
            //Boost self dev
            for (let i = 0; i < actionValue; i++) {
              this.incrementMaxDev({playerNumber: playerNumber});
            }
            break;
          }
          case 27: {
            //View cards from opponent's hand
            let randomArray = [];
            let result = [];
            let counter = 0;
            let size = opponent.hand.length;

            while (randomArray.length < actionValue && counter < 30 && randomArray.length < size) {
              let random = Math.floor(Math.random() * size);
              if(randomArray.indexOf(random) === -1) {
                randomArray.push(random);
              }
              counter++;
            }

            for ( let i = 0; i < randomArray.length; i++) {
              let card = opponent.hand[randomArray[i]];
              result.push(card);
            }

            historyObject['cardArray'] = result;

            response = result;

            break;
          }
          case 28: {
            //Draw a random card from your discard
            for (let i =0; i < actionValue; i++) {

              this.drawToHand({ 
                playerNumber: playerNumber, 
                collection: player.discard, 
                random: true 
              });
            }
            break;
          }
          case 29: {
            //Free play (play cards from hand for free).
            for (let i = 0; i < actionValue; i++) {
              player.freePlay++;
              player.reactEvents.push({actionId: 29, value: actionValue});
            }
            break;
          }
          case 30: {
            //Heal self

            if(player.health + actionValue > player.maxHealth) {
              player.health = player.maxHealth;
              break;
            }   

            player.health += actionValue;
            break;
          }
          case 31: {
            //Opponent draws discard target
            for (let i = 0; i < actionValue; i++) {
              opponent.reactEvents.push({actionId: 31, value: actionValue});
            }
            break;
          }
          case 32: {
            //Deploy another fighter from your hand
            for (let i = 0; i < actionValue; i++) {
              player.freeDeploy++; 
              player.reactEvents.push({actionId: 32, value: actionValue});
            }
            break;
          }
          case 33: {
            //View cards from top of deck (self)
            let cards = [];
            for ( let i = 0; i < actionValue; i++) {
              let card = this.view({ collection: player.deck, index: i });
              cards.push(card);
            }
            response = cards;

            break;
          }
        }
        this.game.history.push(historyObject);
        resolve(response);
      }

      catch(e) {
        console.log(e)
        resolve(false)
      }

    });
  }
  async processMove(comm) {
    return new Promise(async (resolve, reject) => {

      let playerNumber = comm.playerNumber;
      let moved = comm.moved;
      let id = moved.id;
      let lane = moved.lane;
      let player = this.game.getPlayer(playerNumber);
      let fighter = player.deployed.find((fighter) => {
        return fighter.id === id;
      });

      let historyObject = {};
      historyObject['playerNumber'] = playerNumber;
      historyObject['playerAction'] = 'move'; 
      historyObject['oldLane'] = fighter.lane;
      historyObject['newLane'] = lane;
      historyObject['turnNumber'] = this.game.turn;
      historyObject['specials'] = [];

      fighter.lane = lane;
      fighter.moved = true;

      // If any of the special conditions applied to moves, would enable this
      // this.applySpecials('move', fighter);

      comm.status = 'accepted';
      this.game.history.push(historyObject);

      this.clearDead();

      resolve(comm);
      return;
    });

  }
  async processCommand(comm) {
    return new Promise(async (resolve, reject) => {

      let playerNumber = comm.playerNumber;
      let commanded = comm.commanded;
      let friendId = commanded.friendId;
      let enemyId = commanded.enemyId;

      let player = this.game.getPlayer(playerNumber);
      let otherPlayer = this.game.getOtherPlayer(playerNumber);

      let attacker, defender;

      if(friendId !== 0) {
        attacker = player.deployed.find((fighter) => {
          return fighter.id === friendId;
        });
      }
      else {
        attacker = player;
      }
      if(enemyId !== 0) {
        defender = otherPlayer.deployed.find((fighter) => {
          return fighter.id === enemyId;
        });
      }
      else {
        defender = otherPlayer;
      }

      if(defender !== otherPlayer || attacker.lane === 1 || (attacker === player && defender === otherPlayer)) {
        //Apply attack against health (players can only damage health, not dev or deck)
        defender.health = defender.health - attacker.attack;
      }
      else if (attacker.lane === 0 && defender === otherPlayer) {
        //Damage opponent's development
        this.hitDev(1, defender);
      }
      else if (attacker.lane === 2 && defender === otherPlayer) {
        //Damage opponent's deck
        this.hitDeck(1, defender);
      }

      attacker.commanded = true;

      let historyObject = {};
      historyObject['playerNumber'] = playerNumber;
      historyObject['playerAction'] = 'command'; 
      historyObject['attacker'] = attacker;
      historyObject['defender'] = defender;
      historyObject['turnNumber'] = this.game.turn;
      historyObject['specials'] = [];

      await this.applySpecials({ 
        playerAction: 'command', 
        attacker: attacker, 
        defender: defender, 
        history: historyObject 
      });

      comm.status = 'accepted';

      this.clearDead();
      this.game.history.push(historyObject);

      resolve(comm);
      return;
    });
  }
  async processEndTurn(comm) {
    return new Promise(async (resolve, reject) => {

      let playerNumber = comm.playerNumber;
      let otherPlayer = this.game.getOtherPlayer(playerNumber);
      
      let historyObject = {};
      historyObject['playerNumber'] = playerNumber;
      historyObject['playerAction'] = 'end'; 
      historyObject['turnNumber'] = this.game.turn;
      
      this.game.history.push(historyObject);

      this.endTurn({
        playerNumber: playerNumber,
        turn: this.game.turn
      });

      comm.status = 'accepted';
      this.clearDead();

      resolve(comm);
      return;
    });
  }
  async checkNewReact(comm) {
    return new Promise(async (resolve, reject) => {

      let reactActionId, over, action, moved, commanded, cardPrototypeId,
          prototype, actionsObject, lane,
          playerNumber, player, reactAction, type;

      try {

        if(!comm) {
          let newObj = {};
          newObj.status = 'rejected';
          newObj.message = "No comm object provided.";
          resolve(newObj);
          return;
        }

        comm.status = 'rejected';
        comm.message = "An error was encountered during validity checking.";  

        playerNumber = comm.playerNumber;
        player = this.game.getPlayer(playerNumber);

        if(!playerNumber || !player) {
          comm.message = "Invalid player number provided.";
          resolve(comm);
          return;
        }

        if(player.reactEvents.length === 0) {
          comm.message = "No react events to react to.";
          resolve(comm);
          return;
        }

        //React comm needs to have 
        //reactActionId: Number,
        //reactAction: {
        //   target: String,
        //   id: [Number]
        //}

        reactActionId = comm.reactActionId;

        if(!reactActionId || typeof reactActionId !== 'number') {
          comm.message = "No react action id provided.";
          resolve(comm);
          return;
        }

        if(reactActionId !== player.reactEvents[0].actionId) {
          comm.message = "Invalid react action ID provided.";
          resolve(comm);
          return;
        }

        reactAction = comm.reactAction;

        if(
          !reactAction                           ||
          !reactAction.target                    ||
          !reactAction.id                        ||
          typeof reactAction.target !== 'string' ||
          !Array.isArray(reactAction.id)
        )
        {
          comm.message = "Invalid react action object provided.";
          resolve(comm);
          return;
        }
      }
      catch(e) {
        console.log(e);
        resolve(comm);
        return;
      }

      try {

        let id          = reactAction.id;
        let target      = reactAction.target;
        let actionValue = player.reactEvents[0].value;

        if(!actionValue) {
          comm.message = "React event does not have a value.";
          this.removeReactEvent(playerNumber);
          resolve(comm);
          return;
        }

        switch(reactActionId) {
          case 15: {
            //Discard cards (self) forced by opponent

            //Don't discard more cards than exist in hand
            if(id.length > player.hand.length) {
              comm.message = "Discarding more cards than are in hand.";
              resolve(comm);
              return;
            }

            //Don't discard more than allowed by cardPrototype
            if(id.length > actionValue) {
              comm.message = "Discarding more cards than allowed.";
              resolve(comm);
              return;
            }

            //Don't allow player to discard less than told to by cardPrototype if more cards are still left in hand
            if(id.length < actionValue && player.hand.length > id.length) {
              comm.message = "Not enough cards provided for discard.";
              resolve(comm);
              return;
            }

            //Check that needed cards exist in hand
            let cardCountObject = {};
            let hand = player.hand;

            for (let i = 0; i < id.length; i++) {

              if(!cardCountObject[id[i]]) {
                cardCountObject[id[i]] = 1;
              }
              else {
                cardCountObject[id[i]]++;
              }

              let cards = hand.filter((card) => {
                return card.id === id[i];
              });

              if(cards.length < cardCountObject[id[i]]) {
                comm.message = "Provided cards do not exist in hand.";
                resolve(comm);
                return;
              }
            }

            break;
          }
          case 29: {
            //FREE_PLAY

            let validComm = await this.checkNewMove(comm);
            if(validComm.status !== 'new') {
              resolve(validComm);
              return;
            }
            comm.status = 'new';
            break;
          }
          case 31: {
            //Player draws discard target

            if(player.discard.length === 0 && id.length === 0) {
              break;
            }

            if(id.length > actionValue) {
              comm.message = "Cannot draw more cards than allowed."
              resolve(comm);
              return;
            }

            //Check that needed cards exist in discard
            let cardCountObject = {};
            let discard = player.discard;

            if(id.length < actionValue && discard.length > id.length) {
              comm.message = "Cannot draw less cards than required."
              resolve(comm)
              return;
            }

            for (let i = 0; i < id.length; i++) {

              if(!cardCountObject[id[i]]) {
                cardCountObject[id[i]] = 1;
              }
              else {
                cardCountObject[id[i]]++;
              }

              let cards = discard.filter((card) => {
                return card.id === id[i];
              });

              if(cards.length < cardCountObject[id[i]]) {
                comm.message = "Specified cards not found.";
                resolve(comm);
                return;
              }
            }

            break;
          }
          case 32: {
            //DEPLOY

            let validComm = await this.checkNewMove(comm);
            if(validComm.status !== 'new') {
              resolve(validComm);
              return;
            }
            comm.status = 'new';
            break;
          }

          default: {
            //Case not provided, action invalid
            comm.message = "React actionId is not a valid action.";
            resolve(comm);
            return;
          }        
        }

        comm.status = (comm.status === 'new' ? 'new' : 'react');
        comm.message = "Player react action is valid.";
        resolve(comm);
        return;
      }
      catch(e) {
        console.log(e);
        resolve(comm);
        return;
      }

    });
  }
  async processReact(comm) {

    return new Promise(async (resolve) => {

      let actionId = comm.reactActionId;
      let target = comm.reactAction.target;
      let id = comm.reactAction.id;
      let playerNumber = comm.playerNumber;
      let player = this.game.getPlayer(playerNumber);

      switch(actionId) {
        case 15: {
          //Discard cards (self) forced by opponent
          for (let i = 0; i < id.length; i++) {

            this.drawToDiscard({ 
              playerNumber: playerNumber, 
              collection: player.hand, 
              matchId: id[i] 
            });

          }

          break;
        }
        case 29: {
          break;
        }
        case 31: {
          //Player draws cards from discard
          for (let i = 0; i < id.length; i++) {

            this.drawToHand({ 
              playerNumber: playerNumber, 
              collection: player.discard,
              matchId: id[i]
            });

          }
        }
        case 32: {
          break;
        }
      }

      // If any of the special conditions applied to reacts, would enable this
      // this.applySpecials('play', actions);

      comm.status = 'accepted';

      this.emitMessage({
        message: 'server-accepted-play', 
        comm: comm, 
        playerNumber: playerNumber
      });
      
      this.clearDead();

      resolve(comm);
      return;
    });
  }
  async removeReactEvent(playerNumber) {
    let player = this.game.getPlayer(playerNumber);
    if(player.reactEvents.length !== 0) {
      player.reactEvents.splice(0, 1);
    }
    return;
  }
  async checkProcessing() {

    try {

      if(this.stack.length === 0) {
        this.processing = undefined;
        return;
      }

      this.processingCounter++;

      if(this.processing === undefined) {
        this.processingCounter = 0;
        this.processing = this.stack[0];
        this.nextProcessing();
      }

      if(this.processingCounter > this.processingCounterLimit) {
        this.processingCounter = 0;
        if(this.processing === this.stack[0]) {
          this.stack.splice(0,1);
          this.processing = undefined;
        }
      }
    }
    catch(e) {
      console.log(e);
      return;
    }
  }
  async nextProcessing() {

    try {

      let comm = this.stack[0];

      if(!comm.status) {
        return;
      }

      if(comm.status === 'new') {

        //Check move validity
        let validComm = await this.checkNewMove(comm);

        if(validComm.status !== 'new') {
          this.emitMessage({
            message: 'server-rejected-invalid',
            comm: validComm,
            playerNumber: comm.playerNumber
          })

          this.stack.splice(0,1);
          this.processing = undefined;
          this.processingCounter = 0;

          return;
        }

        //Move was validated, submit to gameLoop
        let serverComm = await this.submitMove(comm);

        if(serverComm.status !== 'accepted') {

          this.emitMessage({
            message: 'server-rejected-error',
            comm: serverComm,
            playerNumber: comm.playerNumber
          })

          this.stack.splice(0,1);
          this.processing = undefined;
          this.processingCounter = 0;
          return;      
        }

        if(this.checkGameOver()) {
          this.endGame();
          return;
        }

        this.stack.splice(0, 1);
        this.processing = undefined;
        this.processingCounter = 0;

        this.pushState();
      }

      if(comm.status === 'react') {

        //Check move validity
        let validComm = await this.checkNewReact(comm);

        if(validComm.status !== 'react' &&
           validComm.status !== 'new'
        ) 
        {
          this.emitMessage({
            message: 'server-rejected-invalid',
            comm: comm,
            playerNumber: comm.playerNumber
          })

          this.stack.splice(0,1);
          this.processing = undefined;
          this.processingCounter = 0;

          return;
        }
        //Move was validated, submit to gameLoop
        let serverComm = await this.submitMove(comm);

        if(serverComm.status !== 'accepted') {

          this.emitMessage({
            message: 'server-rejected-error',
            comm: serverComm,
            playerNumber: comm.playerNumber
          })

          this.stack.splice(0,1);
          this.processing = undefined;
          this.processingCounter = 0;
          this.removeReactEvent(serverComm.playerNumber);
          return;      
        }

        this.removeReactEvent(serverComm.playerNumber);

        if(this.checkGameOver()) {
          this.endGame();
          return;
        }

        this.stack.splice(0, 1);
        this.processing = undefined;
        this.processingCounter = 0;

        this.pushState();
      }

    }
    catch(e) {
      console.log(e);
      this.stack.splice(0,1);
      this.processing = undefined;
      this.processingCounter = 0;
      return;
    }

  }
  async emitMessage({message, comm, playerNumber}) {
    if(playerNumber === 1) {
      if(this.userOne.socket.emit) {
        this.userOne.socket.emit(message, comm);
      }
    }
    if(playerNumber === 2) {
      if(this.userTwo.socket.emit) {
        this.userTwo.socket.emit(message, comm);
      }
    }
  }
  async getState(playerNumber) {
    return new Promise((resolve, reject) => {

      let state = JSON.parse(JSON.stringify(this.game));

      if (playerNumber !== 1 && playerNumber !== 2) {
        resolve(false);
      }
      if (playerNumber === 1) {
        //Sanitize player two's information

        state.playerTwo.handLength = state.playerTwo.hand.length;
        state.playerTwo.deckLength = state.playerTwo.deck.length;

        state.playerTwo.ethAddress = '';
        state.playerTwo.user = {};
        state.playerTwo.hand = [];
        state.playerTwo.deck = [];

        //TODO Re-enable after testing
        // state.playerOne.deckLength = this.game.playerOne.deck.length;
        // state.playerOne.deck = [];

      }
      if (playerNumber === 2) {
        //Sanitize player one's information

        state.playerOne.handLength = state.playerTwo.hand.length;
        state.playerOne.deckLength = state.playerTwo.deck.length;

        state.playerOne.ethAddress = '';
        state.playerOne.user = {};
        state.playerOne.hand = [];
        state.playerOne.deck = [];

        //TODO Re-enable after testing
        // state.playerTwo.deckLength = this.game.playerTwo.deck.length;
        // state.playerTwo.deck = [];
      }

      state.playerNumber = playerNumber;

      if(state) {
        resolve(state);
      }
      else {
        resolve(false);
      }

    });

  }
  async pushState() {
    //Push state to both of the players
    let playerOneState = await this.getState(1);
    let playerTwoState = await this.getState(2);

    if (this.userOne.socket) {
      this.userOne.socket.emit('server-update-state', playerOneState);
    }
    if (this.userTwo.socket) {
      this.userTwo.socket.emit('server-update-state', playerTwoState);
    }
  }
}



async function startMatchmaking(io) {
  //instantiate the matchmaking service and create the matchmaking object

  //**************
  //Connection for local testing
  //CAN REMOVE THIS WHEN RUNNING PRODUCTION AS APP.JS WILL HANDLE SETTING THIS UP
  // await mongoose.connect('mongodb://localhost/merkle-bros-2'); 
  // var db = mongoose.connection;
  // db.on('error', console.error.bind(console, 'Database connection error:'));
  //***************

  let protoQuery = CardPrototype.find(
    {},
    {'createdAt': 0, 'updatedAt': 0}
  );
  let actionQuery = Action.find(
    {}, {'createdAt': 0, 'updatedAt': 0}
  );
  let prototypes = await protoQuery.lean().exec();
  let actions = await actionQuery.lean().exec();

  //build key/value actions object mapping
  actionsObject = {};
  for(let i = 0; i < actions.length; i++) {
    actionsObject[actions[i]._id] = actions[i];
  }

  //build key/value cardPrototype object mapping
  prototypeObject = {};
  for(let i = 0; i < prototypes.length; i++) {
    prototypeObject[prototypes[i]._id] = prototypes[i];
  }

  var matchmaking = new Matchmaking({ prototypes: prototypeObject, actions: actionsObject, io: io, cardPrototypesLength: prototypes.length, actionsLength: actions.length});

  return matchmaking;
}

module.exports = {
  game: Game,
  player: Player,
  fighter: Fighter,
  matchmaking: Matchmaking,
  startMatchmaking: startMatchmaking,
  gameLoop: GameLoop
}