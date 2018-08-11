var express = require('express');
var router = express.Router();
var CardPrototype = require('../models/CardPrototype');

// define the route for retrieving card prototypes that belong to the art set (set = 9000, rarity = 200)
//Rest of filtering (amount available, price of art) is done in front-end
router.get('/', function (req, res) {

	//Lean sets query to return a plain JS object instead of a mongoose model
	//Mongoose models cannot be altered
	CardPrototype.find({cardSet: 9000}).lean().exec(function(e, result) {
		if(e) {
			res.send('Error finding art!')
		}

		res.send(result);
	});
});

module.exports = router;