var express = require('express');
var router = express.Router();
var TotemPrototype = require('../models/TotemPrototype');

// define the route for retrieving all exisiting totem prototypes
router.get('/', function (req, res) {

	TotemPrototype.find({}, function(e, result) {
		res.send(result);
	});
});

module.exports = router;