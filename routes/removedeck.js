//User can remove a deck if they have been authenticated
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var merkleUtils = require('../modules/merkle-utilities.js');

router.post('/:address', async function (req, res) {

	//Get user address, deck info, web token from request
	try {
		var address = req.params.address.toLowerCase();
		var deck = req.body.deck;
		var token = req.headers['x-access-token'];
		if (!address) {
			res.status(401).send({'message': 'Failed to remove deck. No address was provided.', 'removeDeck': false});
			return;
		}
		if(!deck) {
			res.status(401).send({'message': 'Failed to remove deck. No new deck was provided.', 'removeDeck': false});
			return;
		}
		if(!token) {
			res.status(401).send({'message': 'Failed to remove deck. No user login info was detected.', 'removeDeck': false});
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Error retrieving address, deck, or login info from request.', 'removeDeck': false});
		return;
	}

	//Verify token is authentic
	try {
		let authPromise = await merkleUtils.verifyToken(address, token);
		if(!authPromise.authenticated || !authPromise) {
			authPromise.removeDeck = false;
			res.status(401).send(authPromise);
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Failed to authenticate, please try again', 'removeDeck': false});
		return;
	}

	//Verify deck exists and remove it if so
	try {
		let removePromise = await removeDeck(address, deck);

		if (!removePromise.removeDeck || !removePromise) {
			res.status(401).send(removePromise);
			return;
		}

		res.status(200).send(removePromise);
		return;
	} catch(e) {
		console.log(e);
		res.status(401).send({'message': 'Failed to save deck, please try again.', 'removeDeck': false});
		return;
	}

	async function removeDeck(address, deck) {
		return new Promise(async function(resolve,reject) {

			User.findOneAndUpdate({'ethAddress': address}, {$pull: {decks: {'deckName': deck.deckName}}}, {'new': false, 'upsert': true}, function(e, result) {
			    if(e) {
			    	resolve({'message': "Failed to remove deck. Please return and try again.", 'removeDeck': false});
			    	return;
			    }
			    else {
			    	resolve({'message': "Your deck was removed!",'removeDeck': true});
			  	}
			});

		});
	}
});

module.exports = router;