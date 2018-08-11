var express = require('express');
var router = express.Router();
var CardPrototype = require('../models/CardPrototype');

// middleware that is specific to this router

// define the route for retrieving all exisiting card prototypes
router.get('/', function (req, res) {

	CardPrototype.find({}, function(e, result) {
		res.send(result);
	});
});
// define the about route
// router.get('/about', function (req, res) {
//   res.send('About birds')
// })

module.exports = router;