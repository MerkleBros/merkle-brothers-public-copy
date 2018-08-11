//User can create a deck if they have been authenticated
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var merkleUtils = require('../modules/merkle-utilities.js');

router.get('/:address', async function (req, res) {

	//Get user address and web token from request
	try {
		var address = req.params.address.toLowerCase();
		var token = req.headers['x-access-token'];
		if (!address) {
			res.status(401).send({'message': 'Failed to retrieve address.', 'getDecks': false});
			return;
		}
		if(!token) {
			res.status(401).send({'message': 'Failed to retrieve authentication. No user login info was detected.', 'getDecks': false});
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Error retrieving address or login info from request.', 'getDecks': false});
		return;
	}

	//Verify token is authentic
	try {
		let authPromise = await merkleUtils.verifyToken(address, token);
		if(!authPromise.authenticated || !authPromise) {
			authPromise.getUser = false;
			res.status(401).send(authPromise);
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Failed to authenticate, please try again', 'getDecks': false});
		return;
	}

	//Get user's decks
	try {

		let query = User.find({ethAddress: address});
		let result = await query.lean().exec();
		let decks = result[0].decks;
		res.status(200).send(decks);

	} catch(e) {

		console.log(e);
		res.status(500).send({'message': 'Failed to get decks, please try again', 'getDecks': false});
		return;

	}
});

module.exports = router;