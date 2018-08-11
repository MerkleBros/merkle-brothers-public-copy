var express = require('express');
var router = express.Router();
var Token = require('../models/Token');

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the home page route
router.get('/:address', function (req, res) {
	var _address = req.params.address.toLowerCase();

	Token.find({address: _address}, function(e, result) {
		res.send(result);
	});
});
// define the about route
// router.get('/about', function (req, res) {
//   res.send('About birds')
// })

module.exports = router;