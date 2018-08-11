var express = require('express');
var router = express.Router();
var CardSet = require('../models/CardSet');

//Define the route for retrieving all card sets
router.get('/', function (req, res) {

	CardSet.find({}, function(e, result) {
		if(e) {
			res.send('Wow! Where are the sets at?');
		}
		else {
			res.send(result);
		}
		
	});
});

module.exports = router;