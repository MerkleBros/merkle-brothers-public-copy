var express = require('express');
var router = express.Router();


// define the history page route
router.get('/', function (req, res) {
	res.sendFile('public/history', {root: '/'});
});

module.exports = router;