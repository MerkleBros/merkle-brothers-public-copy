var express = require('express');
var router = express.Router();
var CardPrototype = require('../models/CardPrototype');

// define the route for retrieving card prototypes that belong to the promo set and also retrieve founder's totems(set = 9000, rarity = 200)
//Rest of filtering (amount available, price of art) is done in front-end
router.get('/', function (req, res) {

	//Lean sets query to return a plain JS object instead of a mongoose model
	//Mongoose models cannot be altered
	var tempArray = [];

	var queryPromise = CardPrototype.find({cardSet: 9999});
	queryPromise.lean().exec();
	
	var queryPromiseTwo = queryPromise.then(function(result) {
		var newPromise = new Promise(function(resolve, reject) {
			resolve();
		});

		tempArray = result;
		return newPromise;
	});

	queryPromiseTwo.then(function() {
		CardPrototype.find({_id: {$in: [1,2,3]}}).lean().exec(function(e, result) {
			if(e) {res.send('Error finding founders totems');}

			//If results are found, add cardPrice and cardAmount fields for each card prototype
			if(result.length != 0 && result != undefined) {
				for (var i = 0; i < result.length; i++) {

					//Wrapper function to correct event loop
					(async function(j) {

						//Get price (in wei) and amount
						// var priceInWei = globalContractInstance.cardPrices.call(cardPrototype._id);
						// var amount = globalContractInstance.cardAmounts.call(cardPrototype._id).toNumber();
						// var priceInEth = globalWeb3.fromWei(priceInWei, 'ether');
						// result[j].price = priceInEth;
						// result[j].amount = amount;
						tempArray.push(result[j]);
					})(i);
				}
				res.send(tempArray);
			}
			else {
				res.send(tempArray);
			}
		});
	});
});

module.exports = router;