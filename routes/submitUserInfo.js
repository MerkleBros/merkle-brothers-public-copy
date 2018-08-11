var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var merkleUtils = require('../modules/merkle-utilities');

//Save user information to database using User model
router.post('/', async function (req, res) {
	//Verify token is authentic
	try {
		var token = req.headers['x-access-token'];
		var address = req.body.user.ethAddress;
		let authPromise = await merkleUtils.verifyToken(address, token);
		if(!authPromise.authenticated || !authPromise) {
			authPromise.savedUserInfo = false;
			console.log('not authenticated: ' + authPromise);
			res.status(401).send(authPromise);
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Failed to authenticate, please try again', 'savedUserInfo': false});
		return;
	}

	try {
		//Request user is same as user that received token, save information to database
		User.findOneAndUpdate({'ethAddress': address}, {'name': req.body.user.name, 'email': req.body.user.email, 'mailingAddress': req.body.user.mailingAddress, 'sendPromoEmail': req.body.user.sendPromoEmails}, {'new': true, 'upsert': true}, function(e, result) {
		    if(e) {throw e;}
		    else {
		  		res.status(200).send({'message': "Your information was received! If you ordered a print, we'll send you an update email when it's time to ship. Thank you for supporting game development!",'savedUserInfo': true});
		  	}
		});
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': "Failed to update user information. Please return and try again.", 'savedUserInfo': false});
		return;
	}
});



module.exports = router;