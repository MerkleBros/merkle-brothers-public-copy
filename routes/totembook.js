var express = require('express');
var router = express.Router();
var TotemToken = require('../models/TotemToken');


router.get('/:address', function (req, res) {
	var _address = req.params.address.toLowerCase();

	TotemToken.find({address: _address}, function(e, result) {
		res.send(result);
	});
});

module.exports = router;