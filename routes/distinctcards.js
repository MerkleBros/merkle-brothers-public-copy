var express = require('express');
var router = express.Router();
var CardPrototype = require('../models/CardPrototype');
var Token = require('../models/Token');

// middleware that is specific to this router

// define the route for retrieving a user's unique card prototypes within a given set
router.get('/:address/:set', function (req, res) {

	var _address = req.params.address.toLowerCase();
	var _set = parseInt(req.params.set);
	Token.distinct({address: _address, set: _set}, function(e, result) {
		res.send(result);
	});
});
// define the about route
// router.get('/about', function (req, res) {
//   res.send('About birds')
// })

module.exports = router;