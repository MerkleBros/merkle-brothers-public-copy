const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');

const mongoose = require('mongoose');
const CardPrototype = require('../models/CardPrototype');
const Action = require('../models/Action');
const User = require('../models/User');
const merkleUtils = require('../modules/merkle-utilities.js');
const uuidv1 = require('uuid/v1');

const GameUtils = require('../modules/game-utilities.js');
const Game = GameUtils.game;
const Player = GameUtils.player;
const Fighter = GameUtils.fighter;
const Matchmaking = GameUtils.matchmaking;
const startMatchmaking = GameUtils.startMatchmaking;
const GameLoop = GameUtils.gameLoop;

var cardPrototype122;
var cardPrototype118;
var cardPrototype175;
var userOne;
var userTwo;
var globalActions;
var globalPrototypes;
var cardPrototypesLength;
var actionsLength;
var validActionTargets = {};

var httpServer;
var httpServerAddr;
var ioServer;

jest.setTimeout(30000);
jest.useFakeTimers();

beforeAll(async () => {

	await mongoose.connect('mongodb://localhost/merkle-bros-2?poolSize=50'); 


	let query = CardPrototype.find(
		{_id: 122}, {'createdAt': 0, 'updatedAt': 0}
		);
	let queryTwo = CardPrototype.find(
		{_id: 118}, {'createdAt': 0, 'updatedAt': 0}
	);
	let queryThree = CardPrototype.find(
		{_id: 175}, {'createdAt': 0, 'updatedAt': 0}
	);


	let tempArray = await query.lean().exec();
	let tempArrayTwo = await queryTwo.lean().exec();
	let tempArrayThree = await queryThree.lean().exec();
	
	cardPrototype122 = tempArray[0];
	cardPrototype118 = tempArrayTwo[0];
	cardPrototype175 = tempArrayThree[0];

	let protoQuery = CardPrototype.find(
		{}, {'createdAt': 0, 'updatedAt': 0}
	);
	let actionQuery = Action.find(
		{}, {'createdAt': 0, 'updatedAt': 0}
	);

	let prototypes = await protoQuery.lean().exec();
	let actions = await actionQuery.lean().exec();

	//build key/value actions object mapping
	let actionsObject = {};
	for(let i = 0; i < actions.length; i++) {
		actionsObject[actions[i]._id] = actions[i];
	}

	globalActions = actionsObject;
	actionsLength = actions.length;

	//build key/value cardPrototype object mapping
	let prototypeObject = {};
	for(let i = 0; i < prototypes.length; i++) {
		prototypeObject[prototypes[i]._id] = prototypes[i];
	}

	globalPrototypes = prototypeObject;
	cardPrototypesLength = prototypes.length;

	userOne = {
	  _id: 0,
	  name: "Person",
	  email: "person@person.com",
	  ethAddress: "0x1234",
	  mailingAddress: "personville",
	  sendPromoEmail: false,
	  decks: [{
      deckName: 'deckOne', 
      deckCards: [{id: 4}, {id: 4}, {id: 4}, {id: 4}, {id: 5}, {id: 5}, {id: 5}, 
	      {id: 5}, {id: 6}, {id: 6}, {id: 6}, {id: 6}, {id: 7}, {id: 7}, {id: 7}, 
	      {id: 7}, {id: 8}, {id: 8}, {id: 8}, {id: 8}, {id: 9}, {id: 9}, {id: 9}, 
	      {id: 9}, {id: 10}, {id: 10}, {id: 10}, {id: 10}, {id: 11}, {id: 11}, {id: 11}, {id: 11}]
	  }],
	  selectedDeck: 'deckOne',
	  userName: 'person',
	  gameId: '',
	  playerNumber: 1,
	  socketId: 12345,
	  socket: false,
	  token: '12345'
	};
	userTwo = {
	  _id: 1,
	  name: "PersonTwo",
	  email: "person@person.com",
	  ethAddress: "0x5678",
	  mailingAddress: "personville",
	  sendPromoEmail: false,
	  decks: [{
      deckName: 'deckOne', 
      deckCards: [{id: 4}, {id: 4}, {id: 4}, {id: 4}, {id: 5}, {id: 5}, {id: 5}, 
	      {id: 5}, {id: 6}, {id: 6}, {id: 6}, {id: 6}, {id: 7}, {id: 7}, {id: 7}, 
	      {id: 7}, {id: 8}, {id: 8}, {id: 8}, {id: 8}, {id: 9}, {id: 9}, {id: 9}, 
	      {id: 9}, {id: 10}, {id: 10}, {id: 10}, {id: 10}, {id: 11}, {id: 11}, {id: 11}, {id: 11}]
      }],
	  selectedDeck: 'deckOne',
	  userName: 'personTwo',
	  gameId: '',
	  playerNumber: 2,
	  socketId: 678910,
	  socket: false,
	  token: '12345'
	};

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


	httpServer = http.createServer().listen();
	httpServerAddr = httpServer.address();
	ioServer = ioBack(httpServer);
});

afterAll(async(done) => {
	if(ioServer) {
		ioServer.close();
	}
	httpServer.close();
	mongoose.disconnect(done);
});

describe('Fighter class', () => {
	
	test('expect fighter attributes to have been correctly instantiated', () => {
		let fighter = new Fighter(cardPrototype122, 2);

		expect(fighter).toBeTruthy();

		expect(fighter.id).toBe(999);
		expect(fighter.cardPrototype).toMatchObject(cardPrototype122);
		expect(fighter.cardPrototypeId).toBe(122);
		expect(fighter.health).toBe(cardPrototype122.healthValue);
		expect(fighter.attack).toBe(cardPrototype122.attackValue);
		expect(fighter.commanded).toBeTruthy();
		expect(fighter.moved).toBeTruthy();
		expect(fighter.lane).toBe(2);
		expect(fighter.specials).toMatchObject({});
		expect(fighter.condition).toMatch(/none/);
		expect(fighter.specialConditions).toMatchObject([]);
		expect(fighter.deployed).toBeFalsy();
	});
	test('expect fighter specials to be assigned correctly', () => {
		let fighterTwo = new Fighter(cardPrototype118, 0);
		let fighterThree = new Fighter(cardPrototype175, 1);

		let obj = {};
		let keyOne = cardPrototype118['actionOne'];
		let valueOne = cardPrototype118['actionOneValue'];
		let nestObj = {timesUsed: 0};
		nestObj.value = valueOne;
		obj[keyOne] = nestObj;

		let obj2 = {};
		let keyTwo = cardPrototype175['actionOne'];
		let valueTwo = cardPrototype175['actionOneValue'];
		let nestObj2 = {timesUsed: 0};
		nestObj2.value = valueTwo;
		obj2[keyTwo] = nestObj2;
		expect(fighterTwo.specials).toMatchObject(obj);
		expect(fighterThree.specials).toMatchObject(obj2);
	});
});
describe('Player class', () => {
	
	test('expect player attributes to have been correctly instantiated', () => {

		let player = new Player(userOne);

		expect(player).toBeTruthy();
	    expect(player.ethAddress).toMatch(/0x1234/);
	    expect(player.health).toBe(30);
	    expect(player.maxHealth).toBe(30);
	    expect(player.dev).toBe(0);
	    expect(player.devHits).toBe(0);
	    expect(player.maxDev).toBe(0);
	    expect(player.hand).toMatchObject([]);
	    expect(player.deployed).toMatchObject([]);
	    expect(player.deck).toMatchObject([]);
	    expect(player.discard).toMatchObject([]);
	    expect(player.active).toBeFalsy();
	    expect(player.deployCount).toBe(0);
	    expect(player.number).toBe(userOne.playerNumber);
	    expect(player.reactEvents).toMatchObject([]);
	    expect(player.commanded).toBeFalsy();
	    expect(player.canAttack).toBeFalsy();
	    expect(player.freePlay).toBe(0);
	    expect(player.freeDeploy).toBe(0);
	});
	test('expect Player.deployFighter to add fighter to deployed array and update deployCount', () => {
		
		let player = new Player(userOne);

		let fighterTwo = new Fighter(cardPrototype118, 0);
		let fighterThree = new Fighter(cardPrototype175, 1);

		fighterTwo.id = 1;
		fighterTwo.condition = 'deploying';
		fighterTwo.deployed = true;

		fighterThree.id = 2;
		fighterThree.condition = 'deploying';
		fighterThree.deployed = true;

		player.deployFighter(cardPrototype118, 0);

		expect(player.deployed.length).toBe(1);
		expect(player.deployCount).toBe(1);
		expect(player.deployed[0]).toMatchObject(fighterTwo);
		expect(player.deployed[0].specials).toMatchObject(fighterTwo.specials);

		player.deployFighter(cardPrototype175, 1);

		expect(player.deployed.length).toBe(2);
		expect(player.deployCount).toBe(2);
		expect(player.deployed[1]).toMatchObject(fighterThree);
		expect(player.deployed[1].specials).toMatchObject(fighterThree.specials);
		
	});
});

describe('Game', () => {
	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game;

	beforeEach(() => {
		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));
		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);
		newId = uuidv1();
		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});
	});

	test('expect game attributes to have been correctly instantiated', () => {
		// let playerOne = new Player(userOne);
		// let playerTwo = new Player(userTwo);
		// let newId = uuidv1();
		// let game = new Game({
		// 	id: newId, playerOne: playerOne, playerTwo: playerTwo, 
		// 	actions: globalActions, prototypes: globalPrototypes, 
		// 	actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		// });

		expect(game.id).toMatch(newId);
		expect(game.status).toMatch('starting');
		expect(game.playerOne).toMatchObject(playerOne);
		expect(game.playerTwo).toMatchObject(playerTwo);
		expect(game.turn).toBe(0);
		expect(game.activePlayer).toBe(0);
		expect(game.turnTimeLimit).toBe(32000);
		expect(game.cardActions).toMatchObject(globalActions);
		expect(game.actionsLength).toBe(actionsLength);
		expect(game.cardPrototypes).toMatchObject(globalPrototypes);
		expect(game.cardPrototypesLength).toBe(cardPrototypesLength);
		expect(game.history).toMatchObject([]);
		expect(game.winnerNumber).toBe(0);
	});
	test('expect Game.getPlayer and Game.getOtherPlayer to retrieve correct player', () => {
		// let playerOne = new Player(userOne);
		// let playerTwo = new Player(userTwo);
		// let newId = uuidv1();
		// let game = new Game({
		// 	id: newId, playerOne: playerOne, playerTwo: playerTwo, 
		// 	actions: globalActions, prototypes: globalPrototypes, 
		// 	actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		// });
		expect(game.getPlayer(1)).toMatchObject(playerOne);
		expect(game.getPlayer(2)).toMatchObject(playerTwo);
		expect(game.getOtherPlayer(1)).toMatchObject(playerTwo);
		expect(game.getOtherPlayer(2)).toMatchObject(playerOne);

	});
});
/*******************************************************************************************/
/*******************************************************************************************/
/******GAMELOOP*****************************************************************************/
/*******************************************************************************************/
/*******************************************************************************************/

describe("GameLoop", () => {
	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game, matchmaking;
		
	beforeEach(() => {

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		newId = uuidv1();

		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		matchmaking = {};
	});
	test("expect GameLoop properties to be correctly instantiated", () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		
		expect(gl).toBeTruthy();
		expect(gl.validActionTargets).toMatchObject(validActionTargets);
		expect(gl.id).toBe(game.id);
		expect(gl.game).toMatchObject(game);
		expect(gl.stack).toMatchObject([]);
		expect(gl.processingInterval).toBeDefined();
		expect(gl.processing).not.toBeDefined();
		expect(gl.processingCounter).toBe(0);
		expect(gl.matchmaking).toMatchObject(matchmaking);

		gl.checkProcessing = jest.fn();

		expect(gl.checkProcessing).not.toBeCalled();

		//Testing processingInterval
		jest.advanceTimersByTime(305);

		expect(gl.checkProcessing).toBeCalled();
	});
	test("expect GameLoop.initGame() to start game on creation of GameLoop", () => {

		let deckCopy = [];
		let deckCopyTwo = [];

		for (let i = 0; i < userOneCopy.deck.length; i++) {
			deckCopy[i] = userOneCopy.deck[i];
		}
		for (let i = 0; i < userTwoCopy.deck.length; i++) {
			deckCopyTwo[i] = userTwoCopy.deck[i];
		}

		let playerOne = new Player(userOneCopy);
		let playerTwo = new Player(userTwoCopy);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		let newId = uuidv1();

		let game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		expect(game.playerOne.deck).toMatchObject(deckCopy);
		expect(game.playerTwo.deck).toMatchObject(deckCopyTwo);
		expect(game.playerOne.deck.length).toBe(32);
		expect(game.playerTwo.deck.length).toBe(32);

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		
		expect(gl).toBeTruthy();
		expect(gl.validActionTargets).toMatchObject(validActionTargets);
		expect(gl.id).toBe(game.id);
		expect(gl.game).toMatchObject(game);
		expect(game.playerOne.active).toBeTruthy();
		expect(game.playerTwo.active).toBeFalsy();
		expect(game.activePlayer).toBe(1);
		expect(game.status).toMatch("playing");

		//Test shuffling

		expect(game.history).toBeTruthy();
		expect(game.history[0]).toMatchObject({
			playerNumber: 1, playerAction: "startGame", 
			turnNumber: 0
		});
		expect(game.turn).toBe(1);
		expect(game.playerOne.maxDev).toBe(1);
		expect(game.playerOne.dev).toBe(1);
		expect(game.playerTwo.maxDev).toBe(0);
		expect(game.playerTwo.dev).toBe(0);

		expect(game.playerOne.deck).not.toMatchObject(deckCopy);
		expect(game.playerTwo.deck).not.toMatchObject(deckCopyTwo);
		expect(game.playerOne.deck.length).toBe(29);
		expect(game.playerTwo.deck.length).toBe(29);
	});
	test('GameLoop.draw should draw from a collection', () => {

		expect(game.playerOne.deck.length).toBe(32);

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(game.playerOne.deck.length).toBe(29);

		let firstCard = game.playerOne.deck[0];
		let deck = game.playerOne.deck;
		let card = gl.draw({collection: deck});

		expect(card).toMatchObject(firstCard);
		expect(deck.length).toBe(28);

		let anotherCard = game.playerOne.deck[5];
		let cardTwo = gl.draw({collection: deck, matchId: anotherCard.id});

		expect(cardTwo).toMatchObject(anotherCard);
		expect(deck.length).toBe(27);

		let cardThree = gl.draw({collection: deck, random: true});
		expect(cardThree).toBeTruthy();
		expect(deck.length).toBe(26);

		let obj = gl.draw({collection: {}});
		expect(obj).toBe(false);
		let empty = gl.draw({collection: []});
		expect(empty).toBe(false);
		let noCollection = gl.draw({random: true});
		expect(noCollection).toBe(false);
	});
	test('GameLoop.drawToHand should draw from a collection to a hand', () => {

		//Also test pushing to history object

		expect(game.playerOne.deck.length).toBe(32);
		expect(playerOne.hand.length).toBe(0);

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(game.playerOne.deck.length).toBe(29);
		expect(playerOne.hand.length).toBe(3);

		let firstCard = game.playerOne.deck[0];
		let deck = game.playerOne.deck;
		gl.drawToHand({collection: deck, playerNumber: 1});

		expect(deck.length).toBe(28);
		expect(playerOne.hand.length).toBe(4);
		expect(playerOne.hand[playerOne.hand.length - 1]).toMatchObject(firstCard);

		let anotherCard = game.playerOne.deck[5];

		gl.drawToHand({
			collection: deck,
			matchId: anotherCard.id,
			playerNumber: 1
		});

		expect(deck.length).toBe(27);
		expect(playerOne.hand.length).toBe(5);
		expect(playerOne.hand[playerOne.hand.length - 1]).toMatchObject(anotherCard);

		gl.drawToHand({collection: deck, random: true, playerNumber: 1});
		expect(deck.length).toBe(26);
		expect(playerOne.hand.length).toBe(6);

		let result = gl.drawToHand({random: true});
		expect(result).toBe(false);
		expect(deck.length).toBe(26);
	});
	test('GameLoop.drawToDiscard should draw from a collection to a discard', () => {

		//Also test pushing to history object

		expect(game.playerOne.deck.length).toBe(32);
		expect(playerOne.hand.length).toBe(0);

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(game.playerOne.deck.length).toBe(29);
		expect(playerOne.hand.length).toBe(3);
		expect(playerOne.discard.length).toBe(0);

		let firstCard = game.playerOne.deck[0];
		let deck = game.playerOne.deck;
		gl.drawToDiscard({collection: deck, playerNumber: 1});

		expect(deck.length).toBe(28);
		expect(playerOne.hand.length).toBe(3);
		expect(playerOne.discard.length).toBe(1);
		expect(playerOne.discard[0]).toMatchObject(firstCard);

		let anotherCard = game.playerOne.deck[5];

		gl.drawToDiscard({
			collection: deck,
			matchId: anotherCard.id,
			playerNumber: 2
		});

		expect(deck.length).toBe(27);
		// expect(playerOne.hand.length).toBe(5);
		expect(playerTwo.discard[playerTwo.discard.length - 1]).toMatchObject(anotherCard);

		gl.drawToDiscard({collection: deck, random: true, playerNumber: 1});
		expect(deck.length).toBe(26);
		expect(playerOne.discard.length).toBe(2);

		let result = gl.drawToDiscard({random: true, collection: deck});
		expect(result).toBe(false);

		let handCard = playerOne.hand[0];

		gl.drawToDiscard({
			playerNumber: 2, 
			collection: playerOne.hand, 
			matchId: handCard.id
		});

		expect(playerTwo.discard.length).toBe(2);
		expect(playerTwo.discard[1]).toMatchObject(handCard);
		expect(playerOne.hand.length).toBe(2);

	});
	test('GameLoop.shuffle should shuffle a collection', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let copyDeck = JSON.parse(JSON.stringify(playerOne.deck));
		expect(playerOne.deck.length).toBe(29);
		expect(copyDeck).toMatchObject(playerOne.deck);

		gl.shuffle(playerOne.deck);
		expect(playerOne.deck).not.toMatchObject(copyDeck);
		expect(playerOne.deck.length).toBe(29);

		let copyDeckTwo = JSON.parse(JSON.stringify(playerOne.deck));
		gl.shuffle(playerOne.deck);
		expect(playerOne.deck).not.toMatchObject(copyDeckTwo);
		expect(playerOne.deck.length).toBe(29);

	});
	test('GameLoop.view should return a card from a collection without modifying collection', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let copyDeck = JSON.parse(JSON.stringify(playerTwo.deck));

		expect(playerTwo.deck.length).toBe(29);

		let cardOne = gl.view({collection: playerTwo.deck});
		expect(playerTwo.deck.length).toBe(29);
		expect(playerTwo.deck).toMatchObject(copyDeck);
		expect(cardOne).toMatchObject(playerTwo.deck[0]);

		let cardTwo = gl.view({collection: playerTwo.deck, index: 3});
		expect(playerTwo.deck.length).toBe(29);
		expect(playerTwo.deck).toMatchObject(copyDeck);
		expect(cardTwo).toMatchObject(playerTwo.deck[3]);

		let cardThree = gl.view({collection: playerTwo.deck, random: true});
		expect(playerTwo.deck.length).toBe(29);
		expect(playerTwo.deck).toMatchObject(copyDeck);
		expect(playerTwo.deck).toContain(cardThree);

		let falsey = gl.view({collection: {key: 1}});
		let falseyTwo = gl.view({collection: [], random: true});
		let falseyThree = gl.view({collection: playerOne.hand, index: 9999});
		let falseyFour = gl.view({collection: playerOne.hand, index: 'a'});
		expect(falsey).toBeFalsy();
		expect(falseyTwo).toBeFalsy();
		expect(falseyThree).toBeFalsy();
		expect(falseyFour).toBeFalsy();

	});
	test('GameLoop.setActivePlayer should update player.active and game.activePlayer', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let playerOneCopy = JSON.parse(JSON.stringify(game.playerOne));
		let playerTwoCopy = JSON.parse(JSON.stringify(game.playerTwo));

		expect(playerOneCopy).toMatchObject(game.playerOne);
		expect(playerTwoCopy).toMatchObject(game.playerTwo);

		expect(game.activePlayer).toBe(1);
		expect(game.playerOne.active).toBeTruthy();
		expect(game.playerTwo.active).toBeFalsy();

		gl.setActivePlayer(playerTwo);

		playerOneCopy.active = false;
		playerTwoCopy.active = true;

		expect(playerOne).toMatchObject(playerOneCopy);
		expect(playerTwo).toMatchObject(playerTwoCopy);
		expect(game.activePlayer).toBe(2);

	});
	test('GameLoop.incrementDev, incrementMaxDev should increment respectively', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let playerOneCopy = JSON.parse(JSON.stringify(game.playerOne));
		let playerTwoCopy = JSON.parse(JSON.stringify(game.playerTwo));

		expect(playerOneCopy).toMatchObject(game.playerOne);
		expect(playerTwoCopy).toMatchObject(game.playerTwo);


		expect(playerOne.dev).toBe(1);

		gl.incrementDev({playerNumber: 1});

		playerOneCopy.dev = 2;
		expect(playerOne.dev).toBe(2);
		expect(playerOne).toMatchObject(playerOneCopy)


		expect(playerTwo.dev).toBe(0);

		gl.incrementDev({playerNumber: 2});

		playerTwoCopy.dev = 1;
		expect(playerTwo.dev).toBe(1);
		expect(playerTwo).toMatchObject(playerTwoCopy);



		expect(playerOne.maxDev).toBe(1);

		gl.incrementMaxDev({playerNumber: 1});

		playerOneCopy.maxDev = 2;
		expect(playerOne.maxDev).toBe(2);
		expect(playerOne).toMatchObject(playerOneCopy);



		gl.incrementDev({playerNumber: 3});
		gl.incrementMaxDev({playerNumber: 3});

		expect(playerOne.dev).toBe(2);
		expect(playerOne.maxDev).toBe(2);
		expect(playerTwo.dev).toBe(1);
		expect(playerTwo.maxDev).toBe(0);

	});
	test('GameLoop.hitDev, damageDev, damageMaxDev should decrement player dev values', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let playerOneCopy = JSON.parse(JSON.stringify(game.playerOne));
		let playerTwoCopy = JSON.parse(JSON.stringify(game.playerTwo));

		expect(playerOneCopy).toMatchObject(game.playerOne);
		expect(playerTwoCopy).toMatchObject(game.playerTwo);


		expect(playerOne.devHits).toBe(0);
		expect(playerOne.dev).toBe(1);
		expect(playerOne.maxDev).toBe(1);


		gl.hitDev(1, playerOne);
		playerOneCopy.devHits++;

		expect(playerOne.dev).toBe(1);
		expect(playerOne.devHits).toBe(1);
		expect(playerOne.maxDev).toBe(1);
		expect(playerOne).toMatchObject(playerOneCopy);

		gl.hitDev(1, playerOne);
		playerOneCopy.devHits--;
		playerOneCopy.maxDev--;

		expect(playerOne.dev).toBe(1);
		expect(playerOne.devHits).toBe(0);
		expect(playerOne.maxDev).toBe(0);
		expect(playerOne).toMatchObject(playerOneCopy);

		gl.incrementMaxDev({playerNumber: 1});
		gl.incrementMaxDev({playerNumber: 1});
		playerOneCopy.maxDev++;
		playerOneCopy.maxDev++;

		expect(playerOne.maxDev).toBe(2);

		gl.hitDev(1, playerOne);
		playerOneCopy.devHits++;

		expect(playerOne.dev).toBe(1);
		expect(playerOne.devHits).toBe(1);
		expect(playerOne.maxDev).toBe(2);
		expect(playerOne).toMatchObject(playerOneCopy);

		gl.hitDev(3, playerOne);
		playerOneCopy.devHits--;
		playerOneCopy.maxDev--;
		playerOneCopy.maxDev--;

		expect(playerOne.dev).toBe(1);
		expect(playerOne.devHits).toBe(0);
		expect(playerOne.maxDev).toBe(0);
		expect(playerOne).toMatchObject(playerOneCopy);

		gl.damageDev(1, playerOne);
		playerOneCopy.dev--;

		expect(playerOne.dev).toBe(0);
		expect(playerOne.devHits).toBe(0);
		expect(playerOne.maxDev).toBe(0);
		expect(playerOne).toMatchObject(playerOneCopy);

		gl.hitDev(2, playerOne);

		expect(playerOne.dev).toBe(0);
		expect(playerOne.devHits).toBe(0);
		expect(playerOne.maxDev).toBe(0);
		expect(playerOne).toMatchObject(playerOneCopy);

		gl.damageDev(2, playerOne);
		gl.damageMaxDev(2, playerOne);

		expect(playerOne.dev).toBe(0);
		expect(playerOne.devHits).toBe(0);
		expect(playerOne.maxDev).toBe(0);
		expect(playerOne).toMatchObject(playerOneCopy);

	});
	test('GameLoop.incrementTurn should increment turn', () => {

		expect(game.turn).toBe(0);

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(game.turn).toBe(1);

		gl.incrementTurn();

		expect(game.turn).toBe(2);

		gl.incrementTurn();

		expect(game.turn).toBe(3);

	});
	test('GameLoop.hitDeck should remove deck cards from the game', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		let playerOneDeckCopy = JSON.parse(JSON.stringify(playerOne.deck));

		expect(playerOne.deck.length).toBe(29);
		expect(playerOne.deck).toMatchObject(playerOneDeckCopy);

		gl.hitDeck(4, playerOne);
		playerOneDeckCopy.shift();
		playerOneDeckCopy.shift();
		playerOneDeckCopy.shift();
		playerOneDeckCopy.shift();

		expect(playerOne.deck.length).toBe(25);
		expect(playerOne.deck).toMatchObject(playerOneDeckCopy);

		gl.hitDeck(24, playerOne);

		expect(playerOne.deck.length).toBe(1);

		gl.hitDeck(1, playerOne);

		expect(playerOne.deck.length).toBe(0);

		gl.hitDeck(7, playerOne);

		expect(playerOne.deck.length).toBe(0);
	});
	test('GameLoop.clearDead should remove dead fighters from player.deployed for playerOne', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		playerOne.deployFighter(cardPrototype122, 0);
		playerOne.deployFighter(cardPrototype118, 1);
		playerOne.deployFighter(cardPrototype175, 2);
		playerOne.deployFighter(cardPrototype175, 0);
		playerOne.deployFighter(cardPrototype122, 1);

		let playerOneDeployedCopy = [];

		let fighterOne = new Fighter(cardPrototype122, 0);
		fighterOne.id = 1;
		fighterOne.condition = 'deploying';
		fighterOne.deployed = true;

		let fighterTwo = new Fighter(cardPrototype118, 1);
		fighterTwo.id = 2;
		fighterTwo.condition = 'deploying';
		fighterTwo.deployed = true;

		let fighterThree = new Fighter(cardPrototype175, 2);
		fighterThree.id = 3;
		fighterThree.condition = 'deploying';
		fighterThree.deployed = true;

		let fighterFour = new Fighter(cardPrototype175, 0);
		fighterFour.id = 4;
		fighterFour.condition = 'deploying';
		fighterFour.deployed = true;

		let fighterFive = new Fighter(cardPrototype122, 1);
		fighterFive.id = 5;
		fighterFive.condition = 'deploying';
		fighterFive.deployed = true;

		playerOneDeployedCopy.push(fighterOne);
		playerOneDeployedCopy.push(fighterTwo);
		playerOneDeployedCopy.push(fighterThree);
		playerOneDeployedCopy.push(fighterFour);
		playerOneDeployedCopy.push(fighterFive);

		expect(playerOne.deployed.length).toBe(5);
		expect(playerOne.deployed).toMatchObject(playerOneDeployedCopy);
		expect(playerOne.deployed[0]).toMatchObject(fighterOne);
		expect(playerOne.deployed[1]).toMatchObject(fighterTwo);
		expect(playerOne.deployed[2]).toMatchObject(fighterThree);
		expect(playerOne.deployed[3]).toMatchObject(fighterFour);
		expect(playerOne.deployed[4]).toMatchObject(fighterFive);

		playerOne.deployed[0].health = 0;

		gl.clearDead();
		playerOneDeployedCopy.shift();

		expect(playerOne.deployed.length).toBe(4);
		expect(playerOne.deployed).toMatchObject(playerOneDeployedCopy);
		expect(playerOne.deployed[0]).toMatchObject(fighterTwo);
		expect(playerOne.deployed[1]).toMatchObject(fighterThree);
		expect(playerOne.deployed[2]).toMatchObject(fighterFour);
		expect(playerOne.deployed[3]).toMatchObject(fighterFive);

		playerOne.deployed[2].health = 0;
		playerOne.deployed[0].health = 0;

		gl.clearDead();
		playerOneDeployedCopy.splice(2, 1);
		playerOneDeployedCopy.shift();

		expect(playerOne.deployed.length).toBe(2);
		expect(playerOne.deployed).toMatchObject(playerOneDeployedCopy);
		expect(playerOne.deployed[0]).toMatchObject(fighterThree);
		expect(playerOne.deployed[1]).toMatchObject(fighterFive);

		playerOne.deployed[1].health = 0;

		gl.clearDead();
		playerOneDeployedCopy.splice(1, 1);

		expect(playerOne.deployed.length).toBe(1);
		expect(playerOne.deployed).toMatchObject(playerOneDeployedCopy);
		expect(playerOne.deployed[0]).toMatchObject(fighterThree);

		playerOne.deployed[0].health = 0;

		gl.clearDead();
		expect(playerOne.deployed.length).toBe(0);

		gl.clearDead();
		expect(playerOne.deployed.length).toBe(0);

	});
	test('GameLoop.clearDead should remove dead fighters from player.deployed for playerTwo', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		playerTwo.deployFighter(cardPrototype122, 0);
		playerTwo.deployFighter(cardPrototype118, 1);
		playerTwo.deployFighter(cardPrototype175, 2);
		playerTwo.deployFighter(cardPrototype175, 0);
		playerTwo.deployFighter(cardPrototype122, 1);

		let playerTwoDeployedCopy = [];

		let fighterOne = new Fighter(cardPrototype122, 0);
		fighterOne.id = 1;
		fighterOne.condition = 'deploying';
		fighterOne.deployed = true;

		let fighterTwo = new Fighter(cardPrototype118, 1);
		fighterTwo.id = 2;
		fighterTwo.condition = 'deploying';
		fighterTwo.deployed = true;

		let fighterThree = new Fighter(cardPrototype175, 2);
		fighterThree.id = 3;
		fighterThree.condition = 'deploying';
		fighterThree.deployed = true;

		let fighterFour = new Fighter(cardPrototype175, 0);
		fighterFour.id = 4;
		fighterFour.condition = 'deploying';
		fighterFour.deployed = true;

		let fighterFive = new Fighter(cardPrototype122, 1);
		fighterFive.id = 5;
		fighterFive.condition = 'deploying';
		fighterFive.deployed = true;

		playerTwoDeployedCopy.push(fighterOne);
		playerTwoDeployedCopy.push(fighterTwo);
		playerTwoDeployedCopy.push(fighterThree);
		playerTwoDeployedCopy.push(fighterFour);
		playerTwoDeployedCopy.push(fighterFive);

		expect(playerTwo.deployed.length).toBe(5);
		expect(playerTwo.deployed).toMatchObject(playerTwoDeployedCopy);
		expect(playerTwo.deployed[0]).toMatchObject(fighterOne);
		expect(playerTwo.deployed[1]).toMatchObject(fighterTwo);
		expect(playerTwo.deployed[2]).toMatchObject(fighterThree);
		expect(playerTwo.deployed[3]).toMatchObject(fighterFour);
		expect(playerTwo.deployed[4]).toMatchObject(fighterFive);

		playerTwo.deployed[0].health = 0;

		gl.clearDead();
		playerTwoDeployedCopy.shift();

		expect(playerTwo.deployed.length).toBe(4);
		expect(playerTwo.deployed).toMatchObject(playerTwoDeployedCopy);
		expect(playerTwo.deployed[0]).toMatchObject(fighterTwo);
		expect(playerTwo.deployed[1]).toMatchObject(fighterThree);
		expect(playerTwo.deployed[2]).toMatchObject(fighterFour);
		expect(playerTwo.deployed[3]).toMatchObject(fighterFive);

		playerTwo.deployed[2].health = 0;
		playerTwo.deployed[0].health = 0;

		gl.clearDead();
		playerTwoDeployedCopy.splice(2, 1);
		playerTwoDeployedCopy.shift();

		expect(playerTwo.deployed.length).toBe(2);
		expect(playerTwo.deployed).toMatchObject(playerTwoDeployedCopy);
		expect(playerTwo.deployed[0]).toMatchObject(fighterThree);
		expect(playerTwo.deployed[1]).toMatchObject(fighterFive);

		playerTwo.deployed[1].health = 0;

		gl.clearDead();
		playerTwoDeployedCopy.splice(1, 1);

		expect(playerTwo.deployed.length).toBe(1);
		expect(playerTwo.deployed).toMatchObject(playerTwoDeployedCopy);
		expect(playerTwo.deployed[0]).toMatchObject(fighterThree);

		playerTwo.deployed[0].health = 0;

		gl.clearDead();
		expect(playerTwo.deployed.length).toBe(0);

		gl.clearDead();
		expect(playerTwo.deployed.length).toBe(0);

	});
	test('GameLoop.resetFighterStates should reset moved/commanded states to false', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		playerOne.deployFighter(cardPrototype122, 0);
		playerOne.deployFighter(cardPrototype118, 1);
		playerOne.deployFighter(cardPrototype175, 2);

		playerTwo.deployFighter(cardPrototype122, 0);
		playerTwo.deployFighter(cardPrototype118, 1);

		let playerOneDeployedCopy = [];
		let playerTwoDeployedCopy = [];

		let fighterOne = new Fighter(cardPrototype122, 0);
		fighterOne.id = 1;
		fighterOne.condition = 'deploying';
		fighterOne.deployed = true;

		let fighterTwo = new Fighter(cardPrototype118, 1);
		fighterTwo.id = 2;
		fighterTwo.condition = 'deploying';
		fighterTwo.deployed = true;

		let fighterThree = new Fighter(cardPrototype175, 2);
		fighterThree.id = 3;
		fighterThree.condition = 'deploying';
		fighterThree.deployed = true;

		playerOneDeployedCopy.push(fighterOne);
		playerOneDeployedCopy.push(fighterTwo);
		playerOneDeployedCopy.push(fighterThree);

		playerTwoDeployedCopy.push(fighterOne);
		playerTwoDeployedCopy.push(fighterTwo);

		expect(playerOne.deployed.length).toBe(3);
		expect(playerOne.deployed).toMatchObject(playerOneDeployedCopy);
		expect(playerOne.deployed[0]).toMatchObject(fighterOne);
		expect(playerOne.deployed[1]).toMatchObject(fighterTwo);
		expect(playerOne.deployed[2]).toMatchObject(fighterThree);

		expect(playerOne.deployed[0].moved).toBeTruthy();
		expect(playerOne.deployed[1].commanded).toBeTruthy();
		expect(playerOne.deployed[2].moved).toBeTruthy();
		expect(playerOne.deployed[2].commanded).toBeTruthy();

		expect(playerTwo.deployed[0].moved).toBeTruthy();
		expect(playerTwo.deployed[0].commanded).toBeTruthy();

		gl.resetFighterStates();
		playerOneDeployedCopy[0].moved = false;
		playerOneDeployedCopy[0].commanded = false;
		playerOneDeployedCopy[1].moved = false;
		playerOneDeployedCopy[1].commanded = false;
		playerOneDeployedCopy[2].moved = false;
		playerOneDeployedCopy[2].commanded = false;

		playerTwoDeployedCopy[0].moved = false;
		playerTwoDeployedCopy[0].commanded = false;
		playerTwoDeployedCopy[1].moved = false;
		playerTwoDeployedCopy[1].commanded = false;

		expect(playerOne.deployed[0].moved).toBeFalsy();
		expect(playerOne.deployed[0].commanded).toBeFalsy();
		expect(playerOne.deployed[1].moved).toBeFalsy();
		expect(playerOne.deployed[1].commanded).toBeFalsy();
		expect(playerOne.deployed[2].moved).toBeFalsy();

		expect(playerOne.deployed).toMatchObject(playerOneDeployedCopy);
		expect(playerOne.deployed[0]).toMatchObject(fighterOne);
		expect(playerOne.deployed[1]).toMatchObject(fighterTwo);
		expect(playerOne.deployed[2]).toMatchObject(fighterThree);

		expect(playerTwo.deployed[0].moved).toBeFalsy();
		expect(playerTwo.deployed[0].commanded).toBeFalsy();
		expect(playerTwo.deployed[1].moved).toBeFalsy();
		expect(playerTwo.deployed[1].commanded).toBeFalsy();

		expect(playerTwo.deployed).toMatchObject(playerTwoDeployedCopy);
		expect(playerTwo.deployed[0]).toMatchObject(fighterOne);
		expect(playerTwo.deployed[1]).toMatchObject(fighterTwo);

		playerOne.deployed = [];
		playerTwo.deployed = [];
		gl.resetFighterStates();
	});
	test('GameLoop.getAdjacentLanes should return adjacent lanes to a fighter', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		playerOne.deployFighter(cardPrototype122, 0);
		playerOne.deployFighter(cardPrototype118, 1);
		playerOne.deployFighter(cardPrototype175, 2);
		playerOne.deployFighter(cardPrototype175, 0);
		playerOne.deployFighter(cardPrototype122, 1);

		expect(playerOne.deployed.length).toBe(5);

		let lanesOne = gl.getAdjacentLanes(playerOne.deployed[0].lane);
		expect(lanesOne).toMatchObject([0,1]);

		let lanesTwo = gl.getAdjacentLanes(playerOne.deployed[1].lane);
		expect(lanesTwo).toMatchObject([1,0,2]);

		let lanesThree = gl.getAdjacentLanes(playerOne.deployed[2].lane);
		expect(lanesThree).toMatchObject([2,1]);

		let lanesFour = gl.getAdjacentLanes(playerOne.deployed[3].lane);
		expect(lanesFour).toMatchObject([0,1]);

		let lanesFive = gl.getAdjacentLanes(playerOne.deployed[4].lane);
		expect(lanesFive).toMatchObject([1,0,2]);

	});
	test('GameLoop.checkGameOver should return bool for whether game is over', () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let one = gl.checkGameOver();
		expect(one).toBeFalsy();

		playerOne.health = 0;

		let two = gl.checkGameOver();
		expect(two).toBeTruthy();

		playerOne.health = 2;

		let three = gl.checkGameOver();
		expect(three).toBeFalsy();

		playerTwo.health = 0;

		let four = gl.checkGameOver();
		expect(four).toBeTruthy();

	});
	test('GameLoop.endGame should set game status to over and resolve true', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		gl.pushState = jest.fn();
		gl.checkProcessing = jest.fn();
		matchmaking.closeMatch = () => {return};
		matchmaking.closeMatch = jest.fn();

		expect(game.winnerNumber).toBe(0);
	
		gl.endGame(1);

		expect(game.status).toMatch(/over/);
		expect(game.winnerNumber).toBe(1);
		expect(gl.pushState).toBeCalled();
		expect(matchmaking.closeMatch).toBeCalled();
		expect(matchmaking.closeMatch.mock.calls[0][0]).toMatch(game.id);

		jest.advanceTimersByTime(400);
		expect(gl.checkProcessing).not.toBeCalled();

	});
	test('GameLoop.startNewTurn should increment turn, maxDev,'
		+ ' dev, and draw a card', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(game.activePlayer).toBe(1);
		expect(game.turn).toBe(1);
		expect(playerOne.maxDev).toBe(1);
		expect(playerOne.dev).toBe(1);
		expect(playerOne.hand.length).toBe(3);

		gl.startNewTurn();

		expect(game.activePlayer).toBe(1);
		expect(game.turn).toBe(2);
		expect(playerOne.maxDev).toBe(2);
		expect(playerOne.dev).toBe(2);
		expect(playerOne.hand.length).toBe(4);
	});
	test('GameLoop.endTurn should switch active player and call startNewTurn()', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(game.activePlayer).toBe(1);
		expect(playerOne.active).toBeTruthy();
		expect(playerTwo.active).toBeFalsy();
		expect(game.turn).toBe(1);
		expect(playerTwo.maxDev).toBe(0);
		expect(playerTwo.dev).toBe(0);
		expect(playerTwo.hand.length).toBe(3);

		gl.endTurn({
			playerNumber: 1,
			turn: 1
		});

		expect(game.activePlayer).toBe(2);
		expect(playerOne.active).toBeFalsy();
		expect(playerTwo.active).toBeTruthy();
		expect(game.turn).toBe(2);
		expect(playerTwo.maxDev).toBe(1);
		expect(playerTwo.dev).toBe(1);
		expect(playerTwo.hand.length).toBe(4);
	});
	test('GameLoop.applySpecialConditions should apply the effects of'
	+ 'special conditions on a fighter.specialConditions', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		playerOne.deployFighter(cardPrototype122, 0);
		let fighter = playerOne.deployed[0];

		expect(fighter.moved).toBeTruthy();
		expect(fighter.commanded).toBeTruthy();

		gl.resetFighterStates();

		//TEST FOR APPLYING PARALYSIS CONDITION 
		//AND CLEARING AFTER 3 TURNS
		let paralysisObj = {condition: 'paralyze', timesUsed: 0, value: 3};
		fighter.specialConditions.push(paralysisObj);

		expect(fighter.specialConditions.length).toBe(1);
		expect(fighter.specialConditions[0]).toMatchObject(paralysisObj);
		expect(fighter.specialConditions[0].timesUsed).toBe(0);
		expect(fighter.specialConditions[0].value).toBe(3);

		expect(fighter.moved).toBeFalsy();
		expect(fighter.commanded).toBeFalsy();

		gl.applySpecialConditions({fighter: fighter});

		expect(fighter.moved).toBeTruthy();
		expect(fighter.commanded).toBeTruthy();
		expect(fighter.specialConditions[0].timesUsed).toBe(1);
		expect(fighter.specialConditions[0].value).toBe(3);

		//Expect resetFighterStates to also call applySpecialConditions()
		gl.resetFighterStates();

		expect(fighter.moved).toBeTruthy();
		expect(fighter.commanded).toBeTruthy();
		expect(fighter.specialConditions[0].timesUsed).toBe(2);
		expect(fighter.specialConditions[0].value).toBe(3);

		gl.resetFighterStates();

		//Conditions object removed after value and timesUsed are equal
		expect(fighter.moved).toBeTruthy();
		expect(fighter.commanded).toBeTruthy();
		expect(fighter.specialConditions).toMatchObject([]);

		gl.applySpecialConditions({fighter: fighter});
	});
	test('GameLoop.checkTurnOver should return that turn is over correctly', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(gl.game.turn).toBe(1);

		let over, overTwo;

		over = gl.checkTurnOver({turn: 1});

		expect(over).toBeFalsy();

		gl.game.turn = 2;

		overTwo = gl.checkTurnOver({turn: 1});

		expect(overTwo).toBeTruthy();

		overTwo = gl.checkTurnOver({turn: 2});

		expect(overTwo).toBeFalsy();
	});
	test('GameLoop.resetTurnTimers should set turnStartTimeUnix close to now', async () => {

		let now = (new Date()).getTime();
		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(gl.game.turnStartTimeUnix).not.toBe(0);
		expect(gl.game.turnStartTimeUnix).toBeGreaterThanOrEqual(now);
		expect(gl.game.turnStartTimeUnix).toBeLessThan(now + 1000);

		let nowTwo = (new Date()).getTime();
		gl.resetTurnTimers();

		expect(gl.game.turnStartTimeUnix).not.toBe(0);
		expect(gl.game.turnStartTimeUnix).toBeGreaterThanOrEqual(nowTwo);
		expect(gl.game.turnStartTimeUnix).toBeLessThan(nowTwo + 1000);

		//setTimeout has not fired yet to end turn automatically
		expect(gl.checkTurnOver({turn: 1})).toBeFalsy();
	});
	test('GameLoop.resetTurnTimers should call autoEndTurn if'
	+ ' >turnTimeLimit has elapsed and game.stack is empty', async () => {

		let now = (new Date()).getTime();

		//Reset turn timers called when gl is created via #init()
		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		expect(gl.game.turnStartTimeUnix).not.toBe(0);
		expect(gl.game.turnStartTimeUnix).toBeGreaterThanOrEqual(now);
		expect(gl.game.turnStartTimeUnix).toBeLessThan(now + 1000);

		expect(gl.checkTurnOver({turn: 1})).toBeFalsy();

		jest.advanceTimersByTime(gl.game.turnTimeLimit - 3000);

		expect(gl.checkTurnOver({turn: 1})).toBeFalsy();
		expect(gl.stack).toMatchObject([]);

		jest.advanceTimersByTime(4000);

		expect(gl.checkTurnOver({turn: 1})).toBeTruthy();
		expect(game.turn).toBe(2);

		jest.advanceTimersByTime(gl.game.turnTimeLimit + 3000);

		expect(gl.checkTurnOver({turn: 2})).toBeTruthy();
		expect(game.turn).toBe(3);

		jest.advanceTimersByTime(gl.game.turnTimeLimit + 3000);

		expect(gl.checkTurnOver({turn: 3})).toBeTruthy();
		expect(game.turn).toBe(4);

		gl.endTurn({turn: gl.game.turn, playerNumber: gl.game.activePlayer});

		expect(gl.checkTurnOver({turn: 4})).toBeTruthy();
		expect(game.turn).toBe(5);

		jest.advanceTimersByTime(gl.game.turnTimeLimit + 3000);

		expect(gl.checkTurnOver({turn: 5})).toBeTruthy();
		expect(game.turn).toBe(6);

	});
	test('GameLoop.resetTurnTimers should not call autoEndTurn if'
	+ ' turn was already ended', async () => {

		let now = (new Date()).getTime();
		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
		let turn = game.turn;

		gl.autoEndTurn = jest.fn();

		expect(game.turn).toBe(1);
		expect(gl.checkTurnOver({turn: 1})).toBeFalsy();

		jest.advanceTimersByTime(gl.game.turnTimeLimit - 3000);

		expect(game.turn).toBe(1);
		expect(gl.checkTurnOver({turn: 1})).toBeFalsy();

		gl.endTurn({turn: turn, playerNumber: game.activePlayer});

		expect(game.turn).toBe(2);

		expect(gl.checkTurnOver({turn: 1})).toBeTruthy();		
		expect(gl.checkTurnOver({turn: 2})).toBeFalsy();		

		//Causes turn 1 timer to expire
		jest.advanceTimersByTime(5000);

		expect(gl.checkTurnOver({turn: 1})).toBeTruthy();
		expect(gl.checkTurnOver({turn: 2})).toBeFalsy();
		expect(gl.stack).toMatchObject([]);

		expect(gl.game.turn).toBe(2);

		expect(gl.autoEndTurn).not.toBeCalled();

	});
	test('GameLoop.getState should resolve to a sanitized game object', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let state = await gl.getState(1);

		let gameCopy = JSON.parse(JSON.stringify(game));

		expect(game.playerTwo.ethAddress).toBeDefined();
		expect(game.playerTwo.hand).toBeDefined();
		expect(game.playerTwo.deck).toBeDefined();

		gameCopy.playerTwo.handLength = game.playerTwo.hand.length;
		gameCopy.playerTwo.deckLength = game.playerTwo.deck.length;

		gameCopy.playerTwo.ethAddress = '';
		gameCopy.playerTwo.hand = [];
		gameCopy.playerTwo.deck = [];
		gameCopy.playerOne.deck = [];

		expect(state).toMatchObject(gameCopy);

		state = await gl.getState(2);

		gameCopy = JSON.parse(JSON.stringify(game));

		expect(game.playerOne.ethAddress).toBeDefined();
		expect(game.playerOne.hand).toBeDefined();
		expect(game.playerOne.deck).toBeDefined();

		gameCopy.playerOne.handLength = game.playerOne.hand.length;
		gameCopy.playerOne.deckLength = game.playerOne.deck.length;

		gameCopy.playerOne.ethAddress = '';
		gameCopy.playerOne.user = {};
		gameCopy.playerOne.hand = [];
		gameCopy.playerOne.deck = [];
		gameCopy.playerTwo.deck = [];

		expect(state).toMatchObject(gameCopy);
	});
	test.skip('GameLoop.pushState should call player.socket.emit with state from #getState()', async () => {

		userOneCopy.socket = {socket: true, emit: function() {return true}};
		userTwoCopy.socket = {socket: true, emit: function() {return true}};

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let stateOne = await gl.getState(1);
		let stateTwo = await gl.getState(2);

		// gl.userOne.socket = {};
		// gl.userTwo.socket = {};

		gl.userOne.socket.emit = () => true;
		gl.userTwo.socket.emit = () => true;

		gl.userOne.socket.emit = jest.fn();
		gl.userTwo.socket.emit = jest.fn();

		gl.pushState();

		expect(gl.userOne.socket.emit).toBeCalled();
		expect(gl.userTwo.socket.emit).toBeCalled();

	});
	test('GameLoop.submitMove should set comm status rejected if no comm object provided'
		+ ' or invalid comm.action provided', async () => {

		let gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		let comm = undefined;

		let result = await gl.submitMove(comm);
		expect(result.status).toMatch('rejected');
		expect(result.message).toMatch('No communication object provided to submitMove.');

		comm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: '',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};


		result = await gl.submitMove(comm);
		expect(result.status).toMatch('rejected');
		expect(result.message).toMatch('An invalid status was provided to submitMove.');

		comm.status = 'fake';

		result =await  gl.submitMove(comm);
		expect(result.status).toMatch('rejected');
		expect(result.message).toMatch('An invalid status was provided to submitMove.');

		comm.status = 'new';

		result = await gl.submitMove(comm);
		expect(result.status).toMatch('rejected');
		expect(result.message).toMatch('An invalid action was provided to submitMove.');

		comm.status = 'new';
		comm.action = 'fake';
		
		result = await gl.submitMove(comm);
		expect(result.status).toMatch('rejected');
		expect(result.message).toMatch('An invalid action was provided to submitMove.');

	});
	test('GameLoop.submitMove should call processPlay for a new play'
		+ '', async (done) => {

		let result, gl, comm;

		comm = {
            action: 'play',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'new',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		gl.processPlay = jest.fn((argument) => {
			expect(argument).toMatchObject(comm);
			done()
		});

		result = await gl.submitMove(comm);
		expect(gl.processPlay).toBeCalled();
	});
	test('GameLoop.submitMove should call processMove for a new move'
		+ '', async (done) => {

		let result, gl, comm;
		
		comm = {
            action: 'move',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'new',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		gl.processMove = jest.fn((argument) => {
			expect(argument).toMatchObject(comm);
			done()
		});

		result = await gl.submitMove(comm);
		expect(gl.processMove).toBeCalled();
	});
	test('GameLoop.submitMove should call processCommand for a new command'
		+ '', async (done) => {

		let result, gl, comm;
		
		comm = {
            action: 'command',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'new',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		gl.processCommand = jest.fn((argument) => {
			expect(argument).toMatchObject(comm);
			done()
		});

		result = await gl.submitMove(comm);
		expect(gl.processCommand).toBeCalled();
	});
	test('GameLoop.submitMove should call processEndTurn for a submitted end turn'
		+ '', async (done) => {

		let result, gl, comm;
		
		comm = {
            action: 'end',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'new',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		gl.processEndTurn = jest.fn((argument) => {
			expect(argument).toMatchObject(comm);
			done()
		});

		result = await gl.submitMove(comm);
		expect(gl.processEndTurn).toBeCalled();
	});
	test('GameLoop.submitMove should call processReact for a submitted react status'
		+ '', async (done) => {

		let result, gl, comm;
		
		comm = {
            action: 'anything',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'react',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		gl.processReact = jest.fn((argument) => {
			expect(argument).toMatchObject(comm);
			done()
		});

		result = await gl.submitMove(comm);
		expect(gl.processReact).toBeCalled();
	});
});

describe('GameLoop checkNewMove', () => {

	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game, matchmaking, gl, comm;
		
	beforeEach(() => {

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		newId = uuidv1();

		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		matchmaking = {};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		comm = {
            action: '',
            turn: 1,
            cardPrototypeId: 7,
            actions: {
            	1: {
            		target: 'friend',
            		id: 2
            	},
            	0: {
            		target: 'enemy',
            		id: 1
            	},
            	3: {
            		target: 'self',
            		id: 99999
            	}
            },
            lane: 9,
            status: 'play',
            message: 'Some fake message',
            playerNumber: 1,
            moved: {
            	id: 1,
            	lane: 0
            },
            commanded: {
            	friendId: 2,
            	enemyId: 1
            }
		};

	});


	test('GameLoop.checkNewMove should reject if no comm,'
		+ ' turn, or action provided, or no player number', async () => {
		
		let result;

		comm = '';
		result = await gl.checkNewMove(comm);
		expect(result.message).toMatch('No comm object provided.');
		expect(result.status).toMatch('rejected');


		comm = {};
		result = await gl.checkNewMove(comm);
		expect(result.message).toMatch('No turn number provided.');
		expect(result.status).toMatch('rejected');

		comm.turn = 777;
		result = await gl.checkNewMove(comm);
		expect(result.message).toMatch('No action provided.');
		expect(result.status).toMatch('rejected');

		comm.action = 'new';
		result = await gl.checkNewMove(comm);
		expect(result.message).toMatch('No player was found for the submitted move.');
		expect(result.status).toMatch('rejected');

	});
	test('GameLoop.checkNewMove should reject if player has unresolved react events'
		+ ' without providing react information', async () => {
		
		let result

		comm.action = 'play'
		comm.turn = 2
		comm.reactAction = undefined;
		comm.reactActionId = undefined

		gl.game.playerOne.reactEvents.push({actionId: 1, value: 1});

		result = await gl.checkNewMove(comm);
		expect(result.message).toMatch('You have a react event that must be resolved.');
		expect(result.status).toMatch('rejected');

		comm.reactActionId = 1;
		comm.reactAction = {
			target: 'none',
			id: []
		}

		result = await gl.checkNewMove(comm);
		expect(result.message).toMatch("The provided turn for this react event has not happened yet.");
		expect(result.status).toMatch('rejected');

		comm.turn = 0;

		result = await gl.checkNewMove(comm);
		expect(result.message).not.toMatch('You have a react event that must be resolved.');
		expect(result.message).not.toMatch("The provided turn for this react event has not happened yet.");
		expect(result.status).toMatch('rejected');
	});
	test('GameLoop.checkNewMove should resolve on end action'
		+ ' if valid comm provided', async () => {
		
		let result

		comm = {
			action: 'end',
			playerNumber: 1,
			turn: 1
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')
	});
	test('GameLoop.checkNewMove should reject on play action'
		+ ' if invalid prototype provided', async () => {
		
		let result

		gl.game.cardPrototypes[7] =   {
			_id: {type: 7},
			cardSet: 'blah',
			setTitle: 'blah',
			setTitleHex: 'blah',
			rarity: 1,
			actionPointCost: 3,
			attackValue: 7,
			healthValue: 7,
			actionOne: 7,
			actionOneString: 'blah',
			actionTwo: 2,
			actionTwoString: 'blah',
			actionThree: 0,
			actionThreeString: 'blah',
			actionOneValue: 1,
			actionTwoValue: 1,
			actionThreeValue: 0,
			title: 'blah',
			titleHex: 'blah',
			artist: 'blah',
			artistHex: 'blah',
			artUrl: 'blah',
			imageUrl: 'blah',
			flavorText: 'blah',
			deployable: true,
			blockNumber: 99999999,
			lastUpdateBlock: 99999998,
			priceEth: 'blah',
			amount: 999999999,
		}

		comm.action = 'play'

		comm.cardPrototypeId = 7777777

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Card prototype could not be found.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on play action'
		+ ' if not enough dev to play card (bypassed by player.freePlay or freeDeploy', async () => {
		
		let result

		gl.game.cardPrototypes[7] =   {
			_id: {type: 7},
			cardSet: 'blah',
			setTitle: 'blah',
			setTitleHex: 'blah',
			rarity: 1,
			actionPointCost: 3,
			attackValue: 7,
			healthValue: 7,
			actionOne: 7,
			actionOneString: 'blah',
			actionTwo: 2,
			actionTwoString: 'blah',
			actionThree: 0,
			actionThreeString: 'blah',
			actionOneValue: 1,
			actionTwoValue: 1,
			actionThreeValue: 0,
			title: 'blah',
			titleHex: 'blah',
			artist: 'blah',
			artistHex: 'blah',
			artUrl: 'blah',
			imageUrl: 'blah',
			flavorText: 'blah',
			deployable: true,
			blockNumber: 99999999,
			lastUpdateBlock: 99999998,
			priceEth: 'blah',
			amount: 999999999,
		}

		comm.action = 'play'

		comm.cardPrototypeId = 7

		result = await gl.checkNewMove(comm)
		expect(game.playerOne.dev).toBe(1);
		expect(gl.game.cardPrototypes[7].actionPointCost).toBe(3);
		expect(result.message).toMatch('Not enough action points to play card.')
		expect(result.status).toMatch('rejected')

		game.playerOne.freePlay++;

		result = await gl.checkNewMove(comm)
		expect(game.playerOne.dev).toBe(1);
		expect(gl.game.cardPrototypes[7].actionPointCost).toBe(3);
		expect(result.message).toMatch('No lane chosen for playing deployable card.')
		expect(result.status).toMatch('rejected')

		game.playerOne.freePlay--;
		game.playerOne.freeDeploy++;

		result = await gl.checkNewMove(comm)
		expect(game.playerOne.dev).toBe(1);
		expect(gl.game.cardPrototypes[7].actionPointCost).toBe(3);
		expect(result.message).toMatch('No lane chosen for playing deployable card.')
		expect(result.status).toMatch('rejected')

		//Not bypassed with freeDeploy if card is a resource
		gl.game.cardPrototypes[7].deployable = false;

		result = await gl.checkNewMove(comm)
		expect(game.playerOne.dev).toBe(1);
		expect(gl.game.cardPrototypes[7].actionPointCost).toBe(3);
		expect(result.message).toMatch('Not enough action points to play card.')
		expect(result.status).toMatch('rejected')

		game.playerOne.freeDeploy--;
		game.playerOne.dev = 3;
		gl.game.cardPrototypes[7].deployable = true;

		result = await gl.checkNewMove(comm)
		expect(game.playerOne.dev).toBe(3);
		expect(gl.game.cardPrototypes[7].actionPointCost).toBe(3);
		expect(result.message).toMatch('No lane chosen for playing deployable card.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on play action'
		+ ' if deploying fighter to invalid lane', async () => {
		
		let result

		gl.game.cardPrototypes[7] =   {
			_id: {type: 7},
			cardSet: 'blah',
			setTitle: 'blah',
			setTitleHex: 'blah',
			rarity: 1,
			actionPointCost: 3,
			attackValue: 7,
			healthValue: 7,
			actionOne: 7,
			actionOneString: 'blah',
			actionTwo: 2,
			actionTwoString: 'blah',
			actionThree: 0,
			actionThreeString: 'blah',
			actionOneValue: 1,
			actionTwoValue: 1,
			actionThreeValue: 0,
			title: 'blah',
			titleHex: 'blah',
			artist: 'blah',
			artistHex: 'blah',
			artUrl: 'blah',
			imageUrl: 'blah',
			flavorText: 'blah',
			deployable: true,
			blockNumber: 99999999,
			lastUpdateBlock: 99999998,
			priceEth: 'blah',
			amount: 999999999,
		}

		game.playerOne.dev = 3

		comm.action = 'play'
		comm.cardPrototypeId = 7

		comm.lane = ''

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No lane chosen for playing deployable card.')
		expect(result.status).toMatch('rejected')

		comm.lane = 7

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No lane chosen for playing deployable card.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on play action'
		+ ' if card does not exist in player hand', async () => {
		
		let result

		gl.game.cardPrototypes[7] =   {
			_id: {type: 7},
			cardSet: 'blah',
			setTitle: 'blah',
			setTitleHex: 'blah',
			rarity: 1,
			actionPointCost: 3,
			attackValue: 7,
			healthValue: 7,
			actionOne: 7,
			actionOneString: 'blah',
			actionTwo: 2,
			actionTwoString: 'blah',
			actionThree: 0,
			actionThreeString: 'blah',
			actionOneValue: 1,
			actionTwoValue: 1,
			actionThreeValue: 0,
			title: 'blah',
			titleHex: 'blah',
			artist: 'blah',
			artistHex: 'blah',
			artUrl: 'blah',
			imageUrl: 'blah',
			flavorText: 'blah',
			deployable: true,
			blockNumber: 99999999,
			lastUpdateBlock: 99999998,
			priceEth: 'blah',
			amount: 999999999,
		}

		game.playerOne.dev = 3
		comm.action = 'play'
		comm.cardPrototypeId = 7
		comm.lane = 2

		game.playerOne.hand = []

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Card is not in hand.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on play action'
		+ ' if comm.actions do not match card prototype', async () => {
		
		let found, result

		gl.checkActionValid = jest.fn(() => {
			return false
		})

		gl.game.cardPrototypes[7] =   {
			_id: {type: 7},
			cardSet: 'blah',
			setTitle: 'blah',
			setTitleHex: 'blah',
			rarity: 1,
			actionPointCost: 3,
			attackValue: 7,
			healthValue: 7,
			actionOne: 7,
			actionOneString: 'blah',
			actionTwo: 2,
			actionTwoString: 'blah',
			actionThree: 0,
			actionThreeString: 'blah',
			actionOneValue: 1,
			actionTwoValue: 1,
			actionThreeValue: 0,
			title: 'blah',
			titleHex: 'blah',
			artist: 'blah',
			artistHex: 'blah',
			artUrl: 'blah',
			imageUrl: 'blah',
			flavorText: 'blah',
			deployable: true,
			blockNumber: 99999999,
			lastUpdateBlock: 99999998,
			priceEth: 'blah',
			amount: 999999999,
		}

		game.playerOne.dev = 3
		comm.action = 'play'
		comm.cardPrototypeId = 7
		comm.lane = 2
		gl.drawToHand({
			playerNumber: 1, 
			collection: game.playerOne.deck, 
			matchId: 7
		})

		found = playerOne.hand.find((card) => {
			return card.id === 7
		});

		expect(found).toBeDefined();

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Submitted actions do not match card prototype.')
		expect(result.status).toMatch('rejected')

		expect(comm.actions[1].id).toBe(2)

		comm.actions = {
			7777: {
				target: 'friend',
				id: 1
			},
			2: {
				target: 'self',
				id: 99999
			},
			0: {
				target: 'opponent',
				id: -87
			}
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Submitted actions do not match card prototype.')
		expect(result.status).toMatch('rejected')

		comm.actions = {
			7: {
				target: 'friend',
				id: 1
			},
			2: {},
			0: {}
		}

		//Expect that an empty object should pass as long as key is correct
		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Submitted action(s) were invalid.')
		expect(result.status).toMatch('rejected')

	});
	test('GameLoop.checkNewMove should call checkActionValid on play action'
		+ ' and resolve with status new if validated', async () => {
		
		let found, result

		gl.game.cardPrototypes[7] =   {
			_id: {type: 7},
			cardSet: 'blah',
			setTitle: 'blah',
			setTitleHex: 'blah',
			rarity: 1,
			actionPointCost: 3,
			attackValue: 7,
			healthValue: 7,
			actionOne: 7,
			actionOneString: 'blah',
			actionTwo: 2,
			actionTwoString: 'blah',
			actionThree: 0,
			actionThreeString: 'blah',
			actionOneValue: 1,
			actionTwoValue: 1,
			actionThreeValue: 0,
			title: 'blah',
			titleHex: 'blah',
			artist: 'blah',
			artistHex: 'blah',
			artUrl: 'blah',
			imageUrl: 'blah',
			flavorText: 'blah',
			deployable: true,
			blockNumber: 99999999,
			lastUpdateBlock: 99999998,
			priceEth: 'blah',
			amount: 999999999,
		}

		game.playerOne.dev = 3
		comm.action = 'play'
		comm.status = 'new'
		comm.cardPrototypeId = 7
		comm.lane = 2
		gl.drawToHand({
			playerNumber: 1, 
			collection: game.playerOne.deck, 
			matchId: 7
		})

		found = playerOne.hand.find((card) => {
			return card.id === 7
		});

		expect(found).toBeDefined();

		comm.actions = {
			7: {
				target: 'friend',
				id: 1
			},
			2: {
				target: 'self',
				id: 22222
			},
			0: {}
		}

		gl.checkActionValid = jest.fn(
			({actionId, actionsObject, cardPrototypeId, playerNumber}) => {
				if(gl.checkActionValid.mock.calls.length === 1) {
					expect(actionId).toBe(7)
					expect(actionsObject).toMatchObject(comm.actions[7])
					expect(cardPrototypeId).toBe(7)
					expect(playerNumber).toBe(1)
				}
				if(gl.checkActionValid.mock.calls.length === 2) {
					expect(actionId).toBe(2)
					expect(actionsObject).toMatchObject(comm.actions[2])
				}
				if(gl.checkActionValid.mock.calls.length === 3) {
					expect(actionId).toBe(0)
					expect(actionsObject).toMatchObject(comm.actions[0])
				}
				expect(cardPrototypeId).toBe(7)
				expect(playerNumber).toBe(1)
				return true
		})

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')


	});
	test('GameLoop.checkNewMove should reject on move action'
		+ ' if no move object provided', async () => {
		
		let found, result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No move object found.')
		expect(result.status).toMatch('rejected')

	});
	test('GameLoop.checkNewMove should reject on move action'
		+ ' if no lane or id provided (or invalid lane provided)', async () => {
		
		let result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1,
			moved: {
				lane: 0,
				id: undefined
			}
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No lane or fighter information provided for moving.')
		expect(result.status).toMatch('rejected')

		comm.moved = {
			lane: undefined,
			id: 1
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No lane or fighter information provided for moving.')
		expect(result.status).toMatch('rejected')

		comm.moved = {
			lane: 3,
			id: 1
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Specified lane does not exist.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on move action'
		+ ' if fighter id provided does not exist in player deployed array', async () => {
		
		let result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1,
			moved: {
				lane: 0,
				id: 1
			}
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No matching fighter found for moving.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on move action'
		+ ' if fighter already moved this turn', async () => {
		
		let result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1,
			moved: {
				lane: 0,
				id: 1
			}
		}

		game.playerOne.deployFighter(cardPrototype118, 0)
		expect(game.playerOne.deployed.length).toBe(1)
		expect(game.playerOne.deployed[0].id).toBe(1)

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Fighter already moved this turn.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on move action'
		+ ' if fighter already in the specified lane', async () => {
		
		let result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1,
			moved: {
				lane: 0,
				id: 1
			}
		}

		game.playerOne.deployFighter(cardPrototype118, 0)
		expect(game.playerOne.deployed.length).toBe(1)
		expect(game.playerOne.deployed[0].id).toBe(1)
		expect(game.playerOne.deployed[0].lane).toBe(0)

		game.playerOne.deployed[0].moved = false

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Fighter is already in the specified lane.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on move action'
		+ ' if the lane to move to is not an adjacent lane', async () => {
		
		let result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1,
			moved: {
				lane: 2,
				id: 1
			}
		}

		game.playerOne.deployFighter(cardPrototype118, 0)
		expect(game.playerOne.deployed.length).toBe(1)
		expect(game.playerOne.deployed[0].id).toBe(1)
		expect(game.playerOne.deployed[0].lane).toBe(0)

		game.playerOne.deployed[0].moved = false

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Targeted lane for move is not adjacent.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should resolve on move action'
		+ ' if valid move was provided', async () => {
		
		let result

		comm = {
			action: 'move',
			turn: 1,
			playerNumber: 1,
			moved: {
				lane: 1,
				id: 1
			}
		}

		game.playerOne.deployFighter(cardPrototype118, 0)
		expect(game.playerOne.deployed.length).toBe(1)
		expect(game.playerOne.deployed[0].id).toBe(1)
		expect(game.playerOne.deployed[0].lane).toBe(0)

		game.playerOne.deployed[0].moved = false

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')
	});
	test('GameLoop.checkNewMove should reject on command action'
		+ ' if no command object provided', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No command object found.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on command action'
		+ ' if no friend/enemy id provided', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: undefined,
				enemyId: undefined
			}
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No friend or enemy id found for attack.')
		expect(result.status).toMatch('rejected')

		comm.commanded.friendId = 1
		
		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No friend or enemy id found for attack.')
		expect(result.status).toMatch('rejected')

		comm.commanded.friendId = undefined
		comm.commanded.enemyId = 1
		
		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('No friend or enemy id found for attack.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on command action'
		+ ' if attacker is a player who cannot attack', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: 0,
				enemyId: 1
			}
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player cannot attack.')
		expect(result.status).toMatch('rejected')
	});

	test('GameLoop.checkNewMove should reject on command action'
		+ ' if provided friend and/or enemy cannot be found', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: 1,
				enemyId: 1
			}
		}

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Targetted friendly or enemy fighter was not found.')
		expect(result.status).toMatch('rejected')

		comm.commanded.friendId = 0
		game.playerOne.canAttack = true

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Targetted friendly or enemy fighter was not found.')
		expect(result.status).toMatch('rejected')

		game.playerOne.canAttack = false
		comm.commanded.friendId = 1
		comm.commanded.enemyId = 0

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Targetted friendly or enemy fighter was not found.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on command action'
		+ ' if friendly fighter or player has already attacked this turn', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: 0,
				enemyId: 0
			}
		}

		game.playerOne.canAttack = true
		game.playerOne.commanded = true

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Friendly fighter has already attacked this turn.')
		expect(result.status).toMatch('rejected')

		game.playerOne.canAttack = false
		game.playerOne.commanded = false

		comm.commanded.friendId = 1
		comm.commanded.enemyId = 1

		game.playerOne.deployFighter(cardPrototype118, 0)
		game.playerTwo.deployFighter(cardPrototype118, 0)

		expect(game.playerOne.deployed[0].id).toBe(1)
		expect(game.playerTwo.deployed[0].id).toBe(1)

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Friendly fighter has already attacked this turn.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on command action'
		+ ' if friendly fighter has already moved this turn', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: 0,
				enemyId: 0
			}
		}

		game.playerOne.canAttack = true
		game.playerOne.commanded = true

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Friendly fighter has already attacked this turn.')
		expect(result.status).toMatch('rejected')

		game.playerOne.canAttack = false
		game.playerOne.commanded = false

		comm.commanded.friendId = 1
		comm.commanded.enemyId = 1

		game.playerOne.deployFighter(cardPrototype118, 0)
		game.playerTwo.deployFighter(cardPrototype118, 0)

		expect(game.playerOne.deployed[0].id).toBe(1)
		expect(game.playerTwo.deployed[0].id).toBe(1)

		game.playerOne.deployed[0].commanded = false

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Friendly fighter has already moved this turn.')
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should reject on command action'
		+ ' if opponent is not in an adjacent lane fighter has already moved this turn', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: 1,
				enemyId: 1
			}
		}

		game.playerOne.deployFighter(cardPrototype118, 0)
		game.playerTwo.deployFighter(cardPrototype118, 2)

		expect(game.playerOne.deployed[0].id).toBe(1)
		expect(game.playerTwo.deployed[0].id).toBe(1)

		game.playerOne.deployed[0].commanded = false
		game.playerOne.deployed[0].moved = false

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch("Enemy is not in an adjacent lane.")
		expect(result.status).toMatch('rejected')

		game.playerOne.deployFighter(cardPrototype118, 2)
		game.playerTwo.deployFighter(cardPrototype118, 0)

		expect(game.playerOne.deployed[1].id).toBe(2)
		expect(game.playerTwo.deployed[1].id).toBe(2)

		game.playerOne.deployed[0].commanded = false
		game.playerOne.deployed[0].moved = false

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch("Enemy is not in an adjacent lane.")
		expect(result.status).toMatch('rejected')
	});
	test('GameLoop.checkNewMove should resolve on command action'
		+ ' if valid command object was provided', async () => {
		
		let result

		comm = {
			action: 'command',
			turn: 1,
			playerNumber: 1,
			commanded: {
				friendId: 0,
				enemyId: 0
			}
		}

		game.playerOne.canAttack = true
		game.playerOne.commanded = false

		game.playerOne.deployFighter(cardPrototype118, 0)
		game.playerOne.deployFighter(cardPrototype118, 1)
		game.playerOne.deployFighter(cardPrototype118, 2)
		
		game.playerOne.deployed[0].moved = false
		game.playerOne.deployed[0].commanded = false

		game.playerOne.deployed[1].moved = false
		game.playerOne.deployed[1].commanded = false

		game.playerOne.deployed[2].moved = false
		game.playerOne.deployed[2].commanded = false

		game.playerTwo.deployFighter(cardPrototype118, 0)
		game.playerTwo.deployFighter(cardPrototype118, 1)
		game.playerTwo.deployFighter(cardPrototype118, 2)

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.enemyId = 1

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.enemyId = 2

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.enemyId = 3

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 1
		comm.commanded.enemyId = 0

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 1
		comm.commanded.enemyId = 1

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 1
		comm.commanded.enemyId = 2

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 2
		comm.commanded.enemyId = 0

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 2
		comm.commanded.enemyId = 1

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 2
		comm.commanded.enemyId = 2

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 2
		comm.commanded.enemyId = 3

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 3
		comm.commanded.enemyId = 0

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 3
		comm.commanded.enemyId = 2

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')

		comm.commanded.friendId = 3
		comm.commanded.enemyId = 3

		result = await gl.checkNewMove(comm)
		expect(result.message).toMatch('Player action is valid.')
		expect(result.status).toMatch('new')
	});
	test('GameLoop.applySpecials should apply no specials'
		+ ' if player action is move or play', async () => {
		
		let history, attacker, defender, gameCopy

		history = {};

		game.playerOne.deployFighter(cardPrototype118, 0)
		game.playerTwo.deployFighter(cardPrototype118, 0)

		attacker = game.playerOne.deployed[0]
		defender = game.playerTwo.deployed[0]

		gameCopy = JSON.parse(JSON.stringify(game))
		expect(game).toMatchObject(gameCopy)

		await gl.applySpecials({
			playerAction: 'move', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(game).toMatchObject(gameCopy)
		expect(history).toMatchObject({})
		
		await gl.applySpecials({
			playerAction: 'play', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(game).toMatchObject(gameCopy)
		expect(history).toMatchObject({})
	});
	test('GameLoop.applySpecials should apply evade'
		+ ' if defender has evade special', async () => {
		
		let history, attacker, defender, gameCopy

		history = {
			specials: []
		};

		game.playerOne.deployFighter(cardPrototype118, 0)
		game.playerTwo.deployFighter(cardPrototype118, 0)

		attacker = game.playerOne.deployed[0]
		defender = game.playerTwo.deployed[0]

		attacker.moved = false
		attacker.commanded = false
		defender.moved = false
		defender.commanded = false

		gameCopy = JSON.parse(JSON.stringify(game))
		expect(game).toMatchObject(gameCopy)

		expect(defender.specials[19]).toBeDefined()
		expect(defender.specials[19].timesUsed).toBe(0)
		expect(defender.specials[19].value).toBe(1)

		defender.health -= attacker.attack

		//Simulating attack, evade should negate this damage
		expect(defender.health).toBe(globalPrototypes[118].healthValue - attacker.attack)
		expect(defender.specials[19].timesUsed).toBe(0)

		//Evade should be applied
		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(defender.health).toBe(globalPrototypes[118].healthValue)
		expect(defender.specials[19].timesUsed).toBe(1)
		expect(attacker).toMatchObject(gameCopy.playerOne.deployed[0])

		defender.health -= attacker.attack

		//Evade should not be applied
		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(defender.health).toBe(globalPrototypes[118].healthValue - attacker.attack)
		expect(defender.specials[19].timesUsed).toBe(1)
		expect(attacker).toMatchObject(gameCopy.playerOne.deployed[0])
		expect(history.specials[0]).toMatchObject(defender.specials[19])

		defender.specials[19].value++
		defender.health -= attacker.attack

		//Evade should again be applied
		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(defender.health).toBe(globalPrototypes[118].healthValue - attacker.attack)
		expect(defender.specials[19].timesUsed).toBe(2)
		expect(attacker).toMatchObject(gameCopy.playerOne.deployed[0])
		expect(history.specials[1]).toMatchObject(defender.specials[19])
	});
	test('GameLoop.applySpecials should apply multi-attacks'
		+ ' if attacker has multi-attacks special', async () => {
		
		let history, attacker, defender, gameCopy

		history = {
			specials: []
		};

		game.playerOne.deployFighter(globalPrototypes[165], 0)
		game.playerTwo.deployFighter(globalPrototypes[165], 0)

		attacker = game.playerOne.deployed[0]
		defender = game.playerTwo.deployed[0]

		attacker.moved = false
		attacker.commanded = false
		defender.moved = false
		defender.commanded = false

		gameCopy = JSON.parse(JSON.stringify(game))
		expect(game).toMatchObject(gameCopy)

		expect(attacker.specials[23]).toBeDefined()
		expect(attacker.specials[23].timesUsed).toBe(0)
		expect(attacker.specials[23].value).toBe(2)

		defender.health -= attacker.attack
		attacker.commanded = true

		//Simulating attack, attacker should be able to attack for specials.value - 1 times
		//So 1 attack already happened, should be able to attack one more time if value is 2

		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(attacker.commanded).toBeFalsy()
		expect(attacker.specials[23].timesUsed).toBe(1)
		expect(history.specials[0]).toMatchObject(attacker.specials[23])

		defender.health -= attacker.attack
		attacker.commanded = true

		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(attacker.commanded).toBeTruthy()
		expect(attacker.specials[23].timesUsed).toBe(1)
		expect(history.specials.length).toBe(1)
	});
	test('GameLoop.applySpecials should apply damage-defend'
		+ ' if defender has damage defend', async () => {
		
		let history, attacker, defender, gameCopy

		history = {
			specials: []
		};

		game.playerOne.deployFighter(globalPrototypes[175], 0)
		game.playerTwo.deployFighter(globalPrototypes[175], 0)

		attacker = game.playerOne.deployed[0]
		defender = game.playerTwo.deployed[0]

		attacker.moved = false
		attacker.commanded = false
		defender.moved = false
		defender.commanded = false

		gameCopy = JSON.parse(JSON.stringify(game))
		expect(game).toMatchObject(gameCopy)

		expect(defender.specials[24]).toBeDefined()
		expect(defender.specials[24].timesUsed).toBe(0)
		expect(defender.specials[24].value).toBe(2)

		defender.health -= attacker.attack
		attacker.commanded = true

		//Simulating attack, attacker should be able to attack for specials.value - 1 times
		//So 1 attack already happened, should be able to attack one more time if value is 2

		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(attacker.health).toBe(globalPrototypes[175].healthValue - defender.specials[24].value)
		expect(attacker.commanded).toBeTruthy()
		expect(defender.specials[24].timesUsed).toBe(1)
		expect(history.specials[0]).toMatchObject(defender.specials[24])

		defender.health -= attacker.attack
		attacker.commanded = true

		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(attacker.health).toBe(
			globalPrototypes[175].healthValue 
			- defender.specials[24].value * 2)
		expect(defender.specials[24].timesUsed).toBe(2)
		expect(history.specials[1]).toMatchObject(defender.specials[24])

		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(attacker.health).toBe(
			globalPrototypes[175].healthValue 
			- defender.specials[24].value * 3)
		expect(defender.specials[24].timesUsed).toBe(3)
		expect(history.specials[2]).toMatchObject(defender.specials[24])

		await gl.applySpecials({
			playerAction: 'command', 
			attacker: attacker,
			defender: defender,
			history: history
		})

		expect(attacker.health).toBe(
			globalPrototypes[175].healthValue 
			- defender.specials[24].value * 4)
		expect(defender.specials[24].timesUsed).toBe(4)
		expect(history.specials[3]).toMatchObject(defender.specials[24])
	});
	test('GameLoop.checkActionValid should resolve true'
		+ ' if actionId is 0 (no action)', async () => {
		
		let result

		result = await gl.checkActionValid({
			actionId: 0
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve true if no more info needed for action'
		+ ' (actionId is 2,3,8,9,12,15,18,19,23,24,26,27,28,30,31,33)', async () => {
		
		let result 

		result = await gl.checkActionValid({ actionId: 2 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 3 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 8 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 9 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 12 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 15 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 18 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 19 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 23 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 24 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 26 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 27 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 28 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 30 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 31 })
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({ actionId: 33 })
		expect(result).toBeTruthy()

	});
	test('GameLoop.checkActionValid should resolve false'
		+ ' if actionId is an action that requires a target'
		+ ' and other args are not provided', async () => {
		
		let result

		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 7
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'self',
				id: [1]
			},
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'self',
				id: [1]
			},
			cardPrototypeId: 118
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			playerNumber: 2,
			cardPrototypeId: 118,
			actionsObject: undefined
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			playerNumber: 2,
			cardPrototypeId: 118,
			actionsObject: {
				
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			playerNumber: 2,
			cardPrototypeId: 118,
			actionsObject: {
				target: 7,
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			playerNumber: 2,
			cardPrototypeId: 118,
			actionsObject: {
				target: 7,
				id: [1]
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			playerNumber: 2,
			cardPrototypeId: 118,
			actionsObject: {
				target: 'none',
				id: 'one'
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			playerNumber: 2,
			cardPrototypeId: 118,
			actionsObject: {
				target: 'none',
				id: ['one']
			}
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve false'
		+ ' if an invalid target string is provided', async () => {
		
		let result

		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'enemy',
				id: [1]
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'friend',
				id: [1]
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'self',
				id: [1]
			}
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'opponent',
				id: [1]
			}
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 1 (HEAL)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 1,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 9999,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'self',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'opponent',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'friend',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'friend',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'friend',
				id: [5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'enemy',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'enemy',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'enemy',
				id: [5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 1,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 4 (DMG_ENEMY)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 4,
		  actionOneString: 'DMG_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 9999,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: false,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 4,
			actionsObject: {
				target: 'self',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 4,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 4,
			actionsObject: {
				target: 'opponent',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 4,
			actionsObject: {
				target: 'enemy',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 4,
			actionsObject: {
				target: 'enemy',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 4,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 5 (DMG_FRIEND)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 5,
		  actionOneString: 'DMG_FRIEND',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 9999,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'self',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'opponent',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'opponent',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'friend',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'friend',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'enemy',
				id: [0,1,2,3,4,5,6]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'enemy',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 5,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 6 (DRAW_DISCARD_TGT)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 6,
		  actionOneString: 'PARALYZE_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)



		playerTwo.discard.push({id: 1})
		playerTwo.discard.push({id: 2})
		playerTwo.discard.push({id: 3})
		playerTwo.discard.push({id: 4})

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'none',
				id: [1, 2, 3]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'none',
				id: [1, 2, 3, 4]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'none',
				id: [9999]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'self',
				id: [1, 2]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'opponent',
				id: [1, 2]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'friend',
				id: [1, 2]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 6,
			actionsObject: {
				target: 'enemy',
				id: [1, 2]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 7 (PARALYZE_ENEMY)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 7,
		  actionOneString: 'PARALYZE_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 9999,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'self',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'opponent',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'friend',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'none',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'none',
				id: [5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 7,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 10 (DISCARD_SELF)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 10,
		  actionOneString: 'PARALYZE_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 4,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		playerOne.hand = []
		playerTwo.hand = []

		playerTwo.hand.push({id: 1})
		playerTwo.hand.push({id: 1})
		playerTwo.hand.push({id: 1})

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'none',
				id: [1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'none',
				id: [1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'none',
				id: [2, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()


		playerTwo.hand.push({id: 1})
		playerTwo.hand.push({id: 1})


		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'none',
				id: [1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'none',
				id: [1, 1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'self',
				id: [1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'opponent',
				id: [1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'friend',
				id: [1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 10,
			actionsObject: {
				target: 'enemy',
				id: [1, 1, 1, 1]
			},
			playerNumber: 2,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 11 (HEAL_FRIEND)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 11,
		  actionTwoString: 'PARALYZE_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 9999,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 11,
			actionsObject: {
				target: 'self',
				id: [1,2,3,4,5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 11,
			actionsObject: {
				target: 'opponent',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 11,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 11,
			actionsObject: {
				target: 'enemy',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 11,
			actionsObject: {
				target: 'friend',
				id: [2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 11,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 13 (SWAP_FIGHTERS)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 13,
		  actionTwoString: 'KILL_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 7,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)

		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [1, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [1, 1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [1, 2, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [3, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [1, 3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'self',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'opponent',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'friend',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 13,
			actionsObject: {
				target: 'enemy',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 14 (KILL_ENEMY_HEALTH_LT_COST)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 14,
		  actionTwoString: 'KILL_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 3,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)

		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		playerTwo.deployed[0].health = fakeCardPrototype.actionPointCost - 1
		playerTwo.deployed[1].health = fakeCardPrototype.actionPointCost - 1
		playerTwo.deployed[2].health = fakeCardPrototype.actionPointCost - 1

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'none',
				id: [1, 2, 3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'none',
				id: [4]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()


		playerTwo.deployed[0].health = fakeCardPrototype.actionPointCost + 1


		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'none',
				id: [1, 2, 3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		playerTwo.deployed[0].health = fakeCardPrototype.actionPointCost - 1
		fakeCardPrototype.actionTwoValue = 2

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'none',
				id: [1, 2, 3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()


		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'self',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'opponent',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 14,
			actionsObject: {
				target: 'none',
				id: [2, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 16 (DMG)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 16,
		  actionTwoString: 'PARALYZE_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 9999,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'none',
				id: [1,2,3,4,5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'self',
				id: [1,2,3,4,5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'opponent',
				id: [1,2,3,4,5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'friend',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'friend',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'enemy',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'friend',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 16,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 17 (KILL_ENEMY)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 17,
		  actionTwoString: 'KILL_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 1,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)

		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'self',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'opponent',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'none',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()



		fakeCardPrototype.actionTwoValue = 3



		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'none',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'none',
				id: [1, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'none',
				id: [1, 2, 3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 17,
			actionsObject: {
				target: 'none',
				id: [1, 2, 999]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 20 (GIVE_CARDS)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 20,
		  actionOneString: 'blah',
		  actionTwo: 0,
		  actionTwoString: 'PARALYZE_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		playerOne.hand = []
		playerOne.hand.push({id: 900})
		playerOne.hand.push({id: 901})
		playerOne.hand.push({id: 902})

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: []
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [900, 901]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [900, 900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [900, 901, 902]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [9999, 9999]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'self',
				id: [900, 901]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'friend',
				id: [900, 901]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'enemy',
				id: [900, 901]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'opponent',
				id: [900, 901]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()


		fakeCardPrototype.actionOneValue = 4

		//Expect can give less than actionValue if hand length 
		//doesn't have that many cards (but must give whole hand)
		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [900, 901, 902]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(playerOne.hand.length).toBe(3)
		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 20,
			actionsObject: {
				target: 'none',
				id: [900, 901]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 21 (DISCARD_AND_DRAW)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 21,
		  actionOneString: 'blah',
		  actionTwo: 0,
		  actionTwoString: 'PARALYZE_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		playerOne.hand.push({id: 900})
		playerOne.hand.push({id: 901})
		playerOne.hand.push({id: 902})

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'none',
				id: []
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'none',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'none',
				id: [900, 901, 902]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'none',
				id: [899]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'none',
				id: [900, 900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'self',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'friend',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'enemy',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'opponent',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 21,
			actionsObject: {
				target: 'none',
				id: [900]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 22 (ATTACK_ON_DEPLOY)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 22,
		  actionTwoString: 'PARALYZE_ENEMY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 9999,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'self',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'opponent',
				id: [1,2,3,4,5]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'friend',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'enemy',
				id: [0]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'enemy',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 22,
			actionsObject: {
				target: 'enemy',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 25 (CONTROL_ENEMY)', async () => {
		
		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 0,
		  actionTwoString: 'PARALYZE_ENEMY',
		  actionThree: 25,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 1,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'self',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'opponent',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'friend',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'none',
				id: [1, 1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'none',
				id: [3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'none',
				id: [1, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()


		fakeCardPrototype.actionThreeValue = 2


		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'none',
				id: [1, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 25,
			actionsObject: {
				target: 'none',
				id: [2, 2]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 29 (FREE_PLAY)', async () => {
		
		let result, fakeCardPrototype, fakeCardPrototypeTwo

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 29,
		  actionTwoString: 'FREE_PLAY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 1,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		fakeCardPrototypeTwo = {
		  _id: 9990,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 1,
		  actionTwoString: 'HEAL',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 9999,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype
		game.cardPrototypes[9990] = fakeCardPrototypeTwo

		playerOne.hand.push({id: 1})
		playerOne.hand.push({id: 9990})
		playerOne.hand.push({id: 9990})

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'self',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'friend',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'opponent',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'enemy',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'none',
				id: []
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'none',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'none',
				id: [1, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		fakeCardPrototype.actionTwoValue = 3

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'none',
				id: [9990, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 29,
			actionsObject: {
				target: 'none',
				id: [1, 9990, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()


		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'friend',
				id: [9990, 9990, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
	test('GameLoop.checkActionValid should resolve correctly'
		+ ' for actionId 32 (DEPLOY)', async () => {
		
		let result, fakeCardPrototype, fakeCardPrototypeTwo

		fakeCardPrototype = {
		  _id: 9999,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 32,
		  actionTwoString: 'DEPLOY',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 1,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		fakeCardPrototypeTwo = {
		  _id: 9990,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'blah',
		  actionTwo: 1,
		  actionTwoString: 'HEAL',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 9999,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[9999] = fakeCardPrototype
		game.cardPrototypes[9990] = fakeCardPrototypeTwo

		playerOne.hand.push({id: 1})
		playerOne.hand.push({id: 9990})
		playerOne.hand.push({id: 9990})

		playerOne.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 0)

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'self',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'friend',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'opponent',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'enemy',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'none',
				id: [1]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'none',
				id: []
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'none',
				id: [9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'none',
				id: [9990, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		fakeCardPrototype.actionTwoValue = 3

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'none',
				id: [9990, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()

		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'none',
				id: [9990, 9990, 9990]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeTruthy()


		result = await gl.checkActionValid({
			actionId: 32,
			actionsObject: {
				target: 'friend',
				id: [3]
			},
			playerNumber: 1,
			cardPrototypeId: 9999
		})

		expect(result).toBeFalsy()
	});
});


describe('GameLoop checkNewReact', () => {

	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game, matchmaking, gl, comm;
		
	beforeEach(() => {

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		newId = uuidv1();

		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		matchmaking = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);

		comm = {
            action: '',
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'react',
            message: 'Some fake message',
            playerNumber: undefined,
            moved: undefined,
            commanded: undefined,
            reactActionId: undefined,
            reactAction: undefined
		};

	});

	test("GameLoop.checkNewReact should reject if no comm is provided,"
		+ " no playerNumber was provided, no player.reactEvents exist, actionId doesn't exist", async () => {

		let fakeComm, result
		fakeComm = ''
		result = await gl.checkNewReact(fakeComm)
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("No comm object provided.")

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid player number provided.")

		comm.playerNumber = 1

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("No react events to react to.")

		gl.game.playerOne.reactEvents.push({actionId: 1, value: 1})

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("No react action id provided.")

		comm.reactActionId = 2

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action ID provided.")

		comm.reactActionId = 1

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action object provided.")

		comm.reactAction = {}
		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action object provided.")

		comm.reactAction = {
			target: 1,
			id: [1]
		}
		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action object provided.")

		comm.reactAction = {
			target: 'none',
			id: 1
		}
		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action object provided.")

		comm.reactAction = {
			target: undefined,
			id: [1]
		}
		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action object provided.")

		comm.reactAction = {
			target: 'none',
			id: undefined
		}
		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Invalid react action object provided.")

		comm.reactAction = {
			target: 'none',
			id: []
		}
		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("React actionId is not a valid action.")
		expect(result.message).not.toMatch("Invalid react action object provided.")
	});

	test("GameLoop.checkNewReact reactActionId 15 should resolve"
		+ " as expected", async () => {

		let result

		comm.playerNumber = 1
		comm.reactActionId = 15
		comm.reactAction = {
			target: 'none',
			id: [1,2,3,4]
		}

		game.playerOne.hand = []

		game.playerOne.hand.push({id: 1})
		game.playerOne.hand.push({id: 2})
		game.playerOne.hand.push({id: 3})

		game.playerOne.reactEvents.push({actionId: 15, value: 3})

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Discarding more cards than are in hand.")

		game.playerOne.hand.push({id: 4})

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Discarding more cards than allowed.")

		comm.reactAction.id.splice(0,2)
		expect(comm.reactAction.id.length).toBe(2)
		expect(game.playerOne.hand.length).toBe(4)

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Not enough cards provided for discard.")

		game.playerOne.hand.splice(0,2)
		expect(comm.reactAction.id.length).toBe(2)
		expect(game.playerOne.hand.length).toBe(2)

		result = await gl.checkNewReact(comm);
		expect(result.message).toMatch("Player react action is valid.")

		comm.reactAction.id[0] = {id: 999}

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Provided cards do not exist in hand.")
	});
	test("GameLoop.checkNewReact reactActionId 29 (FREE_PLAY) should resolve"
		+ " as expected", async () => {

		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 3,
		  healthValue: 3,
		  actionOne: 0,
		  actionTwo: 0,
		  actionThree: 0,
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  amount: 12345,
		}

		globalPrototypes[216] = fakeCardPrototype

		comm.playerNumber = 1
		comm.reactActionId = 29
		comm.reactAction = {
			target: 'none',
			id: []
		}
		comm.status = 'react'
		comm.action = 'play'
		comm.cardPrototypeId = 216
		comm.lane = 0
		comm.actions = {
			0: {
				target: 'none',
				id: []
			},
			0: {
				target: 'none',
				id: []
			},
			0: {
				target: 'none',
				id: []
			}
		}

		game.playerOne.hand = []

		game.playerOne.hand.push({id: 216})

		game.playerOne.reactEvents.push({actionId: 29, value: 1})

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('new')
		expect(result.message).toMatch("Player react action is valid.")
	});
	test("GameLoop.checkNewReact reactActionId 32 (DEPLOY) should resolve"
		+ " as expected", async () => {

		let result, fakeCardPrototype

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 3,
		  healthValue: 3,
		  actionOne: 0,
		  actionTwo: 0,
		  actionThree: 0,
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  amount: 12345,
		}

		globalPrototypes[216] = fakeCardPrototype

		comm.playerNumber = 1
		comm.reactActionId = 32
		comm.reactAction = {
			target: 'none',
			id: []
		}
		comm.status = 'react'
		comm.action = 'play'
		comm.cardPrototypeId = 216
		comm.lane = 0
		comm.actions = {
			0: {
				target: 'none',
				id: []
			},
			0: {
				target: 'none',
				id: []
			},
			0: {
				target: 'none',
				id: []
			}
		}

		game.playerOne.hand = []

		game.playerOne.hand.push({id: 216})

		game.playerOne.reactEvents.push({actionId: 32, value: 1})

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('new')
		expect(result.message).toMatch("Player react action is valid.")
	});
	test("GameLoop.checkNewReact reactActionId 31 (OPP_DRAW_DISCARD_TGT)"
		+ " should resolve as expected", async () => {

		let result

		comm.playerNumber = 1
		comm.reactActionId = 31
		comm.reactAction = {
			target: 'none',
			id: []
		}
		comm.status = 'react'

		game.playerOne.hand = []
		game.playerOne.discard = []

		game.playerOne.reactEvents.push({actionId: 31, value: 3})

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('react')
		expect(result.message).toMatch("Player react action is valid.")

		game.playerOne.discard.push({id: 1})
		game.playerOne.discard.push({id: 2})
		game.playerOne.discard.push({id: 3})

		comm.reactAction.id = [1,2,3,4]

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Cannot draw more cards than allowed.")

		comm.reactAction.id = [1,2]

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Cannot draw less cards than required.")

		comm.reactAction.id = [1,2,9]

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('rejected')
		expect(result.message).toMatch("Specified cards not found.")

		comm.reactAction.id = [1,2,3]

		result = await gl.checkNewReact(comm);
		expect(result.status).toMatch('react')
		expect(result.message).toMatch("Player react action is valid.")

	});
});


describe("GameLoop process submitted moves", () => {

	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game, matchmaking, gl, comm;
		
	beforeEach(() => {

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		newId = uuidv1();

		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		matchmaking = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
	});

	test("GameLoop.processPlay should update game state and call methods as expected"
		+ " when a deployable card is played", async() => {

		let fakeCardPrototype, comm, commCopy, valid, serverComm

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  rarity: 1,
		  actionPointCost: 3,
		  attackValue: 3,
		  healthValue: 3,
		  actionOne: 0,
		  actionTwo: 0,
		  actionThree: 0,
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  amount: 12345,
		}

		comm = {
            action: 'play',
            turn: 1,
            cardPrototypeId: 216,
            actions: {
            	0: {
            		target: 'friend',
            		id: 2
            	},
            	0: {
            		target: 'enemy',
            		id: 1
            	},
            	0: {
            		target: 'self',
            		id: 99999
            	}
            },
            lane: 1,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined
		}

		commCopy = JSON.parse(JSON.stringify(comm));

		gl.game.cardPrototypes[216] = fakeCardPrototype
		gl.game.cardPrototypesLength++
		playerOne.dev = 3
		playerOne.hand.push({id: 216})

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.processAction = jest.fn(({actionId, actionsObject, cardPrototypeId, playerNumber, lane}) => {
			expect(actionId).toBe(0)
			expect(cardPrototypeId).toBe(216)
			expect(playerNumber).toBe(1)
			expect(lane).toBe(1)
			return true
		})

		gl.emitMessage = jest.fn(({message, comm, playerNumber}) => {
			expect(message).toMatch('server-accepted-play')
			expect(playerNumber).toBe(1)
			return
		})

		gl.clearDead = jest.fn(() => {
			return
		})

		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(serverComm.responseOne).toBeTruthy()
		expect(serverComm.responseTwo).toBeTruthy()
		expect(serverComm.responseThree).toBeTruthy()

		expect(playerOne.deployed.length).toBe(1)
		expect(playerOne.deployed[0].cardPrototypeId).toBe(216)
		expect(playerOne.deployed[0].lane).toBe(1)
		expect(playerOne.discard.length).toBe(1)
		expect(playerOne.discard[0].id).toBe(216)

		expect(gl.processAction).toBeCalled()
		expect(gl.emitMessage).toBeCalled()
		expect(gl.clearDead).toBeCalled()
	})
	test("GameLoop.processPlay should update game state and call methods as expected"
		+ " when a deployable card is played with a freeDeploy or freePlay", async() => {

		let fakeCardPrototype, comm, commCopy, commCopyTwo, valid, serverComm

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  rarity: 1,
		  actionPointCost: 3,
		  attackValue: 3,
		  healthValue: 3,
		  actionOne: 0,
		  actionTwo: 0,
		  actionThree: 0,
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  amount: 12345,
		}

		comm = {
            action: 'play',
            turn: 1,
            cardPrototypeId: 216,
            actions: {
            	0: {
            		target: 'friend',
            		id: 2
            	},
            	0: {
            		target: 'enemy',
            		id: 1
            	},
            	0: {
            		target: 'self',
            		id: 99999
            	}
            },
            lane: 1,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined
		}

		commCopy = JSON.parse(JSON.stringify(comm));
		commCopyTwo = JSON.parse(JSON.stringify(comm));

		gl.game.cardPrototypes[216] = fakeCardPrototype
		gl.game.cardPrototypesLength++
		playerOne.dev = 0
		playerOne.freeDeploy++
		playerOne.hand.push({id: 216})

		expect(playerOne.freeDeploy).toBe(1)

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.processAction = jest.fn(({actionId, actionsObject, cardPrototypeId, playerNumber, lane}) => {
			expect(actionId).toBe(0)
			expect(cardPrototypeId).toBe(216)
			expect(playerNumber).toBe(1)
			expect(lane).toBe(1)
			return true
		})

		gl.emitMessage = jest.fn(({message, comm, playerNumber}) => {
			expect(message).toMatch('server-accepted-play')
			expect(playerNumber).toBe(1)
			return
		})

		gl.clearDead = jest.fn(() => {
			return
		})

		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(serverComm.responseOne).toBeTruthy()
		expect(serverComm.responseTwo).toBeTruthy()
		expect(serverComm.responseThree).toBeTruthy()

		expect(playerOne.dev).toBe(0)
		expect(playerOne.freeDeploy).toBe(0)
		expect(playerOne.deployed.length).toBe(1)
		expect(playerOne.deployed[0].cardPrototypeId).toBe(216)
		expect(playerOne.deployed[0].lane).toBe(1)
		expect(playerOne.discard.length).toBe(1)
		expect(playerOne.discard[0].id).toBe(216)

		expect(gl.processAction).toBeCalled()
		expect(gl.emitMessage).toBeCalled()
		expect(gl.clearDead).toBeCalled()

		playerOne.dev = 0
		playerOne.hand.push({id: 216})
		playerOne.freePlay++

		expect(playerOne.freePlay).toBe(1)

		serverComm = await gl.submitMove(commCopy)

		expect(serverComm.status).toMatch('accepted')
		expect(serverComm.responseOne).toBeTruthy()
		expect(serverComm.responseTwo).toBeTruthy()
		expect(serverComm.responseThree).toBeTruthy()

		expect(playerOne.freePlay).toBe(0)
		expect(playerOne.dev).toBe(0)
		expect(playerOne.freeDeploy).toBe(0)
		expect(playerOne.deployed.length).toBe(2)
		expect(playerOne.deployed[1].cardPrototypeId).toBe(216)
		expect(playerOne.deployed[1].lane).toBe(1)
		expect(playerOne.discard.length).toBe(2)
		expect(playerOne.discard[1].id).toBe(216)

		expect(gl.processAction).toBeCalled()
		expect(gl.emitMessage).toBeCalled()
		expect(gl.clearDead).toBeCalled()

		playerOne.dev = 0
		playerOne.hand.push({id: 216})
		playerOne.freePlay++
		playerOne.freeDeploy++

		expect(playerOne.freePlay).toBe(1)
		expect(playerOne.freeDeploy).toBe(1)

		serverComm = await gl.submitMove(commCopyTwo)

		expect(serverComm.status).toMatch('accepted')
		expect(serverComm.responseOne).toBeTruthy()
		expect(serverComm.responseTwo).toBeTruthy()
		expect(serverComm.responseThree).toBeTruthy()

		expect(playerOne.freePlay).toBe(1)
		expect(playerOne.dev).toBe(0)
		expect(playerOne.freeDeploy).toBe(0)
		expect(playerOne.deployed.length).toBe(3)
		expect(playerOne.deployed[2].cardPrototypeId).toBe(216)
		expect(playerOne.deployed[2].lane).toBe(1)
		expect(playerOne.discard.length).toBe(3)
		expect(playerOne.discard[2].id).toBe(216)

		expect(gl.processAction).toBeCalled()
		expect(gl.emitMessage).toBeCalled()
		expect(gl.clearDead).toBeCalled()

	});
	test("GameLoop.processPlay should update game state and call methods as expected"
		+ " when a non-deployable card is played", async() => {

		let fakeCardPrototype, comm, commCopy, valid, serverComm

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  rarity: 1,
		  actionPointCost: 3,
		  attackValue: 3,
		  healthValue: 3,
		  actionOne: 0,
		  actionTwo: 0,
		  actionThree: 0,
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  deployable: false,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  amount: 12345,
		}

		comm = {
            action: 'play',
            turn: 1,
            cardPrototypeId: 216,
            actions: {
            	0: {
            		target: 'friend',
            		id: 2
            	},
            	0: {
            		target: 'enemy',
            		id: 1
            	},
            	0: {
            		target: 'self',
            		id: 99999
            	}
            },
            lane: undefined,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined
		}

		commCopy = JSON.parse(JSON.stringify(comm));

		gl.game.cardPrototypes[216] = fakeCardPrototype
		gl.game.cardPrototypesLength++
		playerOne.dev = 3
		playerOne.hand.push({id: 216})

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.processAction = jest.fn(({actionId, actionsObject, cardPrototypeId, playerNumber, lane}) => {
			expect(actionId).toBe(0)
			expect(cardPrototypeId).toBe(216)
			expect(playerNumber).toBe(1)
			expect(lane).not.toBeDefined()
			return true
		})

		gl.emitMessage = jest.fn(({message, comm, playerNumber}) => {
			expect(message).toMatch('server-accepted-play')
			expect(playerNumber).toBe(1)
			return
		})
		gl.clearDead = jest.fn(() => {
			return
		})

		playerOne.deployFighter = jest.fn(() => {
			return
		})

		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(serverComm.responseOne).toBeTruthy()
		expect(serverComm.responseTwo).toBeTruthy()
		expect(serverComm.responseThree).toBeTruthy()

		expect(playerOne.deployed.length).toBe(0)
		expect(playerOne.deployFighter).not.toBeCalled()
		expect(playerOne.discard.length).toBe(1)
		expect(playerOne.discard[0].id).toBe(216)

		expect(gl.processAction).toBeCalled()
		expect(gl.emitMessage).toBeCalled()
		expect(gl.clearDead).toBeCalled()
	})
	test("GameLoop.processMove should update game state and call methods as expected"
		+ " when a fighter is moved", async() => {

		let comm, commCopy, valid, serverComm

		comm = {
            action: 'move',
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: {
            	id: 3,
            	lane: 2
            },
            commanded: undefined
		}

		commCopy = JSON.parse(JSON.stringify(comm));

		playerOne.deployFighter(cardPrototype118, 0)
		playerOne.deployFighter(cardPrototype118, 0)
		playerOne.deployFighter(cardPrototype118, 1)

		playerOne.deployed[2].moved = false		
		playerOne.deployed[2].commanded = false

		expect(playerOne.deployed[2].id).toBe(3)

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.clearDead = jest.fn(() => {
			return
		})


		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(playerOne.deployed[2].moved).toBeTruthy()
		expect(playerOne.deployed[2].lane).toBe(2)
		expect(playerOne.deployed.length).toBe(3)

		expect(gl.clearDead).toBeCalled()

		expect(game.history[game.history.length - 1]).toMatchObject({
			playerNumber: 1,
			playerAction: 'move',
			oldLane: 1,
			newLane: 2,
			turnNumber: 1,
			specials: []
		})
	})
	test("GameLoop.processCommand should update game state and call methods as expected"
		+ " when a player commands a fighter to attack the opponent", async() => {

		let comm, commCopy, commCopyTwo, valid, serverComm

		comm = {
            action: 'command',
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: {
            	friendId: 1,
            	enemyId: 0
            }
		}

		commCopy = JSON.parse(JSON.stringify(comm));
		commCopyTwo = JSON.parse(JSON.stringify(comm));

		cardPrototype118.attackValue = 3

		playerOne.deployFighter(cardPrototype118, 0)
		playerOne.deployFighter(cardPrototype118, 1)
		playerOne.deployFighter(cardPrototype118, 2)

		playerOne.deployed[0].commanded = false
		playerOne.deployed[0].moved = false
		playerOne.deployed[1].commanded = false
		playerOne.deployed[1].moved = false
		playerOne.deployed[2].commanded = false
		playerOne.deployed[2].moved = false

		gl.hitDev = jest.fn((val, defender) => {
			expect(val).toBe(1)
			expect(defender.number).toBe(2)
		})
		gl.hitDeck = jest.fn((val, defender) => {
			expect(val).toBe(1)
			expect(defender.number).toBe(2)
		})
		gl.applySpecials(({playerAction, attacker, defender, history}) => {
			expect(playerAction).toMatch('command')
			history.specials = []
			return
		})

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.clearDead = jest.fn(() => {
			return
		})

		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.clearDead).toBeCalled()
		expect(gl.hitDev).toBeCalled()
		expect(playerOne.deployed[0].commanded).toBeTruthy()
		expect(playerOne.health).toBe(30)

		expect(game.history[game.history.length - 1].playerNumber).toBe(1)
		expect(game.history[game.history.length - 1].playerAction).toMatch("command")
		expect(game.history[game.history.length - 1].turnNumber).toBe(1)
		expect(game.history[game.history.length - 1].attacker.id).toBe(1)
		expect(game.history[game.history.length - 1].defender.number).toBe(2)

		commCopy.commanded.friendId = 2

		valid = await gl.checkNewMove(commCopy)
		expect(valid.status).toMatch('new')

		serverComm = await gl.submitMove(commCopy)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.clearDead).toBeCalled()
		expect(playerOne.deployed[1].commanded).toBeTruthy()
		expect(playerTwo.health).toBe(27)

		commCopyTwo.commanded.friendId = 3

		valid = await gl.checkNewMove(commCopyTwo)
		expect(valid.status).toMatch('new')

		serverComm = await gl.submitMove(commCopyTwo)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.clearDead).toBeCalled()
		expect(gl.hitDeck).toBeCalled()
		expect(playerOne.deployed[2].commanded).toBeTruthy()
		expect(playerTwo.health).toBe(27)
	})
	test("GameLoop.processCommand should update game state and call methods as expected"
		+ " when a player commands a fighter to attack another fighter", async() => {

		let comm, commCopy, commCopyTwo, fakeCardPrototype, valid, serverComm

		comm = {
            action: 'command',
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: {
            	friendId: 1,
            	enemyId: 1
            }
		}

		commCopy = JSON.parse(JSON.stringify(comm));
		commCopyTwo = JSON.parse(JSON.stringify(comm));

		fakeCardPrototype = JSON.parse(JSON.stringify(cardPrototype118));
		fakeCardPrototype.attackValue = 3
		fakeCardPrototype.healthValue = 10

		playerOne.deployFighter(fakeCardPrototype, 0)
		playerOne.deployFighter(fakeCardPrototype, 1)
		playerOne.deployFighter(fakeCardPrototype, 2)

		playerTwo.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(fakeCardPrototype, 1)
		playerTwo.deployFighter(fakeCardPrototype, 2)

		playerOne.deployed[0].commanded = false
		playerOne.deployed[0].moved = false
		playerOne.deployed[1].commanded = false
		playerOne.deployed[1].moved = false
		playerOne.deployed[2].commanded = false
		playerOne.deployed[2].moved = false

		gl.applySpecials = jest.fn(({playerAction, attacker, defender, history}) => {
			expect(playerAction).toMatch('command')
			return
		})

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.clearDead = jest.fn(() => {
			return
		})

		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.clearDead).toBeCalled()
		expect(playerOne.deployed[0].commanded).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(7)

		expect(game.history[game.history.length - 1].playerNumber).toBe(1)
		expect(game.history[game.history.length - 1].playerAction).toMatch("command")
		expect(game.history[game.history.length - 1].turnNumber).toBe(1)
		expect(game.history[game.history.length - 1].attacker.id).toBe(1)
		expect(game.history[game.history.length - 1].defender.id).toBe(1)

		commCopy.commanded.friendId = 2

		serverComm = await gl.submitMove(commCopy)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.clearDead).toBeCalled()
		expect(playerOne.deployed[1].commanded).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(4)

		expect(game.history[game.history.length - 1].playerNumber).toBe(1)
		expect(game.history[game.history.length - 1].playerAction).toMatch("command")
		expect(game.history[game.history.length - 1].turnNumber).toBe(1)
		expect(game.history[game.history.length - 1].attacker.id).toBe(2)
		expect(game.history[game.history.length - 1].defender.id).toBe(1)

		commCopyTwo.commanded.friendId = 3
		commCopyTwo.commanded.enemyId = 2

		serverComm = await gl.submitMove(commCopyTwo)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.clearDead).toBeCalled()
		expect(playerOne.deployed[2].commanded).toBeTruthy()
		expect(playerTwo.deployed[1].health).toBe(7)

		expect(game.history[game.history.length - 1].playerNumber).toBe(1)
		expect(game.history[game.history.length - 1].playerAction).toMatch("command")
		expect(game.history[game.history.length - 1].turnNumber).toBe(1)
		expect(game.history[game.history.length - 1].attacker.id).toBe(3)
		expect(game.history[game.history.length - 1].defender.id).toBe(2)
	})
	test("GameLoop.processReact should update game state for actionId 15 (DISCARD_OPP)"
		+ " when provided a valid react comm", async() => {

		let comm, valid, result

		comm = {
            action: undefined,
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'react',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined,
            reactActionId: 15,
            reactAction: {
            	target: 'none',
            	id: [1,5,9]
            }
		}

		playerOne.hand = []
		playerOne.discard = []

		playerOne.hand.push({id: 1})
		playerOne.hand.push({id: 4})
		playerOne.hand.push({id: 5})
		playerOne.hand.push({id: 8})
		playerOne.hand.push({id: 9})

		playerOne.reactEvents.push({actionId: 15, value: 3})

		valid = await gl.checkNewReact(comm);
		expect(valid.status).toMatch('react')

		result = await gl.processReact(comm)

		expect(playerOne.hand.length).toBe(2)
		expect(playerOne.hand).not.toContainEqual({id: 1})
		expect(playerOne.hand).not.toContainEqual({id: 5})
		expect(playerOne.hand).not.toContainEqual({id: 9})
		expect(playerOne.hand).toContainEqual({id: 4})
		expect(playerOne.hand).toContainEqual({id: 8})

		expect(playerOne.discard.length).toBe(3)
		expect(playerOne.discard).toContainEqual({id: 1})
		expect(playerOne.discard).toContainEqual({id: 5})
		expect(playerOne.discard).toContainEqual({id: 9})

		expect(result.status).toMatch('accepted')
	})
	test("GameLoop.processReact should update game state for actionId 31 (OPP_DRAW_DISCARD_TGT)"
		+ " when provided a valid react comm", async() => {

		let comm, valid, result

		comm = {
            action: undefined,
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'react',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined,
            reactActionId: 31,
            reactAction: {
            	target: 'none',
            	id: [1,5,9]
            }
		}

		playerOne.hand = []
		playerOne.discard = []

		playerOne.discard.push({id: 1})
		playerOne.discard.push({id: 4})
		playerOne.discard.push({id: 5})
		playerOne.discard.push({id: 8})
		playerOne.discard.push({id: 9})

		playerOne.reactEvents.push({actionId: 31, value: 3})

		valid = await gl.checkNewReact(comm);
		expect(valid.status).toMatch('react')

		result = await gl.processReact(comm)

		expect(playerOne.hand.length).toBe(3)
		expect(playerOne.hand).toContainEqual({id: 1})
		expect(playerOne.hand).toContainEqual({id: 5})
		expect(playerOne.hand).toContainEqual({id: 9})
		expect(playerOne.hand).not.toContainEqual({id: 4})
		expect(playerOne.hand).not.toContainEqual({id: 8})

		expect(playerOne.discard.length).toBe(2)
		expect(playerOne.discard).toContainEqual({id: 4})
		expect(playerOne.discard).toContainEqual({id: 8})

		expect(result.status).toMatch('accepted')
	})
	test("GameLoop.processReact should pass through for actionId 29, 32"
		+ " (FREE_PLAY, DEPLOY) when provided a valid react comm", async() => {

		let comm, valid, result

		comm = {
            action: undefined,
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'react',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined,
            reactActionId: 29,
            reactAction: {
            	target: 'none',
            	id: []
            }
		}

		playerOne.reactEvents.push({actionId: 29, value: 1})

		result = await gl.processReact(comm)
		expect(result.status).toMatch('accepted')

		comm.reactActionId = 32
		playerOne.reactEvents = []
		playerOne.reactEvents.push({actionId: 32, value: 1})

		result = await gl.processReact(comm)
		expect(result.status).toMatch('accepted')		
	})
	test("GameLoop.processeEndTurn should update game state and call methods as expected"
		+ " when a player ends their turn", async() => {

		let comm, commCopy, valid, serverComm

		comm = {
            action: 'end',
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined
		}

		commCopy = JSON.parse(JSON.stringify(comm));

		gl.endTurn = jest.fn(({playerNumber, turn}) => {
			expect(playerNumber).toBe(1)
			expect(turn).toBe(1)
			return
		})

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		gl.clearDead = jest.fn(() => {
			return
		})

		serverComm = await gl.submitMove(comm)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.endTurn).toBeCalled()
		expect(gl.clearDead).toBeCalled()

		expect(game.history[game.history.length - 1]).toMatchObject({
			playerNumber: 1,
			playerAction: 'end',
			turnNumber: 1,
		})

		valid = await gl.checkNewMove(commCopy)
		expect(valid.status).toMatch('new')

		serverComm = await gl.submitMove(commCopy)

		expect(serverComm.status).toMatch('accepted')
		expect(gl.endTurn).toBeCalled()
		expect(gl.clearDead).toBeCalled()
	})
});



describe("GameLoop process submitted actions", () => {

	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game, matchmaking, gl, comm;
		
	beforeEach(() => {

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		newId = uuidv1();

		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		matchmaking = {};

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
	});


	test("GameLoop.processAction should process an action for"
		+" action id 0 (no action) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, valid, result

		actionId = 0
		actionsObject = {
			target: 'none',
			id: undefined
		}
		cardPrototypeId = 9999
		playerNumber = 1
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})

		expect(result).toBeTruthy()
	})
	test("GameLoop.processAction should process an action for"
		+" action id 1 (HEAL) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 1,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: false,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 1
		actionsObject = {
			target: 'self',
			id: [0]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()


		playerOne.health = 25

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(28)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(30)

		playerTwo.health = 25
		actionsObject.target = 'opponent'

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.health).toBe(28)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.health).toBe(30)


		playerOne.deployFighter(cardPrototype118, 0)
		playerOne.deployed[0].health -= 4
		actionsObject.target = 'friend'
		actionsObject.id = [1]

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed[0].health).toBe(playerOne.deployed[0].maxHealth - 1)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed[0].health).toBe(playerOne.deployed[0].maxHealth)

		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployed[0].health -= 4
		actionsObject.target = 'enemy'
		actionsObject.id = [1]

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(playerTwo.deployed[0].maxHealth - 1)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(playerTwo.deployed[0].maxHealth)

	})
	test("GameLoop.processAction should process an action for"
		+" action id 2 (DRAW_FROM_DECK) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 2,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: false,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 2
		actionsObject = {
			target: 'none',
			id: [0]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()


		cardOne = playerOne.deck[0]
		cardTwo = playerOne.deck[1]
		cardThree = playerOne.deck[2]
		playerOne.hand = []

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand[0]).toMatchObject(cardOne)
		expect(playerOne.hand[1]).toMatchObject(cardTwo)
		expect(playerOne.hand[2]).toMatchObject(cardThree)
		expect(playerOne.hand.length).toBe(3)

		playerOne.deck = []


		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand.length).toBe(3)

	})
	test("GameLoop.processAction should process an action for"
		+" action id 3 (DRAW_FROM_OP) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 3,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: false,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 3
		actionsObject = {
			target: 'none',
			id: [0]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()


		cardOne = {id: 1}
		cardTwo = {id: 200}
		cardThree = {id: 201}

		playerTwo.hand = []
		playerTwo.hand.push(cardOne)
		playerTwo.hand.push(cardTwo)
		playerTwo.hand.push(cardThree)

		playerOne.hand = []

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand).toContain(cardOne)
		expect(playerOne.hand).toContain(cardTwo)
		expect(playerOne.hand).toContain(cardThree)
		expect(playerOne.hand.length).toBe(3)


		playerTwo.hand = []


		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand.length).toBe(3)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 4 (DMG_ENEMY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 4,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 4
		actionsObject = {
			target: 'opponent',
			id: [0]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()
		expect(playerTwo.health).toBe(30)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.health).toBe(28)


		playerTwo.deployed = []
		playerTwo.deployFighter(fakeCardPrototype, 0)
		actionsObject.target = 'enemy'
		actionsObject.id = [1]

		expect(playerTwo.deployed[0].health).toBe(3)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(1)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(-1)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 5 (FRIEND) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 5,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 5
		actionsObject = {
			target: 'self',
			id: [0]
		}
		cardPrototypeId = 216
		playerNumber = 2
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()
		expect(playerTwo.health).toBe(30)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.health).toBe(28)


		playerTwo.deployed = []
		playerTwo.deployFighter(fakeCardPrototype, 0)
		actionsObject.target = 'friend'
		actionsObject.id = [1]

		expect(playerTwo.deployed[0].health).toBe(3)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(1)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(-1)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 6 (DRAW_DISCARD_TGT) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 6,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 6
		actionsObject = {
			target: 'none',
			id: []
		}
		cardPrototypeId = 216
		playerNumber = 2
		lane = undefined

		playerTwo.hand = []

		playerTwo.discard = []

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.hand.length).toBe(0)


		cardOne = {id: 1}
		cardTwo = {id: 2}
		cardThree = {id: 3}
		cardFour = {id: 100}
		cardFive = {id: 101}

		playerTwo.discard.push(cardFour)
		playerTwo.discard.push(cardOne)
		playerTwo.discard.push(cardTwo)
		playerTwo.discard.push(cardThree)
		playerTwo.discard.push(cardFive)

		actionsObject.id = [1,2,3]

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.hand).toContain(cardOne)
		expect(playerTwo.hand).toContain(cardTwo)
		expect(playerTwo.hand).toContain(cardThree)
		expect(playerTwo.hand.length).toBe(3)
		expect(playerTwo.hand).not.toContain(cardFour)

		actionsObject.id = [100]

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.hand).toContain(cardFour)
		expect(playerTwo.hand).toContain(cardFive)
		expect(playerTwo.hand.length).toBe(5)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 7 (PARALYZE_ENEMY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 7,
		  actionOneString: 'PARALYZE_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 1,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 7
		actionsObject = {
			target: 'none',
			id: [1]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined


		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployed[0].moved = false
		playerTwo.deployed[0].commanded = false
		expect(playerTwo.deployed[0].specialConditions.length).toBe(0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].specialConditions[0]).toMatchObject({
			condition: 'paralyze',
			timesUsed: 0,
			value: 3
		})
		expect(playerTwo.deployed[0].moved).toBeTruthy()
		expect(playerTwo.deployed[0].commanded).toBeTruthy()
	})
	test("GameLoop.processAction should process an action for"
		+" action id 8 (DMG_SELF) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 8,
		  actionOneString: 'PARALYZE_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 10,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 8
		actionsObject = {
			target: 'none',
			id: [1,2,3,4,5]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		expect(playerOne.health).toBe(30)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(20)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 9 (DMG_OPP_DEV) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 9,
		  actionOneString: 'PARALYZE_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 1,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 9
		actionsObject = {
			target: 'none',
			id: [1,2,3,4,5]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerTwo.maxDev = 5

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.maxDev).toBe(4)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 10 (DISCARD_SELF) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 3,
		  actionOne: 10,
		  actionOneString: 'DISCARD_SELF',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 10
		actionsObject = {
			target: 'none',
			id: [1,2,4]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		cardOne = {id: 1}
		cardTwo = {id: 2}
		cardThree = {id: 3}
		cardFour = {id: 4}
		cardFive = {id: 5}

		playerOne.hand = []
		playerOne.hand.push(cardOne)
		playerOne.hand.push(cardTwo)
		playerOne.hand.push(cardThree)
		playerOne.hand.push(cardFour)
		playerOne.hand.push(cardFive)

		playerOne.discard = []

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.discard).toContain(cardOne)
		expect(playerOne.discard).toContain(cardTwo)
		expect(playerOne.discard).toContain(cardFour)
		expect(playerOne.discard.length).toBe(3)


		actionsObject.id = [3,5]


		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.discard).toContain(cardThree)
		expect(playerOne.discard).toContain(cardFive)
		expect(playerOne.discard.length).toBe(5)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 11 (HEAL_FRIEND) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 11,
		  actionOneString: 'HEAL_FRIEND',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 11
		actionsObject = {
			target: 'self',
			id: [1,2,4,9999]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.health = 28

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(30)

		actionsObject.target = 'friend'
		actionsObject.id = [1]

		playerOne.deployFighter(fakeCardPrototype, 0)
		playerOne.deployed[0].health = 0

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed[0].health).toBe(3)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed[0].health).toBe(4)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 12 (DMG_SELF_DEV) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 12,
		  actionOneString: 'DMG_SELF_DEV',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 12
		actionsObject = {
			target: 'none',
			id: [1,2,4,9999]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.maxDev = 3

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.maxDev).toBe(1)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.maxDev).toBe(0)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 13 (SWAP_FIGHTERS) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			fighterOne, fighterTwo, fighterThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 13,
		  actionOneString: 'SWAP_FIGHTERS',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 1,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 13
		actionsObject = {
			target: 'none',
			id: [1, 2]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype118, 2)

		fighterOne = playerOne.deployed[0]
		fighterTwo = playerTwo.deployed[0]
		fighterThree = playerTwo.deployed[1]

		expect(playerOne.deployed.length).toBe(1)
		expect(playerTwo.deployed.length).toBe(2)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed.length).toBe(1)
		expect(playerTwo.deployed.length).toBe(2)
		expect(playerOne.deployCount).toBe(2)
		expect(playerOne.deployed[0].id).toBe(2)
		expect(playerOne.deployed[0].lane).toBe(0)
		expect(playerOne.deployed[0].moved).toBeTruthy()
		expect(playerOne.deployed[0].commanded).toBeTruthy()
		expect(playerOne.deployed[0].cardPrototypeId).toBe(118)

		expect(playerTwo.deployed[1].id).toBe(3)
		expect(playerTwo.deployed[1].lane).toBe(2)
		expect(playerTwo.deployed[1].cardPrototypeId).toBe(216)

		expect(playerOne.deployed).toContain(fighterThree)
		expect(playerTwo.deployed).toContain(fighterOne)

		expect(playerOne.deployed).not.toContain(fighterOne)
		expect(playerTwo.deployed).not.toContain(fighterThree)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 14 (KILL_ENEMY_HEALTH_LT_COST) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			fighterOne, fighterTwo, fighterThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 14,
		  actionOneString: 'KILL_ENEMY_HEALTH_LT_COST',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 1,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 14
		actionsObject = {
			target: 'none',
			id: [2]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(fakeCardPrototype, 0)

		fighterOne = playerOne.deployed[0]
		fighterTwo = playerTwo.deployed[0]
		fighterThree = playerTwo.deployed[1]

		expect(playerOne.deployed.length).toBe(1)
		expect(playerTwo.deployed.length).toBe(2)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeFalsy()

		fakeCardPrototype.actionPointCost = 5

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()
		expect(playerTwo.deployed[1].health).toBe(4)

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[1].health).toBe(0)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 15 (DISCARD_OPP) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			fighterOne, fighterTwo, fighterThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 15,
		  actionOneString: 'DISCARD_OPP',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 15
		actionsObject = {
			target: 'none',
			id: []
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		expect(playerTwo.reactEvents.length).toBe(0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.reactEvents.length).toBe(1)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 16 (DMG) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			fighterOne, fighterTwo, fighterThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 16,
		  actionOneString: 'DMG',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 16
		actionsObject = {
			target: 'self',
			id: []
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(fakeCardPrototype, 0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(28)

		actionsObject.target = 'opponent'

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})
		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.health).toBe(28)

		actionsObject.target = 'friend'
		actionsObject.id = [1]

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed[0].health).toBe(2)

		actionsObject.target = 'enemy'
		actionsObject.id = [1]

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[0].health).toBe(2)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 17 (KILL_ENEMY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			fighterOne, fighterTwo, fighterThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 17,
		  actionOneString: 'KILL_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 17
		actionsObject = {
			target: 'none',
			id: [2,3]
		}
		cardPrototypeId = 216
		playerNumber = 2
		lane = undefined

		playerOne.deployFighter(fakeCardPrototype, 0)
		playerOne.deployFighter(fakeCardPrototype, 0)
		playerOne.deployFighter(fakeCardPrototype, 0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed[0].health).toBe(4)
		expect(playerOne.deployed[1].health).toBe(0)
		expect(playerOne.deployed[2].health).toBe(0)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 18 (DMG_OPP) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			fighterOne, fighterTwo, fighterThree, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 18,
		  actionOneString: 'DMG_OPP',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 10,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 18
		actionsObject = {
			target: 'none',
			id: [2,3,9999,9,9]
		}
		cardPrototypeId = 216
		playerNumber = 2
		lane = undefined

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(20)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 20 (GIVE_CARDS) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 20,
		  actionOneString: 'GIVE_CARDS',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 20
		actionsObject = {
			target: 'none',
			id: [4,7,9]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.hand = []
		playerTwo.hand = []

		cardOne 	= {id: 1}
		cardTwo 	= {id: 4}
		cardThree 	= {id: 5}
		cardFour 	= {id: 7}
		cardFive 	= {id: 9}

		playerOne.hand.push(cardOne)
		playerOne.hand.push(cardTwo)
		playerOne.hand.push(cardThree)
		playerOne.hand.push(cardFour)
		playerOne.hand.push(cardFive)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand.length).toBe(2)
		expect(playerOne.hand).toContain(cardOne, cardThree)
		expect(playerTwo.hand.length).toBe(3)
		expect(playerTwo.hand).toContain(cardTwo, cardFour, cardFive)

		actionsObject.id = [1,5]

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand.length).toBe(0)
		expect(playerTwo.hand.length).toBe(5)
		expect(playerTwo.hand).toContain(cardOne, cardThree)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 21 (DISCARD_AND_DRAW) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 21,
		  actionOneString: 'DISCARD_AND_DRAW',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 21
		actionsObject = {
			target: 'none',
			id: [1,4,5,7,9,100,200,110]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = undefined

		playerOne.hand = []
		playerTwo.hand = []

		cardOne 	= {id: 1}
		cardTwo 	= {id: 4}
		cardThree 	= {id: 5}
		cardFour 	= {id: 7}
		cardFive 	= {id: 9}
		cardSix 	= {id: 10}
		cardSeven 	= {id: 100}
		cardEight 	= {id: 200}
		cardNine 	= {id: 110}

		deckOne		= playerOne.deck[0]
		deckTwo		= playerOne.deck[1]
		deckThree	= playerOne.deck[2]
		deckFour	= playerOne.deck[3]
		deckFive	= playerOne.deck[4]
		deckSix		= playerOne.deck[5]
		deckSeven	= playerOne.deck[6]
		deckEight	= playerOne.deck[7]

		playerOne.hand.push(cardOne)
		playerOne.hand.push(cardTwo)
		playerOne.hand.push(cardThree)
		playerOne.hand.push(cardFour)
		playerOne.hand.push(cardFive)
		playerOne.hand.push(cardSix)
		playerOne.hand.push(cardSeven)
		playerOne.hand.push(cardEight)
		playerOne.hand.push(cardNine)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.hand.length).toBe(9)
		expect(playerOne.hand).toContain(deckOne, deckTwo, deckThree, deckFour,
			deckFive, deckSix, deckSeven, deckEight)
		expect(playerOne.hand).not.toContain(cardOne, cardTwo, cardThree, cardFour,
			cardFive, cardSeven, cardEight, cardNine)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 22 (ATTACK_ON_DEPLOY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 22,
		  actionOneString: 'ATTACK_ON_DEPLOY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 22
		actionsObject = {
			target: 'opponent',
			id: [2,2,3,4,999]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerOne.hand = []
		playerOne.hand.push({id: 216})

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.devHits).toBe(1)


		lane = 1

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.health).toBe(29)

		lane = 2

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deck.length).toBe(28)

		actionsObject.target = 'enemy'
		actionsObject.id = [2]

		playerTwo.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(fakeCardPrototype, 0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.deployed[1].health).toBe(3)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 25 (CONTROL_ENEMY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 25,
		  actionOneString: 'CONTROL_ENEMY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 25
		actionsObject = {
			target: 'none',
			id: [2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerTwo.deployFighter(fakeCardPrototype, 0)
		playerTwo.deployFighter(cardPrototype118, 0)
		playerTwo.deployFighter(cardPrototype122, 0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed.length).toBe(2)
		expect(playerOne.deployed[0].id).toBe(1)
		expect(playerOne.deployed[0].cardPrototypeId).toBe(118)
		expect(playerOne.deployed[1].id).toBe(2)
		expect(playerOne.deployed[1].cardPrototypeId).toBe(122)
		expect(playerTwo.deployed.length).toBe(1)
		expect(playerTwo.deployed[0].id).toBe(1)
		expect(playerTwo.deployed[0].cardPrototypeId).toBe(216)


		actionsObject.id = [1]

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.deployed.length).toBe(3)
		expect(playerOne.deployed[2].id).toBe(3)
		expect(playerOne.deployed[2].cardPrototypeId).toBe(216)
		expect(playerTwo.deployed.length).toBe(0)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 26 (BOOST_SELF_DEV) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 26,
		  actionOneString: 'BOOST_SELF_DEV',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 26
		actionsObject = {
			target: 'none',
			id: [2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerOne.maxDev = 1

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.maxDev).toBe(3)
	})
	test("GameLoop.processAction should process an action for"
		+" action id 27 (VIEW_FROM_OPP) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 27,
		  actionOneString: 'VIEW_FROM_OPP',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 27
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerTwo.hand = []
		playerTwo.hand.push({id: 1})
		playerTwo.hand.push({id: 2})

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(result).toContainEqual({id: 1})
		expect(result).toContainEqual({id: 2})

		playerTwo.hand.splice(0, 1)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(result).toContainEqual({id: 2})

		playerTwo.hand.push({id: 3})
		playerTwo.hand.push({id: 4})
		playerTwo.hand.push({id: 5})
		playerTwo.hand.push({id: 6})
		playerTwo.hand.push({id: 7})
		playerTwo.hand.push({id: 8})
		playerTwo.hand.push({id: 9})
		playerTwo.hand.push({id: 10})

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
	})
	test("GameLoop.processAction should process an action for"
		+" action id 28 (DRAW_DISCARD_RAND) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 28,
		  actionOneString: 'DRAW_DISCARD_RAND',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 2,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 28
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerOne.hand = []
		playerOne.discard = []

		playerOne.discard.push({id: 1})

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.discard.length).toBe(0)
		expect(playerOne.hand.length).toBe(1)
		expect(playerOne.hand).toContainEqual({id: 1})


		playerOne.discard.push({id: 2})
		playerOne.discard.push({id: 3})

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.discard.length).toBe(0)
		expect(playerOne.hand.length).toBe(3)
		expect(playerOne.hand).toContainEqual({id: 2})
		expect(playerOne.hand).toContainEqual({id: 3})


		playerOne.discard.push({id: 4})
		playerOne.discard.push({id: 5})
		playerOne.discard.push({id: 6})
		playerOne.discard.push({id: 7})

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.discard.length).toBe(2)
		expect(playerOne.hand.length).toBe(5)

		let arr = []
		for (let i = 0; i < playerOne.hand.length; i++) {
			if(playerOne.hand[i].id === 4) {
				arr.push(4)
			}
			if(playerOne.hand[i].id === 5) {
				arr.push(5)
			}
			if(playerOne.hand[i].id === 6) {
				arr.push(6)
			}
			if(playerOne.hand[i].id === 7) {
				arr.push(7)
			}
		}
		expect(arr.length).toBe(2)
		expect(arr[0]).not.toBe(arr[1])
	})
	test("GameLoop.processAction should process an action for"
		+" action id 29 (FREE_PLAY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 29,
		  actionOneString: 'FREE_PLAY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 29
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		expect(playerOne.freePlay).toBe(0)

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.freePlay).toBe(3)
		expect(playerOne.reactEvents[0]).toMatchObject({actionId: 29, value: 3})
		expect(playerOne.reactEvents[1]).toMatchObject({actionId: 29, value: 3})
		expect(playerOne.reactEvents[2]).toMatchObject({actionId: 29, value: 3})
	})
	test("GameLoop.processAction should process an action for"
		+" action id 30 (HEAL_SELF) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 30,
		  actionOneString: 'HEAL_SELF',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 30
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerOne.health = 29

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(30)

		playerOne.health = 5

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.health).toBe(8)

	})
	test("GameLoop.processAction should process an action for"
		+" action id 31 (OPP_DRAW_DISCARD_TGT) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 31,
		  actionOneString: 'OPP_DRAW_DISCARD_TGT',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 31
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerTwo.reactEvents[0]).toMatchObject({actionId: 31, value: 3})
		expect(playerTwo.reactEvents[1]).toMatchObject({actionId: 31, value: 3})
		expect(playerTwo.reactEvents[2]).toMatchObject({actionId: 31, value: 3})
	})
	test("GameLoop.processAction should process an action for"
		+" action id 32 (DEPLOY) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 32,
		  actionOneString: 'DEPLOY',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 3,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 32
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		playerOne.freeDeploy = 0

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(playerOne.freeDeploy).toBe(3)
		expect(playerOne.reactEvents.length).toBe(3)
		expect(playerOne.reactEvents[0]).toMatchObject({actionId: 32, value: 3})
		expect(playerOne.reactEvents[1]).toMatchObject({actionId: 32, value: 3})
		expect(playerOne.reactEvents[2]).toMatchObject({actionId: 32, value: 3})
	})
	test("GameLoop.processAction should process an action for"
		+" action id 33 (VIEW_FROM_DECK_SELF) and resolve true", async () => {

		let actionId, actionsObject, cardPrototypeId, 
			playerNumber, lane, fakeCardPrototype, valid, 
			cardOne, cardTwo, cardThree, cardFour, cardFive, 
			cardSix, cardSeven, cardEight, cardNine, deckOne, deckTwo,
			deckThree, deckFour, deckFive, deckSix, deckSeven, deckEight, result

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 4,
		  attackValue: 1,
		  healthValue: 4,
		  actionOne: 33,
		  actionOneString: 'VIEW_FROM_DECK_SELF',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 5,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}
		globalPrototypes[216] = fakeCardPrototype
		cardPrototypesLength++

		actionId = 33
		actionsObject = {
			target: 'none',
			id: [2,3,9999,1,2,3]
		}
		cardPrototypeId = 216
		playerNumber = 1
		lane = 0

		deckOne 	= playerOne.deck[0]
		deckTwo 	= playerOne.deck[1]
		deckThree 	= playerOne.deck[2]
		deckFour	= playerOne.deck[3]
		deckFive 	= playerOne.deck[4]

		valid = await gl.checkActionValid({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber
		})

		expect(valid).toBeTruthy()

		result = await gl.processAction({
			actionId: actionId,
			actionsObject: actionsObject,
			cardPrototypeId: cardPrototypeId,
			playerNumber: playerNumber,
			lane: lane
		})
		expect(result).toBeTruthy()
		expect(result[0]).toMatchObject(deckOne)
		expect(result[1]).toMatchObject(deckTwo)
		expect(result[2]).toMatchObject(deckThree)
		expect(result[3]).toMatchObject(deckFour)
		expect(result[4]).toMatchObject(deckFive)
	})
})
describe("GameLoop processing loop for processing stack items", () => {

	let userOneCopy, userTwoCopy, playerOne,
		playerTwo, newId, game, matchmaking, gl, comm;
		
	beforeEach(() => {

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

		playerOne = new Player(userOne);
		playerTwo = new Player(userTwo);

		playerOne.deck = userOneCopy.deck;
		playerTwo.deck = userTwoCopy.deck;

		newId = uuidv1();

		game = new Game({
			id: newId, playerOne: playerOne, playerTwo: playerTwo, 
			actions: globalActions, prototypes: globalPrototypes, 
			actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
		});

		matchmaking = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
	});
	test("GameLoop.removeReactEvent should remove a react" 
		+ " event from the player's reactEvents array if it is not empty", async () => {

		gl.removeReactEvent(1)
		expect(game.playerOne.reactEvents.length).toBe(0)

		game.playerOne.reactEvents.push({blah: 'blah'})
		gl.removeReactEvent(1)
		expect(game.playerOne.reactEvents.length).toBe(0)
	});

	test("GameLoop.checkProcessing should set processing to undefined" 
		+ " if stack length is zero", async () => {

		gl.stack = []
		gl.processing = 'yes'
		gl.checkProcessing()
		expect(gl.processing).not.toBeDefined()
	});
	test("GameLoop.checkProcessing should call nextProcessing()" 
		+ " if stack length is non-zero and nothing is currently being processed", async (done) => {

		let comm = {blah: 'blah'}

		gl.nextProcessing = jest.fn(() => {
			expect(gl.processingCounter).toBe(0)
			expect(gl.processing).toMatchObject(comm)
			done()
		})

		gl.stack = []
		gl.stack.push(comm);
		gl.checkProcessing()
		expect(gl.nextProcessing).toBeCalled()
	});
	test("GameLoop.checkProcessing should clear processing " 
		+ " if comm is not processed within GameLoop.processingCounterLimit cycles", async (done) => {

		let comm = {blah: 'blah'}

		gl.nextProcessing = jest.fn(() => {

			expect(gl.processingCounter).toBe(0)
			expect(gl.processing).toMatchObject(comm)
			expect(gl.stack.length).toBe(1)

			gl.processingCounter += gl.processingCounterLimit + 1
			expect(gl.processingCounter).not.toBe(0)

			gl.checkProcessing()

			expect(gl.processingCounter).toBe(0)
			expect(gl.stack.length).toBe(0)
			expect(gl.processing).not.toBeDefined()

			done()
		})

		gl.stack = []
		gl.stack.push(comm)
		gl.checkProcessing()
		expect(gl.nextProcessing).toBeCalled()
	});
	test("GameLoop.checkProcessing should be called every 300ms " 
		+ "", async (done) => {

		let comm = {blah: 'blah'}

		gl.nextProcessing = jest.fn(() => {
			return;
		})

		gl.checkProcessing = jest.fn(() => {});

		jest.advanceTimersByTime(305);

		expect(gl.checkProcessing).toBeCalled()

		jest.advanceTimersByTime(305);

		expect(gl.checkProcessing).toBeCalled()

		jest.advanceTimersByTime(305);

		expect(gl.checkProcessing).toBeCalled()

		jest.advanceTimersByTime(305);

		expect(gl.checkProcessing).toBeCalled()

		jest.advanceTimersByTime(305);

		expect(gl.checkProcessing).toBeCalled()
		done()
	});
	test("GameLoop.checkProcessing should work as expected " 
		+ " when run automatically with setInterval", async (done) => {

		let comm = {blah: 'blah'}

		gl.nextProcessing = jest.fn(() => {
			return;
		})

		expect(gl.processing === undefined)
		expect(gl.stack.length).toBe(0)

		jest.advanceTimersByTime(300);

		expect(gl.processing === undefined)
		expect(gl.stack.length).toBe(0)

		gl.processing = {test: 'test'}

		jest.advanceTimersByTime(300)

		expect(gl.processing === undefined)

		gl.stack.push(comm)
		expect(gl.stack.length).not.toBe(0)

		jest.advanceTimersByTime(300)

		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).toMatchObject(comm)
		expect(gl.nextProcessing).toBeCalled()
		expect(gl.stack.length).not.toBe(0)

		jest.advanceTimersByTime(300)

		expect(gl.processingCounter).toBe(1)
		expect(gl.stack.length).not.toBe(0)

		for (let i = 1; i < gl.processingCounterLimit + 1; i++) {
			expect(gl.processingCounter).toBe(i)
			jest.advanceTimersByTime(300)
		}

		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).not.toBeDefined()
		expect(gl.stack.length).toBe(0)

		done()
	});
	test("GameLoop.checkProcessing should work as expected " 
		+ " when run automatically with setInterval", async (done) => {

		let comm = {blah: 'blah'}

		gl.nextProcessing = jest.fn(() => {
			return;
		})

		expect(gl.processing === undefined)
		expect(gl.stack.length).toBe(0)

		jest.advanceTimersByTime(300);

		expect(gl.processing === undefined)
		expect(gl.stack.length).toBe(0)

		gl.processing = {test: 'test'}

		jest.advanceTimersByTime(300)

		expect(gl.processing === undefined)

		gl.stack.push(comm)

		jest.advanceTimersByTime(300)

		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).toMatchObject(comm)
		expect(gl.nextProcessing).toBeCalled()

		jest.advanceTimersByTime(300)

		expect(gl.processingCounter).toBe(1)

		for (let i = 1; i < gl.processingCounterLimit + 1; i++) {
			expect(gl.processingCounter).toBe(i)
			jest.advanceTimersByTime(300)
		}

		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).not.toBeDefined()
		expect(gl.stack.length).toBe(0)

		done()
	});
	test("GameLoop.nextProcessing should reject an invalid 'new' comm" 
		+ " and remove it from GameLoop.stack", async (done) => {
		
		let comm = {
            action: 'play',
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined
		}

		gl.emitMessage = jest.fn(({message,comm,playerNumber}) => {
			expect(message).toMatch('server-rejected-invalid')
			expect(comm.status).toMatch('rejected')
			expect(playerNumber).toBe(comm.playerNumber)
			done()
		})

		gl.stack.push(comm)
		gl.processing = comm

		await gl.nextProcessing()

		expect(gl.emitMessage).toBeCalled()
		expect(gl.stack.length).toBe(0)
		expect(gl.processing).not.toBeDefined()
	});
	test("GameLoop.nextProcessing should process a valid 'new' comm" 
		+ " and remove it whether submitted successfully or not", async (done) => {
		
		let comm, fakeCardPrototype, valid
		comm = {
            action: 'play',
            turn: 1,
            cardPrototypeId: 216,
            actions: {
            	0: {
            		target: 'none',
            		id: []
            	},
            	0: {
            		target: 'none',
            		id: []
            	},
            	0: {
            		target: 'none',
            		id: []
            	}
            },
            lane: 0,
            status: 'new',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined
		}

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[216] = fakeCardPrototype

		playerOne.hand = []
		playerOne.hand.push({id: 216})

		gl.emitMessage = jest.fn(() => {})
		gl.pushState = jest.fn(() => {})
		gl.checkGameOver = jest.fn(() => {})

		gl.stack.push(comm)
		gl.processing = comm

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		await gl.nextProcessing()

		expect(gl.checkGameOver).toBeCalled()
		expect(gl.pushState).toBeCalled()
		expect(gl.stack.length).toBe(0)
		expect(gl.processing).not.toBeDefined()
		expect(gl.processingCounter).toBe(0)

		expect(game.playerOne.deployed[0].cardPrototypeId).toBe(216)
		expect(game.playerOne.hand.length).toBe(0)

		game.cardPrototypes[216] = fakeCardPrototype
		playerOne.hand.push({id: 216})
		playerOne.dev = 1
		gl.stack.push(comm)
		gl.processing = comm

		gl.submitMove = jest.fn((comm) => {
			comm.status = 'fake'
			return comm
		})

		gl.emitMessage = jest.fn(({ message,comm,playerNumber }) => {
			expect(message).toMatch('server-rejected-error')
			expect(comm).toMatchObject(comm)
			expect(playerNumber).toBe(comm.playerNumber)
			done()
		})

		valid = await gl.checkNewMove(comm)
		expect(valid.status).toMatch('new')

		await gl.nextProcessing()
		expect(gl.stack.length).toBe(0)
		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).not.toBeDefined()
		expect(gl.submitMove).toBeCalled()
		expect(gl.emitMessage).toBeCalled()
	});
	test("GameLoop.nextProcessing should reject an invalid 'react' comm" 
		+ " and remove it from GameLoop.stack", async (done) => {
		
		let comm, valid

		comm = {
            action: undefined,
            turn: 1,
            cardPrototypeId: undefined,
            actions: undefined,
            lane: undefined,
            status: 'react',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined,
            reactActionId: 15,
            reactAction: undefined
		}

		playerOne.hand.push({id: 1})
		playerOne.hand.push({id: 2})
		playerOne.hand.push({id: 3})

		playerOne.reactEvents.push({actionId: 15, value: 3})

		gl.emitMessage = jest.fn(({message,comm,playerNumber}) => {
			expect(message).toMatch('server-rejected-invalid')
			expect(comm.status).toMatch('rejected')
			expect(comm).toMatchObject(comm)
			expect(playerNumber).toBe(comm.playerNumber)
			done()
		})

		gl.stack.push(comm)
		gl.processing = comm

		await gl.nextProcessing()

		expect(gl.emitMessage).toBeCalled()
		expect(gl.stack.length).toBe(0)
		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).not.toBeDefined()
	});
	test("GameLoop.nextProcessing should process a valid 'react' comm" 
		+ " and remove it whether submitted successfully or not", async (done) => {
		
		let comm, fakeCardPrototype, valid
		comm = {
            action: 'play',
            turn: 1,
            cardPrototypeId: 216,
            actions: {
            	0: {
            		target: 'none',
            		id: []
            	},
            	0: {
            		target: 'none',
            		id: []
            	},
            	0: {
            		target: 'none',
            		id: []
            	}
            },
            lane: 0,
            status: 'react',
            message: 'Some fake message',
            playerNumber: 1,
            moved: undefined,
            commanded: undefined,
            reactActionId: 15,
            reactAction: {
            	target: 'none',
            	id: [1,2,3]
            }
		}

		fakeCardPrototype = {
		  _id: 216,
		  cardSet: 1,
		  setTitle: 'blah',
		  setTitleHex: 'blah',
		  rarity: 1,
		  actionPointCost: 1,
		  attackValue: 1,
		  healthValue: 1,
		  actionOne: 0,
		  actionOneString: 'HEAL',
		  actionTwo: 0,
		  actionTwoString: 'blah',
		  actionThree: 0,
		  actionThreeString: 'blah',
		  actionOneValue: 0,
		  actionTwoValue: 0,
		  actionThreeValue: 0,
		  title: 'blah',
		  titleHex: 'blah',
		  artist: 'blah',
		  artistHex: 'blah',
		  artUrl: 'blah',
		  imageUrl: 'blah',
		  flavorText: 'blah',
		  deployable: true,
		  blockNumber: 12345,
		  lastUpdateBlock: 12345,
		  priceEth: 'blah',
		  amount: 12345,
		}

		game.cardPrototypes[216] = fakeCardPrototype

		playerOne.discard = []
		playerOne.hand = []
		playerOne.hand.push({id: 1})
		playerOne.hand.push({id: 2})
		playerOne.hand.push({id: 3})

		playerOne.reactEvents.push({actionId: 15, value: 3})

		gl.emitMessage = jest.fn(() => {})
		gl.pushState = jest.fn(() => {})
		gl.checkGameOver = jest.fn(() => {})

		gl.stack.push(comm)
		gl.processing = comm

		valid = await gl.checkNewReact(comm)
		expect(valid.status).toMatch('react')

		await gl.nextProcessing()

		expect(gl.checkGameOver).toBeCalled()
		expect(gl.pushState).toBeCalled()
		expect(gl.stack.length).toBe(0)
		expect(gl.processing).not.toBeDefined()
		expect(gl.processingCounter).toBe(0)

		expect(playerOne.hand.length).toBe(0)
		expect(playerOne.discard.length).toBe(3)
		expect(playerOne.reactEvents.length).toBe(0)

		playerOne.hand = []
		playerOne.hand.push({id: 216})
		playerOne.dev = 1
		playerOne.freePlay = 1
		playerOne.reactEvents.push({actionId: 29, value: 1})

		comm.status = 'react'
		comm.reactActionId = 29
		comm.reactAction = {
			target: 'none',
			id: []
		}

		gl.stack.push(comm)
		gl.processing = comm

		valid = await gl.checkNewReact(comm)
		expect(valid.status).toMatch('new')

		comm.status = 'react'

		expect(playerOne.hand.length).toBe(1)

		await gl.nextProcessing()

		expect(gl.stack.length).toBe(0)
		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).not.toBeDefined()

		expect(playerOne.hand.length).toBe(0)
		expect(playerOne.discard[playerOne.discard.length - 1].id).toBe(216)
		expect(playerOne.freePlay).toBe(0)
		expect(playerOne.deployed[0].cardPrototypeId).toBe(216)

		comm.status = 'react'
		comm.reactActionId = 15
		comm.reactAction = {
			target: 'none',
			id: [1,2,3]
		}

		gl.stack.push(comm)

		playerOne.reactEvents.push({actionId: 15, value: 3})

		playerOne.hand.push({id: 1})
		playerOne.hand.push({id: 2})
		playerOne.hand.push({id: 3})

		valid = await gl.checkNewReact(comm)
		expect(valid.status).toMatch('react')

		gl.submitMove = jest.fn((comm) => {
			comm.status = 'rejected'
			return comm
		})

		gl.emitMessage = jest.fn(({message, comm, playerNumber}) => {
			expect(message).toMatch('server-rejected-error')
			expect(comm).toBeDefined()
			expect(playerNumber).toBe(comm.playerNumber)
			done()
		})

		await gl.nextProcessing()

		expect(gl.stack.length).toBe(0)
		expect(gl.processingCounter).toBe(0)
		expect(gl.processing).not.toBeDefined()
		expect(playerOne.reactEvents.length).toBe(0)
	});
});

describe('SocketIO networking', () => {
//https://medium.com/@tozwierz/testing-socket-io-with-jest-on-backend-node-js-f71f7ec7010f

	let userOneCopy, userTwoCopy, playerOne, playerTwo, 
		newId, game, matchmaking, gl, socketOne, socketTwo;

	beforeEach((done) => {

		socketOne = io.connect('http://[' + httpServerAddr.address + ']:' + httpServerAddr.port, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});

			socketOne.on('test-message-from-server', (data) => {
				socketOne.emit('response-from-client', data);
			});

			socketTwo.on('connect', () => {

				userOneCopy = JSON.parse(JSON.stringify(userOne));
				userTwoCopy = JSON.parse(JSON.stringify(userTwo));

				userOneCopy.deck = userOneCopy.decks[0].deckCards;
				userTwoCopy.deck = userTwoCopy.decks[0].deckCards;

				userOneCopy.socket = socketOne;
				userOneCopy.socketId = socketOne.id;

				userTwoCopy.socket = socketTwo;
				userTwoCopy.socketId = socketTwo.id;

				// console.log(userOneCopy);

				playerOne = new Player(userOneCopy);
				playerTwo = new Player(userTwoCopy);

				playerOne.deck = userOneCopy.deck;
				playerTwo.deck = userTwoCopy.deck;

				newId = uuidv1();

				game = new Game({
					id: newId, playerOne: playerOne, playerTwo: playerTwo, 
					actions: globalActions, prototypes: globalPrototypes, 
					actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength
				});

				matchmaking = new Matchmaking({
					prototypes: globalPrototypes,
					actions: globalActions,
					io: ioServer,
					cardPrototypesLength: cardPrototypesLength,
					actionsLength: actionsLength
				});

				gl = new GameLoop(game, userOneCopy, userTwoCopy, matchmaking);
				done();
			});

		});


	});

	afterEach((done) => {

	  if (socketOne) {
	    socketOne.disconnect();
	  }
	  if (socketTwo) {
	    socketTwo.disconnect();
	  }
	  done();

	});

	test('SocketIO GameLoop.userOne should receive emits from server', (done) => {
		expect(gl.userOne).toBeDefined();
		expect(gl.userTwo).toBeDefined();
		expect(gl.userOne.socket).toBeDefined();
		expect(gl.userTwo.socket).toBeDefined();

		gl.userOne.socket.on('test-message', (comm) => {
			expect(comm.test).toBe(3);
			done();
		});

		ioServer.emit('test-message', {test: 3});

	});
	test('SocketIO GameLoop.userTwo should receive emits from server', (done) => {
		expect(gl.userOne).toBeDefined();
		expect(gl.userTwo).toBeDefined();
		expect(gl.userOne.socket).toBeDefined();
		expect(gl.userTwo.socket).toBeDefined();

		//Clients can receive messages
		gl.userTwo.socket.on('test-message', (comm) => {
			expect(comm.test).toBe(8);
			done();
		});

		ioServer.emit('test-message', {test: 8});

	});
	test('SocketiO can send emits from client', (done) => {

		ioServer.on('connection', (mySocket) => {
			mySocket.on('test', (comm) => {
				expect(comm.test).toBe(87);
				done();
			});
		});

		let socketThree = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		let socketFour = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketThree.on('connect', () => {
			ioServer.emit('echo', 'Hello World');
			socketThree.once('echo', (message) => {
				// Check that the message matches
				expect(message).toBe('Hello World');
				socketThree.emit('test', {test: 87});
			});
		});

	});
});

describe('Matchmaking', () => {

	let userOneCopy, userTwoCopy, playerOne, playerTwo, 
		newId, game, gl, socketOne, socketTwo, socketThree;

	beforeEach((done) => {
		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userTwoCopy = JSON.parse(JSON.stringify(userTwo));

		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;
	    done();
	});
	afterEach((done) => {

	  if (socketOne) {
	    socketOne.disconnect();
	  }
	  if (socketTwo) {
	    socketTwo.disconnect();
	  }
	  if (socketThree) {
	    socketThree.disconnect();
	  }
	  done();
	});

	test('Should be able to make new Matchmaking without error', () => {
		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		expect(m.cardPrototypes).toMatchObject(globalPrototypes);
		expect(m.cardPrototypesLength).toBe(cardPrototypesLength);
		expect(m.actions).toMatchObject(globalActions);
		expect(m.actionsLength).toBe(actionsLength);
		expect(m.lobby).toMatchObject([]);
		expect(m.gameIdToGame).toMatchObject({});
		expect(m.gameIdToGameLoop).toMatchObject({});
		expect(m.io).toBeDefined();
		expect(m.socketIdToGameId).toMatchObject({});

	});

	test('New matchmaking connection should send server-request-authentication. Server responds server-failed-authentication', (done) => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});


		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketOne.on('server-request-authentication', () => {

				socketOne.emit('client-send-authentication', {user: userOneCopy});

			});

			socketOne.on('server-failed-authentication', (authenticated, data) => {
				expect(authenticated.authenticated).toBeFalsy();
				expect(data.user.ethAddress).toBeDefined();
				expect(data.user.token).toBeDefined();
				done();
			});

		});

	});
	test('Matchmaking.handleAuthentication should emit server-failed-authentication'
	+	'when incorect ethAdress provided', (done) => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.handleAuthentication = jest.fn();
		m.routeClientCommunication = jest.fn();

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketOne.on('server-request-authentication', () => {
				userOneCopy.ethAddress = '';
				userOneCopy.token = '**************REDACTED******************';


				socketOne.emit('client-send-authentication', {user: userOneCopy});

			});

			socketOne.on('server-failed-authentication', (authenticated, data) => {
				expect(authenticated.authenticated).toBeFalsy();
				expect(authenticated.message).toMatch('No address or token provided.');
				expect(data.user.ethAddress).toMatch('');
				expect(data.user.token).toBeDefined();

				expect(m.handleAuthentication).toBeCalled();
				expect(m.routeClientCommunication).not.toBeCalled();

				done();
			});

		});

	});
	test('Matchmaking.handleAuthentication should emit server-failed authentication'
		+ 'when incorrect token provided', (done) => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.handleAuthentication = jest.fn();
		m.routeClientCommunication = jest.fn();

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketOne.on('server-request-authentication', () => {
				userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
				userOneCopy.token = 'xxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyy.QlrcTfAAb6_H8yyg65SAWyLuAVzJ8o18NfW0lKuzzqw';


				socketOne.emit('client-send-authentication', {user: userOneCopy});

			});

			socketOne.on('server-failed-authentication', (authenticated, data) => {
				expect(authenticated.authenticated).toBeFalsy();
				expect(data.user.ethAddress).toMatch('0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73');
				expect(data.user.token).toBeDefined();
				expect(data.user.token).toMatch('xxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyy.QlrcTfAAb6_H8yyg65SAWyLuAVzJ8o18NfW0lKuzzqw');

				expect(m.handleAuthentication).toBeCalled();
				expect(m.routeClientCommunication).not.toBeCalled();

				done();
			});

		});

	});
	test('Matchmaking.handleAuthentication should emit server-error if error encountered', (done) => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		merkleUtils.verifyToken = jest.fn(() => {
			throw new Error();
		});

		m.handleAuthentication = jest.fn();
		m.routeClientCommunication = jest.fn();


		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketOne.on('server-request-authentication', () => {
				userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
				userOneCopy.token = 'xxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyy.QlrcTfAAb6_H8yyg65SAWyLuAVzJ8o18NfW0lKuzzqw';


				socketOne.emit('client-send-authentication', {user: userOneCopy});

			});

			socketOne.on('server-error', (message) => {

				expect(message.message).toMatch('Error during authentication handling.');

				expect(m.handleAuthentication).toBeCalled();
				expect(m.routeClientCommunication).not.toBeCalled();

				done();
			});

		});

	});
	test('Matchmaking.init should handle socket disconnect by removing user from lobby'
		+ 'and updating user with gameId in db', async (done) => {

		let fakeUserOne, fakeUserTwo, fakeUserThree;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.checkLobby = jest.fn(() => {
			return;
		});

		User.findByIdAndUpdate = jest.fn(() => {
			expect(m.lobby.length).toBe(3);
			expect(m.lobby[0]).toMatchObject(fakeUserOne);
			done();
			return;
		});

		m.handleAuthentication = jest.fn();
		m.routeClientCommunication = jest.fn();

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', async () => {

			userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
			userOneCopy.token = 'xxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyy.QlrcTfAAb6_H8yyg65SAWyLuAVzJ8o18NfW0lKuzzqw';
			userOneCopy.socket = socketOne;
			userOneCopy.socketId = socketOne.id.slice(0);

			fakeUserOne = {socket: {id: 'abcde123'}};
			fakeUserTwo = {socket: {id: 'abcde456'}};
			fakeUserThree = {socket: {id: 'abcde789'}};

			m.lobby.push(userOneCopy);
			m.lobby.push(fakeUserOne);
			m.lobby.push(fakeUserTwo);
			m.lobby.push(fakeUserThree);
			
			m.gameIdToGame['123'] = {fake: 7};
			m.gameIdToGameLoop['123'] = {
				fake: 8, 
				userOne: userOneCopy,
				userOneSocketId: socketOne.id.slice(0),
				userTwo: fakeUserTwo,
			};
			m.socketIdToGameId[socketOne.id] = '123';

			socketOne.on('server-request-authentication', async () => {

				socketOne.disconnect();

			});

		});

	});
	test('Matchmaking.init should remove initiated and authenticated'
		+ 'from socket on disconnect', async (done) => {

		let fakeUserOne, fakeUserTwo, fakeUserThree;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.checkLobby = jest.fn(() => {
			return;
		});

		User.findByIdAndUpdate = jest.fn(() => {
			expect(m.lobby.length).toBe(3);
			expect(m.lobby[0]).toMatchObject(fakeUserOne);
			expect(m.socketIdToInitiated[socketOne.id]).toBeUndefined();
			expect(m.socketIdToAuthenticated[socketOne.id]).toBeUndefined();
			done();
			return;
		});

		m.handleAuthentication = jest.fn();
		m.routeClientCommunication = jest.fn();

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', async () => {

			userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
			userOneCopy.token = 'xxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyy.QlrcTfAAb6_H8yyg65SAWyLuAVzJ8o18NfW0lKuzzqw';
			userOneCopy.socket = socketOne;
			userOneCopy.socketId = socketOne.id.slice(0);

			fakeUserOne = {socket: {id: 'abcde123'}};
			fakeUserTwo = {socket: {id: 'abcde456'}};
			fakeUserThree = {socket: {id: 'abcde789'}};

			m.lobby.push(userOneCopy);
			m.lobby.push(fakeUserOne);
			m.lobby.push(fakeUserTwo);
			m.lobby.push(fakeUserThree);
			
			m.gameIdToGame['123'] = {fake: 7};
			m.gameIdToGameLoop['123'] = {
				fake: 8, 
				userOne: userOneCopy,
				userOneSocketId: socketOne.id.slice(0),
				userTwo: fakeUserTwo,
			};
			m.socketIdToGameId[socketOne.id] = '123';

			socketOne.on('server-request-authentication', async () => {

				m.socketIdToInitiated[socketOne.id] = true;
				m.socketIdToAuthenticated[socketOne.id] = true;
				socketOne.disconnect();

			});

		});

	});
	test('Matchmaking.addUserToLobby should add to lobby and deep copy user socketId', async (done) => {

		let fakeUserOne, fakeUserTwo, fakeUserThree, fakeUserFour;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.checkLobby = jest.fn(() => {
			return;
		});

		m.handleAuthentication = jest.fn();
		m.routeClientCommunication = jest.fn();

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', async () => {

			userOneCopy.socket = socketOne;

			expect(m.lobby.length).toBe(0);

			m.addUserToLobby(userOneCopy);

			expect(m.lobby.length).toBe(1);
			expect(userOneCopy.socketId).toMatch(socketOne.id);

			m.addUserToLobby(userOneCopy);

			expect(m.lobby.length).toBe(1);

			fakeUserOne = {socket: {id: 'abcde123'}, gameId: 'aaaa'};

			m.addUserToLobby(fakeUserOne);

			expect(m.lobby.length).toBe(1);

			fakeUserTwo = {socket: {id: 'abcde456'}, inLobby: true};
			
			m.addUserToLobby(fakeUserTwo);

			expect(m.lobby.length).toBe(1);

			fakeUserThree = {socket: {id: 'abcde789'}};

			m.addUserToLobby(fakeUserThree);

			expect(m.lobby.length).toBe(2);

			m.addUserToLobby(fakeUserThree);

			expect(m.lobby.length).toBe(2);

			fakeUserFour = {exist: true};

			m.addUserToLobby(fakeUserFour);

			expect(m.lobby.length).toBe(2);

			done();

		});

	});
	test.skip('Matchmaking.init should setup socket to'
	+ 	'receive client-communication', async (done) => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.checkLobby = jest.fn(() => {
			return;
		});

		m.routeClientCommunication = jest.fn((comm, socket) => {
			console.log('in callback');
			if(!comm.fake) {
				expect(comm.status).toMatch('init');
				console.log('in here');
				return;
			}
			else {
				console.log('in end');
				expect(comm.fake).toBe(123);
				expect(socket).toBeDefined();
				expect(socket.id).toMatch(socketOne.id);
				done();
				return;
			}
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', async () => {
			userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
			userOneCopy.token = '******************REDACTED************************';

			socketOne.on('server-request-authentication', async () => {

				socketOne.emit('client-send-authentication', {user: userOneCopy});
			});

			socketOne.on('server-authenticated', (auth, data) => {
				console.log('server-authenticated');
				expect(m.socketIdToAuthenticated[socketOne.id]).toBeTruthy();
				jest.advanceTimersByTime(105);
			});

			setTimeout(() => {

				let comm = {notFake: true};
				comm.fake = 123;
				socketOne.emit('client-communication', comm);
			}, 100);

		});

	});
	test('Matchmaking.checkLobby should place users in match'
	+ 	' randomly if > 1 user in lobby', async () => {

		let fakeUserOne, fakeUserTwo, fakeUserThree,
			fakeUserFour, fakeUserFive;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.createMatch = jest.fn(({ userOne, userTwo }) => {
			let findOne = m.lobby.find((user) => {
				return user.socketId === userOne.socketId;
			});
			let findTwo = m.lobby.find((user) => {
				return user.socketId === userOne.socketId;
			});
			expect(findOne).toBeDefined();
			expect(findTwo).toBeDefined();
			return;
		});


		fakeUserOne = {user: true, socket: {id: 'abc'}, socketId: 'abc'};
		fakeUserTwo = {user: true, socket: {id: 'xyz'}, socketId: 'xyz'};
		fakeUserThree = {user: true, socket: {id: 'a'}, socketId: 'a'};
		fakeUserFour = {user: true, socket: {id: 'b'}, socketId: 'b'};
		fakeUserFive = {user: true, socket: {id: 'c'}, socketId: 'c'};

		expect(m.lobby.length).toBe(0);

		m.checkLobby();
		expect(m.createMatch).not.toBeCalled();

		m.addUserToLobby(fakeUserOne);
		expect(m.lobby.length).toBe(1);


		m.checkLobby();
		expect(m.lobby.length).toBe(1);
		expect(m.createMatch).not.toBeCalled();

		m.addUserToLobby(fakeUserTwo);
		expect(m.lobby.length).toBe(2);

		m.checkLobby();
		expect(m.createMatch).toBeCalled();

		m.addUserToLobby(fakeUserThree);
		expect(m.lobby.length).toBe(3);

		m.checkLobby();
		expect(m.createMatch).toBeCalled();

		m.addUserToLobby(fakeUserFour);
		expect(m.lobby.length).toBe(4);

		m.checkLobby();
		expect(m.createMatch).toBeCalled();

		m.addUserToLobby(fakeUserFive);
		expect(m.lobby.length).toBe(5);

		m.checkLobby();
		expect(m.createMatch).toBeCalled();

	});
	test('Matchmaking.createPlayers should create two players'
	+ 	' given two users', async () => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		userOneCopy.socket = {id: '123'};
		userTwoCopy.socket = {id: '456'};

		let players = m.createPlayers(userOneCopy, userTwoCopy);

		expect(players.created).toBeTruthy();
		expect(players).toBeDefined();
		expect(players.playerOne).toBeDefined();
		expect(players.playerTwo).toBeDefined();

		userOneCopy.decks = [];

		let playersTwo = m.createPlayers(userOneCopy, userTwoCopy);

		expect(playersTwo.playerOne).not.toBeDefined();
		expect(playersTwo.playerTwo).not.toBeDefined();
		expect(playersTwo.created).toBeFalsy();

		userOneCopy.decks = userOne.decks;

		let playersThree = m.createPlayers(userOneCopy, userTwoCopy);
		expect(players.created).toBeTruthy();
		expect(players).toBeDefined();
		expect(players.playerOne).toBeDefined();
		expect(players.playerTwo).toBeDefined();

		userOneCopy.socket = {};

		let playersFour = m.createPlayers(userOneCopy, userTwoCopy);

		expect(playersFour.playerOne).not.toBeDefined();
		expect(playersFour.playerTwo).not.toBeDefined();
		expect(playersFour.created).toBeFalsy();

	});
	test('Matchmaking.createDecks should create the selected deck'
	+ 	' for each user', async () => {

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		let result = m.createDecks(userOneCopy, userTwoCopy);

		expect(result.created).toBeTruthy();
		expect(result.deckOne).toMatchObject(userOneCopy.decks[0].deckCards);
		expect(result.deckTwo).toMatchObject(userTwoCopy.decks[0].deckCards);

	});
	test('Matchmaking.createMatch should initialize a new match'
	+ 	'', async (done) => {

		let gameIdOne, gameIdTwo, game, gameLoop

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', () => {

				userOneCopy.socket = socketOne;
				userTwoCopy.socket = socketTwo;

				m.addUserToLobby(userOneCopy);
				m.addUserToLobby(userTwoCopy);

				expect(m.lobby.length).toBe(2);

				m.createMatch({userOne: userOneCopy, userTwo: userTwoCopy});

				expect(m.lobby.length).toBe(0);

				gameIdOne = m.socketIdToGameId[userOneCopy.socket.id];
				gameIdTwo = m.socketIdToGameId[userTwoCopy.socket.id];

				expect(gameIdOne).toMatch(gameIdTwo);
				expect(gameIdOne).toBeDefined();
				expect(gameIdTwo).toBeDefined();

				game = m.gameIdToGame[gameIdOne];
				gameLoop = m.gameIdToGameLoop[gameIdOne];
				
				expect(gameLoop.game).toMatchObject(game);
				expect(gameLoop.id).toMatch(game.id);
				expect(gameLoop.matchmaking).toBeDefined();
				expect(gameLoop.userOne).toBeDefined();
				expect(gameLoop.userTwo).toBeDefined();
				expect(gameLoop.userOne.socket.id).toMatch(userOneCopy.socket.id);
				expect(gameLoop.userTwo.socket.id).toMatch(userTwoCopy.socket.id);
				expect(gameLoop.userOneSocketId).toMatch(userOneCopy.socket.id);
				expect(gameLoop.userTwoSocketId).toMatch(userTwoCopy.socket.id);

				expect(game.playerOne.number).toBe(1);
				expect(game.playerTwo.number).toBe(2);

				expect(game.playerOne.ethAddress).toMatch(userOneCopy.ethAddress);
				expect(game.playerTwo.ethAddress).toMatch(userTwoCopy.ethAddress);

				done();
			});
		});
	});
	test('Matchmaking.closeMatch should update Matchmaking '
	+ 	'data structures', async (done) => {

		let gameIdOne, gameIdTwo, game, gameLoop;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', () => {

				userOneCopy.socket = socketOne;
				userTwoCopy.socket = socketTwo;

				m.addUserToLobby(userOneCopy);
				m.addUserToLobby(userTwoCopy);;

				m.createMatch({userOne: userOneCopy, userTwo: userTwoCopy});

				gameIdOne = m.socketIdToGameId[userOneCopy.socket.id];
				gameIdTwo = m.socketIdToGameId[userTwoCopy.socket.id];

				expect(gameIdOne).toMatch(gameIdTwo);

				game = m.gameIdToGame[gameIdOne];
				gameLoop = m.gameIdToGameLoop[gameIdOne];
				
				expect(gameLoop.game).toMatchObject(game);
				expect(gameLoop.id).toMatch(game.id);
				expect(gameLoop.userOne).toBeDefined();
				expect(gameLoop.userTwo).toBeDefined();
				expect(gameLoop.userOne.socket.id).toMatch(userOneCopy.socket.id);
				expect(gameLoop.userTwo.socket.id).toMatch(userTwoCopy.socket.id);
				expect(gameLoop.userOneSocketId).toMatch(userOneCopy.socket.id);
				expect(gameLoop.userTwoSocketId).toMatch(userTwoCopy.socket.id);

				expect(game.playerOne.number).toBe(1);
				expect(game.playerTwo.number).toBe(2);

				expect(game.playerOne.ethAddress).toMatch(userOneCopy.ethAddress);
				expect(game.playerTwo.ethAddress).toMatch(userTwoCopy.ethAddress);

				gameLoop.userOne.socket.emit = jest.fn();
				gameLoop.userTwo.socket.emit = jest.fn();

				m.socketIdToAuthenticated[userOneCopy.socket.id] = true;
				m.socketIdToInitiated[userOneCopy.socket.id] = true;
				m.socketIdToAuthenticated[userTwoCopy.socket.id] = true;
				m.socketIdToInitiated[userTwoCopy.socket.id] = true;

				m.closeMatch(gameIdOne);

				expect(m.socketIdToAuthenticated[userOneCopy.socket.id]).toBeTruthy();
				expect(m.socketIdToAuthenticated[userTwoCopy.socket.id]).toBeTruthy();
				expect(m.socketIdToInitiated[userOneCopy.socket.id]).toBeUndefined();
				expect(m.socketIdToInitiated[userTwoCopy.socket.id]).toBeUndefined();
				expect(m.gameIdToGame[gameIdOne]).toBeUndefined();
				expect(m.gameIdToGameLoop[gameIdOne]).toBeUndefined();
				expect(m.socketIdToGameId[userOneCopy.socket.id]).toBeUndefined();
				expect(m.socketIdToGameId[userTwoCopy.socket.id]).toBeUndefined();

				expect(gameLoop.userOne.socket.emit).toBeCalled();
				expect(gameLoop.userTwo.socket.emit).toBeCalled();
				done()
			});
		});
	});
	test('Matchmaking.routeClientCommunication should'
	+ 	' add users to lobby on initial communication', async (done) => {

		let initComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'init',
            message: 'A new communication object was just created.',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.addUserToLobby = jest.fn((user) => {
			expect(user.decks).toMatchObject(m.genericDecks);
			expect(user.selectedDeck).toMatch("deckOne");
			expect(user.socket).toBeDefined();
			expect(user.socketId).toMatch(userOneCopy.socket.id);
			done();
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', () => {

				userOneCopy.socket = socketOne;
				userTwoCopy.socket = socketTwo;

				m.routeClientCommunication(initComm, userOneCopy.socket);
			});
		});
	});
	test('Matchmaking.routeClientCommunication init status should'
	+ 	'remove user.gameId if game no longer active', async (done) => {

		let user;

		let initComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'init',
            message: 'A new communication object was just created.',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.addUserToLobby = jest.fn(async (user) => {

			expect(user._id).toBe(user._id);
			expect(user.ethAddress).toMatch(user.ethAddress);
			expect(user.gameId).toMatch('');

			expect(user.decks).toMatchObject(m.genericDecks);
			expect(user.selectedDeck).toMatch("deckOne");
			expect(user.socket).toBeDefined();
			expect(user.socketId).toMatch(userOneCopy.socket.id);

			await User.deleteOne({_id: user._id});

			let tryFind = await User.find({_id: user._id});
			expect(tryFind.length).toBe(0);
			expect(tryFind[0]).toBeUndefined();

			done();
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', async () => {

				userOneCopy.socket = socketOne;
				userTwoCopy.socket = socketTwo;

				user = new User({
				  _id: 123456,
				  name: 'Test Name',
				  email: 'test@place.com',
				  ethAddress: '0x123',
				  mailingAddress: 'blah',
				  sendPromoEmail: true,
				  decks: userOneCopy.decks,
				  selectedDeck: 'deckOne',
				  userName: 'Patrick',
				  gameId: 'abc'
				});

				await user.save((err) => {
					m.routeClientCommunication(initComm, userOneCopy.socket);
				});

			});
		});
	});
	test('Matchmaking.routeClientCommunication init status should'
	+ 	'set user to a gameLoop if they are rejoining an existing game', async (done) => {

		let firstUser, secondUser, initComm;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		m.getUser = jest.fn((ethAddress) => {
			if(m.getUser.mock.calls.length === 1) {
				expect(m.getUser.mock.calls[0][0].ethAddress).toMatch(firstUser.ethAddress);
			}
			if(m.getUser.mock.calls.length === 2) {
				expect(m.getUser.mock.calls[1][0].ethAddress).toMatch(firstUser.ethAddress);
			}			
			return firstUser;
		});

		initComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'init',
            message: 'A new communication object was just created.',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		firstUser = new User({
		  _id: 123456,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x123',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});
		
		secondUser = new User({
		  _id: 654321,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x456',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', async () => {

				socketThree = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
					'reconnection delay': 0,
					'reopen delay': 0,
					'force new connection': true,
					transports: ['websocket'],
				});	

				socketThree.on('connect', async() => {

					await firstUser.save(async (err) => {
						await secondUser.save(async (err) => {

							firstUser.socket = socketOne;
							firstUser.socketId = socketOne.id.slice(0);
							secondUser.socket = socketTwo;
							secondUser.socketId = socketTwo.id.slice(0);

							let actions = m.actions;
							let prototypes = m.cardPrototypes;
							let actionsLength = m.actionsLength;
							let cardPrototypesLength = m.cardPrototypesLength;

							//Create players
							let players = m.createPlayers(firstUser, secondUser);

							//Create decks (and assign to players inside createDecks)
							let decks = m.createDecks(firstUser, secondUser);

							players.playerOne.deck = decks.deckOne;
							players.playerTwo.deck = decks.deckTwo;

							//Create game and gameLoop
							let gameId = 'abc';
							let game = new Game({ id: gameId, playerOne: players.playerOne, playerTwo: players.playerTwo, 
							actions: actions, prototypes: prototypes, actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength });
							let gameLoop = new GameLoop(game, firstUser, secondUser);

							//Update matchmaking states
							m.gameIdToGame[gameId] = game;
							m.gameIdToGameLoop[gameId] = gameLoop;
							m.socketIdToGameId[socketOne.id] = gameId;
							m.socketIdToGameId[socketTwo.id] = gameId;

							m.socketIdToAuthenticated[socketOne.id] = true;

							expect(m.gameIdToGame['abc']).toMatchObject(game);
							expect(m.gameIdToGameLoop['abc'].id).toMatch(gameLoop.id);
							expect(m.socketIdToGameId[socketOne.id]).toMatch('abc');
							expect(m.socketIdToGameId[socketTwo.id]).toMatch('abc');

							expect(gameLoop.userOne.socket.id).toMatch(socketOne.id);
							expect(gameLoop.userTwo.socket.id).toMatch(socketTwo.id);

							m.socketIdToInitiated[socketOne.id] = true;
							m.socketIdToAuthenticated[socketThree.id] = true;


							await m.routeClientCommunication(initComm, socketOne);
							await m.routeClientCommunication(initComm, socketThree);

							expect(gameLoop.userOne.socket.id).toMatch(socketThree.id);
							expect(gameLoop.userOneSocketId).toMatch(socketThree.id);
							expect(m.socketIdToGameId[socketThree.id]).toMatch('abc');
							done();
						});
					});	
				});
			});
		});
	});
	test('Matchmaking.routeClientCommunication requestState status should'
	+ 	' pass player state to player by emitting server-request-state', async (done) => {

		let firstUser, secondUser, requestComm;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		requestComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'requestState',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		firstUser = new User({
		  _id: 123456,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x123',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});
		
		secondUser = new User({
		  _id: 654321,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x456',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', async () => {

				socketThree = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
					'reconnection delay': 0,
					'reopen delay': 0,
					'force new connection': true,
					transports: ['websocket'],
				});	

				socketThree.on('connect', async() => {

					await firstUser.save(async (err) => {
						await secondUser.save(async (err) => {

							firstUser.socket = socketOne;
							firstUser.socketId = socketOne.id.slice(0);
							secondUser.socket = socketTwo;
							secondUser.socketId = socketTwo.id.slice(0);

							let actions = m.actions;
							let prototypes = m.cardPrototypes;
							let actionsLength = m.actionsLength;
							let cardPrototypesLength = m.cardPrototypesLength;

							//Create players
							let players = m.createPlayers(firstUser, secondUser);

							//Create decks (and assign to players inside createDecks)
							let decks = m.createDecks(firstUser, secondUser);

							players.playerOne.deck = decks.deckOne;
							players.playerTwo.deck = decks.deckTwo;

							//Create game and gameLoop
							let gameId = 'abc';
							let game = new Game({ id: gameId, playerOne: players.playerOne, playerTwo: players.playerTwo, 
							actions: actions, prototypes: prototypes, actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength });
							let gameLoop = new GameLoop(game, firstUser, secondUser);

							//Update matchmaking states
							m.gameIdToGame[gameId] = game;
							m.gameIdToGameLoop[gameId] = gameLoop;
							m.socketIdToGameId[socketOne.id] = gameId;
							m.socketIdToGameId[socketTwo.id] = gameId;

							m.socketIdToAuthenticated[socketOne.id] = true;

							expect(m.gameIdToGame['abc']).toMatchObject(game);
							expect(m.gameIdToGameLoop['abc'].id).toMatch(gameLoop.id);
							expect(m.socketIdToGameId[socketOne.id]).toMatch('abc');
							expect(m.socketIdToGameId[socketTwo.id]).toMatch('abc');

							expect(gameLoop.userOne.socket.id).toMatch(socketOne.id);
							expect(gameLoop.userTwo.socket.id).toMatch(socketTwo.id);

							m.socketIdToInitiated[socketOne.id] = true;

							socketOne.emit = jest.fn(async (message, comm) => {
								let testState = await gameLoop.getState(1);
								if(message === 'server-request-state') {
									expect(comm.playerNumber).toBe(1);
									expect(comm.state).toMatchObject(testState);
									done();
									return;
								}
								if(message === 'server-update-state') {
									return;
								}
							});

							await m.routeClientCommunication(requestComm, socketOne);
							expect(socketOne.emit).toBeCalled();
						});
					});	
				});
			});
		});
	});
	test('Matchmaking.routeClientCommunication new status should'
	+ 	' reject comm if it is not this players turn', async (done) => {

		let firstUser, secondUser, newComm;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		newComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'new',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		firstUser = new User({
		  _id: 123456,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x123',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});
		
		secondUser = new User({
		  _id: 654321,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x456',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', async () => {

				socketThree = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
					'reconnection delay': 0,
					'reopen delay': 0,
					'force new connection': true,
					transports: ['websocket'],
				});	

				socketThree.on('connect', async() => {

					await firstUser.save(async (err) => {
						await secondUser.save(async (err) => {

							firstUser.socket = socketOne;
							firstUser.socketId = socketOne.id.slice(0);
							secondUser.socket = socketTwo;
							secondUser.socketId = socketTwo.id.slice(0);

							let actions = m.actions;
							let prototypes = m.cardPrototypes;
							let actionsLength = m.actionsLength;
							let cardPrototypesLength = m.cardPrototypesLength;

							//Create players
							let players = m.createPlayers(firstUser, secondUser);

							//Create decks (and assign to players inside createDecks)
							let decks = m.createDecks(firstUser, secondUser);

							players.playerOne.deck = decks.deckOne;
							players.playerTwo.deck = decks.deckTwo;

							//Create game and gameLoop
							let gameId = 'abc';
							let game = new Game({ id: gameId, playerOne: players.playerOne, playerTwo: players.playerTwo, 
							actions: actions, prototypes: prototypes, actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength });
							let gameLoop = new GameLoop(game, firstUser, secondUser, m);

							//Update matchmaking states
							m.gameIdToGame[gameId] = game;
							m.gameIdToGameLoop[gameId] = gameLoop;
							m.socketIdToGameId[socketOne.id] = gameId;
							m.socketIdToGameId[socketTwo.id] = gameId;

							m.socketIdToAuthenticated[socketOne.id] = true;

							expect(m.gameIdToGame['abc']).toMatchObject(game);
							expect(m.gameIdToGameLoop['abc'].id).toMatch(gameLoop.id);
							expect(m.socketIdToGameId[socketOne.id]).toMatch('abc');
							expect(m.socketIdToGameId[socketTwo.id]).toMatch('abc');

							expect(gameLoop.userOne.socket.id).toMatch(socketOne.id);
							expect(gameLoop.userTwo.socket.id).toMatch(socketTwo.id);
							m.socketIdToInitiated[socketOne.id] = true;

							socketTwo.emit = jest.fn(async (message, comm) => {
								if(message === 'server-reject') {
									expect(comm.playerNumber).toBe(2);
									expect(comm.message).toMatch("You cannot submit a new move when it is not your turn.");
									done();
									return;
								}
								if(message === 'server-update-state') {
									return;
								}
							});

							await m.routeClientCommunication(newComm, socketTwo);
							expect(socketTwo.emit).toBeCalled();
						});
					});	
				});
			});
		});
	});
	test('Matchmaking.routeClientCommunication new status should'
	+ 	' add new comm to the gameLoop stack', async (done) => {

		let firstUser, secondUser, newComm;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		newComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'new',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		firstUser = new User({
		  _id: 123456,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x123',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});
		
		secondUser = new User({
		  _id: 654321,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x456',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', async () => {

				socketThree = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
					'reconnection delay': 0,
					'reopen delay': 0,
					'force new connection': true,
					transports: ['websocket'],
				});	

				socketThree.on('connect', async() => {

					await firstUser.save(async (err) => {
						await secondUser.save(async (err) => {

							firstUser.socket = socketOne;
							firstUser.socketId = socketOne.id.slice(0);
							secondUser.socket = socketTwo;
							secondUser.socketId = socketTwo.id.slice(0);

							let actions = m.actions;
							let prototypes = m.cardPrototypes;
							let actionsLength = m.actionsLength;
							let cardPrototypesLength = m.cardPrototypesLength;

							//Create players
							let players = m.createPlayers(firstUser, secondUser);

							//Create decks (and assign to players inside createDecks)
							let decks = m.createDecks(firstUser, secondUser);

							players.playerOne.deck = decks.deckOne;
							players.playerTwo.deck = decks.deckTwo;

							//Create game and gameLoop
							let gameId = 'abc';
							let game = new Game({ id: gameId, playerOne: players.playerOne, playerTwo: players.playerTwo, 
							actions: actions, prototypes: prototypes, actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength });
							let gameLoop = new GameLoop(game, firstUser, secondUser);

							//Update matchmaking states
							m.gameIdToGame[gameId] = game;
							m.gameIdToGameLoop[gameId] = gameLoop;
							m.socketIdToGameId[socketOne.id] = gameId;
							m.socketIdToGameId[socketTwo.id] = gameId;

							m.socketIdToAuthenticated[socketOne.id] = true;

							expect(m.gameIdToGame['abc']).toMatchObject(game);
							expect(m.gameIdToGameLoop['abc'].id).toMatch(gameLoop.id);
							expect(m.socketIdToGameId[socketOne.id]).toMatch('abc');
							expect(m.socketIdToGameId[socketTwo.id]).toMatch('abc');

							expect(gameLoop.userOne.socket.id).toMatch(socketOne.id);
							expect(gameLoop.userTwo.socket.id).toMatch(socketTwo.id);

							m.socketIdToInitiated[socketOne.id] = true;

							socketOne.emit = jest.fn(async (message, comm) => {
								if(message === 'server-add-move') {
									expect(comm.playerNumber).toBe(1);
									expect(comm.uuid).toBeDefined();
									expect(comm.submissionTime).toBeDefined();
									expect(gameLoop.stack[0]).toMatchObject(comm);
									done();
									return;
								}
								if(message === 'server-update-state') {
									return;
								}
							});

							await m.routeClientCommunication(newComm, socketOne);
							expect(socketOne.emit).toBeCalled();
						});
					});	
				});
			});
		});
	});
	test('Matchmaking.routeClientCommunication react status should'
	+ 	' add a react to the GameLoop stack even if not players turn', async (done) => {

		let firstUser, secondUser, newComm;

		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		newComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'react',
            message: 'Some fake message',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};

		firstUser = new User({
		  _id: 123456,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x123',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});
		
		secondUser = new User({
		  _id: 654321,
		  name: 'Test Name',
		  email: 'test@place.com',
		  ethAddress: '0x456',
		  mailingAddress: 'blah',
		  sendPromoEmail: true,
		  decks: userOneCopy.decks,
		  selectedDeck: 'deckOne',
		  userName: 'Patrick',
		  gameId: 'abc'
		});

		socketOne = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {

			socketTwo = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
				'reconnection delay': 0,
				'reopen delay': 0,
				'force new connection': true,
				transports: ['websocket'],
			});	

			socketTwo.on('connect', async () => {

				socketThree = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
					'reconnection delay': 0,
					'reopen delay': 0,
					'force new connection': true,
					transports: ['websocket'],
				});	

				socketThree.on('connect', async() => {

					await firstUser.save(async (err) => {
						await secondUser.save(async (err) => {

							firstUser.socket = socketOne;
							firstUser.socketId = socketOne.id.slice(0);
							secondUser.socket = socketTwo;
							secondUser.socketId = socketTwo.id.slice(0);

							let actions = m.actions;
							let prototypes = m.cardPrototypes;
							let actionsLength = m.actionsLength;
							let cardPrototypesLength = m.cardPrototypesLength;

							//Create players
							let players = m.createPlayers(firstUser, secondUser);

							//Create decks (and assign to players inside createDecks)
							let decks = m.createDecks(firstUser, secondUser);

							players.playerOne.deck = decks.deckOne;
							players.playerTwo.deck = decks.deckTwo;

							//Create game and gameLoop
							let gameId = 'abc';
							let game = new Game({ id: gameId, playerOne: players.playerOne, playerTwo: players.playerTwo, 
							actions: actions, prototypes: prototypes, actionsLength: actionsLength, cardPrototypesLength: cardPrototypesLength });
							let gameLoop = new GameLoop(game, firstUser, secondUser, m);

							//Update matchmaking states
							m.gameIdToGame[gameId] = game;
							m.gameIdToGameLoop[gameId] = gameLoop;
							m.socketIdToGameId[socketOne.id] = gameId;
							m.socketIdToGameId[socketTwo.id] = gameId;

							m.socketIdToAuthenticated[socketOne.id] = true;

							expect(m.gameIdToGame['abc']).toMatchObject(game);
							expect(m.gameIdToGameLoop['abc'].id).toMatch(gameLoop.id);
							expect(m.socketIdToGameId[socketOne.id]).toMatch('abc');
							expect(m.socketIdToGameId[socketTwo.id]).toMatch('abc');

							expect(gameLoop.userOne.socket.id).toMatch(socketOne.id);
							expect(gameLoop.userTwo.socket.id).toMatch(socketTwo.id);

							m.socketIdToInitiated[socketOne.id] = true;

							socketTwo.emit = jest.fn(async (message, comm) => {
								if(message === 'server-add-move') {
									expect(comm.playerNumber).toBe(2)
									expect(gameLoop.stack[0]).toMatchObject(comm)
									done()
									return
								}
							});

							await m.routeClientCommunication(newComm, socketTwo)
							expect(socketTwo.emit).toBeCalled()
						});
					});	
				});
			});
		});
	});
});
describe('Matchmaking - Working socketio but it just works when no other tests run ' + 
	'and also need a valid token and ethAddress from past 24 hours', () => {
	let userOneCopy, userTwoCopy, playerOne, playerTwo, 
		newId, game, gl, socketOne, socketTwo;

	afterEach((done) => {

	  if (socketOne) {
	    socketOne.disconnect();
	  }
	  if (socketTwo) {
	    socketTwo.disconnect();
	  }
	  done();

	});

	test.skip('Matchmaking.routeClientCommunication should emit'
	+ 	' server-added-to-lobby when user is added to lobby', async (done) => {

		let initComm = {
            action: '',
            type: '',
            cardPrototypeId: '',
            actionOne: '',
            actionTwo: '',
            actionThree: '',
            index: '',
            lane: '',
            token: '',
            ethAddress: '0x123',
            status: 'init',
            message: 'A new communication object was just created.',
            socketId: '',
            playerNumber: '',
            state: '',
            moved: ''
		};
		let m = new Matchmaking({
			prototypes: globalPrototypes,
			actions: globalActions,
			io: ioServer,
			cardPrototypesLength: cardPrototypesLength,
			actionsLength: actionsLength
		});

		userOneCopy = JSON.parse(JSON.stringify(userOne));
		userOneCopy.deck = userOneCopy.decks[0].deckCards;
		userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
		userOneCopy.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMHg1ZDdlZDZjNjkxY2U4NGRhNzA1MWViZTM4YTM3MzhkZGYxNGExYTczIiwiaWF0IjoxNTMyMzEzMTkzLCJleHAiOjE1MzIzOTk1OTN9.7q1E7BEKaPT_mOxV8VzLMh_VOykxSOXJLHUsTxbCDaI';
		socketOne = io.connect('http://[' + httpServerAddr.address + ']:' + httpServerAddr.port, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket'],
		});

		socketOne.on('connect', () => {
			userOneCopy.socketId = socketOne.id;
		});

		socketOne.on('server-request-authentication', (data) => {
			socketOne.emit('client-send-authentication', {user: userOneCopy});
		});

		socketOne.on('server-authenticated', () => {
			console.log('server-authenticated');
		});

		socketOne.on('server-added-to-lobby', () => {
			console.log('server-added-to-lobby');
			done();
		});
		
	});
});

// describe('Simulate a game being played', () => {
// 	let userOneCopy, userTwoCopy, playerOne, playerTwo, 
// 		newId, game, gl, m, socketOne, socketTwo;

// 	beforeEach((done) => {

// 		m = new Matchmaking({
// 			prototypes: globalPrototypes,
// 			actions: globalActions,
// 			io: ioServer,
// 			cardPrototypesLength: cardPrototypesLength,
// 			actionsLength: actionsLength
// 		})

// 		m.handleAuthentication = jest.fn((data, socket) => {
// 			let socketData = {
// 				data: {
// 					user: {
// 						token: data.token,
// 						ethAddress = data.ethAddress
// 					}
// 				}
// 			}
// 			return socketData
// 		})

// 		userOneCopy = JSON.parse(JSON.stringify(userOne));
// 		userOneCopy.deck = userOneCopy.decks[0].deckCards;
// 		userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
// 		userOneCopy.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMHg1ZDdlZDZjNjkxY2U4NGRhNzA1MWViZTM4YTM3MzhkZGYxNGExYTczIiwiaWF0IjoxNTMyMzEzMTkzLCJleHAiOjE1MzIzOTk1OTN9.7q1E7BEKaPT_mOxV8VzLMh_VOykxSOXJLHUsTxbCDaI';
		
// 		userTwoCopy = JSON.parse(JSON.stringify(userTwo));
// 		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;
// 		userTwoCopy.ethAddress = '0x000000000000000000000000000000000000001';
// 		userTwoCopy.token = 'blahblahblahZjNjkxY2U4NGRhNzA1MWViZTM4YTM3MzhkZGYxNGExYTczIiwiaWF0IjoxNTMyMzEzMTkzLCJleHAiOjE1MzIzOTk1OTN9.7q1E7BEKaPT_mOxV8VzLMh_VOykxSOXJLHUsTxbCDaI';

// 		socketOne = io.connect('http://[' + httpServerAddr.address + ']:' + httpServerAddr.port, {
// 			'reconnection delay': 0,
// 			'reopen delay': 0,
// 			'force new connection': true,
// 			transports: ['websocket'],
// 		});

// 		socketOne.on('connect', () => {
// 			userOneCopy.socketId = socketOne.id;

// 			socketTwo = io.connect('http://[' + httpServerAddr.address + ']:' + httpServerAddr.port, {
// 			'reconnection delay': 0,
// 			'reopen delay': 0,
// 			'force new connection': true,
// 			transports: ['websocket'],
// 			});
// 		});

// 		socketOne.on('server-request-authentication', (data) => {
// 			socketOne.emit('client-send-authentication', {user: userOneCopy});
// 		});

// 		socketOne.on('server-authenticated', () => {
// 			console.log('server-authenticated');
// 		});

// 		socketOne.on('server-added-to-lobby', () => {
// 			console.log('server-added-to-lobby');
// 			done();
// 		});

// 		socketT
// 	});


// 	afterEach((done) => {

// 	  if (socketOne) {
// 	    socketOne.disconnect();
// 	  }
// 	  if (socketTwo) {
// 	    socketTwo.disconnect();
// 	  }
// 	  done();

// 	});

// 	test.only("Simulate a game being played.", () => {

// 		userOneCopy = JSON.parse(JSON.stringify(userOne));
// 		userOneCopy.deck = userOneCopy.decks[0].deckCards;
// 		userOneCopy.ethAddress = '0x5D7ED6c691ce84da7051ebe38A3738dDF14A1A73';
// 		userOneCopy.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMHg1ZDdlZDZjNjkxY2U4NGRhNzA1MWViZTM4YTM3MzhkZGYxNGExYTczIiwiaWF0IjoxNTMyMzEzMTkzLCJleHAiOjE1MzIzOTk1OTN9.7q1E7BEKaPT_mOxV8VzLMh_VOykxSOXJLHUsTxbCDaI';
		
// 		userTwoCopy = JSON.parse(JSON.stringify(userTwo));
// 		userTwoCopy.deck = userTwoCopy.decks[0].deckCards;
// 		userTwoCopy.ethAddress = '0x000000000000000000000000000000000000001';
// 		userTwoCopy.token = 'blahblahblahZjNjkxY2U4NGRhNzA1MWViZTM4YTM3MzhkZGYxNGExYTczIiwiaWF0IjoxNTMyMzEzMTkzLCJleHAiOjE1MzIzOTk1OTN9.7q1E7BEKaPT_mOxV8VzLMh_VOykxSOXJLHUsTxbCDaI';

// 		socketOne = io.connect('http://[' + httpServerAddr.address + ']:' + httpServerAddr.port, {
// 			'reconnection delay': 0,
// 			'reopen delay': 0,
// 			'force new connection': true,
// 			transports: ['websocket'],
// 		});

// 		socketOne.on('connect', () => {
// 			userOneCopy.socketId = socketOne.id;
// 		});

// 		socketOne.on('server-request-authentication', (data) => {
// 			socketOne.emit('client-send-authentication', {user: userOneCopy});
// 		});

// 		socketOne.on('server-authenticated', () => {
// 			console.log('server-authenticated');
// 		});

// 		socketOne.on('server-added-to-lobby', () => {
// 			console.log('server-added-to-lobby');
// 			done();
// 		});
// 	})
// });


