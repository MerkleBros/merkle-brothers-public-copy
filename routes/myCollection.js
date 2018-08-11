var express = require('express');
var router = express.Router();
var Token = require('../models/Token');


// define the home page route
router.get('/', function (req, res) {
	res.sendFile('public/my-collection', {root: '/'});
});
// define the about route
// router.get('/about', function (req, res) {
//   res.send('About birds')
// })

module.exports = router;