/***************************************** Websockets **********************************/

var app, matchmaking, globalSocket, globalState, playerNumber, me, opponent;
var vueConstructed = false;
globalState = {};
playerNumber = 0;
me = "Retrieving player information.";
opponent = "Retrieving player information.";

async function connect() {

	if (typeof web3 === 'undefined') {
	  	console.log('Web3 was not detected when attempting to login.');
	  	return;
	}

	let accounts = await new Promise(function(resolve, reject) {
		web3.eth.getAccounts(function(error, accounts) {
		    resolve(accounts);
		});
	})

	let address = accounts[0];

	if(!address) {
		console.log('No web3 account detected.');
		return;
	}
	console.log(address);

	let user = {
		ethAddress: address
	};

	var socket = io();

	//Server is requesting authentication. Open and sign a Metamask message to get a cookie
	//Return cookie to server to check authentication
	socket.on('server-request-authentication', async function() {

		console.log('Authentication requested from server.');

		let cookie = getCookie('x-access-token');

		if(cookie) {
			user.token = cookie;
			setupEmits(socket, user);
			socket.emit('client-send-authentication', {user: user});

		}
		else {
			let loggedIn = await loginWeb3('x-access-token', web3);
			if (loggedIn) {
				
				cookie = getCookie('x-access-token');
				user.token = cookie;
				socket.emit('client-send-authentication', {user: user});
				setupEmits(socket, user);
			}
		}

	});
	globalSocket = socket;
	return socket;
}

async function setupEmits(socket, user) {

	console.log('start setting up sockets');

	//Server has verified a cookie, user is now authenticated on this socket
	socket.on('server-authenticated', async function(authenticated, user) {
		console.log('server-authenticated');
		console.log(authenticated.message);

	});

	//Server could not authenticate the user
	socket.on('server-failed-authentication', async function(authenticated, user) {
		console.log('server-failed-authentication');
		console.log(authenticated.message);

	});

	//Server added the user to the lobby for matchmaking
	socket.on('server-added-to-lobby', async function() {
		console.log('server-added-to-lobby');
		//Update page to show user waiting for game
	});

	//Server is starting a game
	socket.on('server-created-match', async function(gameState) {
		console.log('server-created-match');
	});

	//Server could not find the game
	socket.on('server-game-not-found', async function(gameState) {
		console.log('server-game-not-found');
	});

	//Server returned that game is over
	socket.on('server-game-over', async function(gameState) {
		console.log('server-game-over');
	});

	//Server returned that game is inactive
	socket.on('server-game-inactive', async function(gameState) {
		console.log('server-game-inactive');
	});

	//Server returned current game state at client's request (and only to this client)
	socket.on('server-request-state', async function(gameState) {
		//Process server game state and update client state
		console.log('server-request-state');
		console.log(gameState);
		setVueState(gameState.state);
	});

	//Server returned current game state
	socket.on('server-failed-create-match', async function(gameState) {
		console.log('server-failed-create-match');
	});
	//Submitted player comm did not have a valid player
	socket.on('server-player-not-found', async function(gameState) {
		console.log('server-player-not-found');
	});
	//Submitted player comm was rejected as invalid
	socket.on('server-rejected-invalid', async function(message) {
		console.log('server-rejected-invalid');
		console.log(message);
	});
	//Server failed to submit a validated move
	socket.on('server-rejected-error', async function(gameState) {
		console.log('server-rejected-error');
	});
	//Server pushed state to client
	socket.on('server-update-state', async function(gameState) {
		console.log('server-update-state');
		console.log(gameState);
		if(!app.gameInitiated && app) {
			app.gameInitiated = true;
		}
		setVueState(gameState);
	});
	//Server accepted a submitted 'play'. comm.response will contain any secrets that should only be shown to this player
	socket.on('server-accepted-play', async function(comm) {
		console.log('server-accepted-play');
		console.log(comm);
	});

	console.log('end setting up sockets');
}

async function sendCommunication(comm, socket) {

	socket.emit('client-communication', comm);
}
async function sendRequestState() {
	let comm = {
		status: 'requestState'
	};
	globalSocket.emit('client-communication', comm);
}

async function setVueState(state) {
	console.log('in setVueState');
	console.log(state);
	app.state = state
	app.playerNumber = state.playerNumber;
	if(app.playerNumber === 1) {
		app.me = app.state.playerOne;
		app.opponent = app.state.playerTwo;
	}
	if(app.playerNumber === 2) {
		app.me = app.state.playerTwo;
		app.opponent = app.state.playerOne;
	}
}
/***************************************Interacting with UI **************************************/

async function select(target) {

}



/***************************************** Client communication **********************************/

async function initGame(game) {
	//Called when 'server-create-game' emitted by server
	//Take in game object and create a client mirror for displaying state in browser
	//Set up the turn count timers based on the server timers state
}

async function playCard() {

	globalSocket.emit('client-communication', app.constructedCardComm);
	//Index is the index position of the card in the hand array
	//Logic for setting up state for playing a card
	//User tries to play card
	//Client checks validity of move
	//If valid, client updates state as if move was played
	//If resource, corresponding action logic is applied
	//If deployed, corresponding player information (new fighter created and added to player.deployed)
	//Either way, comm object updated and sent to server with new information
	//If server returns a conflict, respond with an emit telling client to wipe its game state and replace with server's
}

async function move() {
	//Move a friendly Fighter by clicking on it and clicking on a lane 
	//Clicking on a fighter selects the fighter. The selected fighter (or card or whatever) should be stored in the vue app
	//Clicking on the fighter again (or clicking another Fighter) will remove it from selected
	//Clicking on the lane will move the fighter (unless the clicked lane is the one it is currently in)
	//Clicking on the lane will construct and send a move comm using the selected Fighter's information (.lane)
	//Index is the index position of the fighter in the player.deployed array

	if(app.selectedFighter.moved !== false) {
		return;
	}

	let comm = {
		status: 'new',
		action: 'move',
		turn: app.state.turn,
		moved: {
			id: app.selectedFighter.id,
			lane: app.constructedCardComm.lane
		}
	};

	globalSocket.emit('client-communication', comm);

}

async function attack() {
	//Attack an enemy fighter/opponent by clicking on your fighter (or your character) and clicking on the enemy fighter (or opponent's character)
	//Clicking on fighter or character will select it.
	//Clicking on the enemy fighter or opponent will call attack() with the targeted enemy/opponent
	//
	//Index is the index position of your fighter, target is index position of enemy fighter, both in their respective arrays



}

async function endGame() {
	//Update state related to end of game
}

async function checkValid() {
	//Function for checking if a move is valid before sending to server (server also validates)
}

/***************************************** Initialization ****************************************/
let client = {
	connect: connect,
	setupEmits: setupEmits
}

client.socket = connect();

Vue.component('card-item', {
	props: ['card'],
	template: '<li v-on:click="selectCard($event, card)">{{card}}</li>'
});
Vue.component('fighter-item', {
	props: ['fighter'],
	template: '#fighterTemplate'
});

var app = new Vue({
  el: '#app',
  data: {
    state: {},
    playerNumber: 0,
    me: {},
    opponent: {},
    gameInitiated: false,
    selectedCard: {id: 1},
    selectedFighter: {id: 0, isSelected: false},
    cardComm: {
    	action: 'play',
    	status: 'new',
    	turn: 0,
    	lane: undefined,
    	cardPrototypeId: 0,
    	actions: {},
    	prep: {
    		actionOne: {
    			target: 'none',
    			id: []
    		},
    		actionTwo: {
    			target: 'none',
    			id: []
    		},
    		actionThree: {
    			target: 'none',
    			id: []
    		},
    	}
    }
  },
  mounted: function() {
  	let self = this;
    window.addEventListener('keyup', function(ev) {
        if(ev.key === "Enter") {
        	self.endTurn();
        }
    });
  },
  computed: {
  	constructedCardComm: function() {
  		if(!this.selectedCard) {return {};}
  		let comm = {};
  		comm.action = 'play';
  		comm.status = 'new';
  		comm.turn = this.state.turn;
  		comm.lane = parseInt(this.cardComm.lane);
  		comm.cardPrototypeId = this.selectedCard.id;
  		comm.actions = {};

  		let prototype = this.state.cardPrototypes[comm.cardPrototypeId];

		let actionIdOne = prototype.actionOne;
		let actionIdTwo = prototype.actionTwo;
		let actionIdThree = prototype.actionThree;

  		comm.actions[actionIdOne] = {
  			target: this.cardComm.prep.actionOne.target,
  			id: []
  		}

  		comm.actions[actionIdTwo] = {
  			target: this.cardComm.prep.actionTwo.target,
  			id: []
  		}

  		comm.actions[actionIdThree] = {
  			target: this.cardComm.prep.actionThree.target,
  			id: []
  		}

  		if( this.cardComm.prep.actionOne.id 					&& 
  			typeof this.cardComm.prep.actionOne.id === 'string' &&
  			this.cardComm.prep.actionOne.id.length > 0
		) {
			let x = this.cardComm.prep.actionOne.id.split(",").map((str) => parseInt(str));
  			comm.actions[actionIdOne].id = x
		}

  		if( this.cardComm.prep.actionTwo.id 					&& 
  			typeof this.cardComm.prep.actionTwo.id === 'string' &&
  			this.cardComm.prep.actionTwo.id.length > 0
		) {
			let x = this.cardComm.prep.actionTwo.id.split(",").map((str) => parseInt(str));
  			comm.actions[actionIdTwo].id = x
		}

  		if( this.cardComm.prep.actionThree.id 					&& 
  			typeof this.cardComm.prep.actionThree.id === 'string' &&
  			this.cardComm.prep.actionThree.id.length > 0
		) {
			let x = this.cardComm.prep.actionThree.id.split(",").map((str) => parseInt(str));
  			comm.actions[actionIdThree].id = x
		}

  		return comm;
  	}
  },
  methods: {
  	select: function(thing) {
  		console.log(thing);
  		console.log('select was called');
  	},
  	selectCard: function(card) {
  		if(this.selectedCard === selectedCard) {
  			this.selectedCard = undefined;
  		}
  		else {
	  		this.selectedCard = selectedCard;
  		}
  	},
  	selectFighter: function(fighter) {
  		if(!fighter) {return;}
  		if(this.selectedFighter) {
  			this.selectedFighter.isSelected = false;
  		}
  		if(this.selectedFighter === fighter) {
  			this.selectedFighter = undefined;
  		}
  		else {
  			fighter.isSelected = true;
	  		this.selectedFighter = fighter;
  		}
  	},
  	getFriendlyFightersByLane: function(lane) {
  		let fighters = this.me.deployed.filter((fighter) => {
  			return fighter.lane === lane;
  		});
  		return fighters;
  	},
	getEnemyFightersByLane: function(lane) {
  		let fighters = this.opponent.deployed.filter((fighter) => {
  			return fighter.lane === lane;
  		});
  		return fighters;
  	},
	endTurn: function() {
		console.log('call endturn');
		let comm = {
			status: 'new',
			action: 'end',
			turn: app.state.turn
		};
		globalSocket.emit('client-communication', comm);
	}
  }
})
