//User can create a deck if they have been authenticated
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var Token = require('../models/Token');
var merkleUtils = require('../modules/merkle-utilities.js');

router.post('/:address', async function (req, res) {
	//Get user address, deck info, web token from request
	try {
		//newDeck should be newDeck: {deckName: String, deckCards: [Number]} 
		//where numbers in deckCards are tokenIds
		//Deck should be saved in user database collection as {deckName: String, deckCards: [{id: Number}]} 
		//where id is the cardPrototypeId
		var address = req.params.address.toLowerCase();
		var newDeck = req.body.newDeck;
		var token = req.headers['x-access-token'];
		if (!address) {
			res.status(401).send({'message': 'Failed to save deck. No address was provided.', 'savedDeck': false});
			return;
		}
		if(!newDeck) {
			res.status(401).send({'message': 'Failed to save deck. No new deck was provided.', 'savedDeck': false});
			return;
		}
		if(!token) {
			res.status(401).send({'message': 'Failed to save deck. No user login info was detected.', 'savedDeck': false});
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Error retrieving address, new deck, or login info from request.', 'savedDeck': false});
		return;
	}

	//Verify token is authentic
	try {
		let authPromise = await merkleUtils.verifyToken(address, token);
		if(!authPromise.authenticated || !authPromise) {
			authPromise.savedDeck = false;
			res.status(401).send(authPromise);
			return;
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Failed to authenticate, please try again', 'savedDeck': false});
		return;
	}


	//Validate submitted deck
	try {
		let validatePromise = await validateDeck(address, newDeck);

		if (!validatePromise.validated || ! validatePromise) {
			validatePromise.savedDeck = false;
			res.status(401).send(validatePromise);
			return;
		}
		for ( let i = 0; i < validatePromise.cardPrototypeIdArray.length; i++) {
			newDeck.deckCards[i] = validatePromise.cardPrototypeIdArray[i];
		}
	} catch(e) {
		console.log(e);
		res.status(500).send({'message': 'Failed to validate deck, please try again.', 'savedDeck': false});
		return;
	}

	//Save submitted deck
	try {
		let savePromise = await saveDeck(address, newDeck);

		if (!savePromise.savedDeck || !savePromise) {
			res.status(401).send(savePromise);
			return;
		}

		res.status(200).send(savePromise);
		return;
	} catch(e) {
		console.log(e);
		res.status(401).send({'message': 'Failed to save deck, please try again.', 'savedDeck': false});
		return;
	}

	async function validateDeck(address, deck) {
		//Get user's tokens
		try {
			return new Promise(async function(resolve,reject) {
				//Check that deck has deckName and deckCards values
				if(!deck.deckName || !deck.deckCards) {
					resolve({'message': 'No deck name or cards provided', 'validated': false});
					return;
				}

				//Check that deck is between 30 and 50 cards
				if(deck.deckCards.length < 30 || deck.deckCards.length > 50) {
					resolve({'message': 'Deck length is not between 30 and 50 cards.', 'validated': false});
					return;
				}

				let query = Token.find({_id: {$in: deck.deckCards}});
				let result = await query.lean().sort({_id: 1}).exec();
				
				//Check that all cards in deck were found in db (all cards exist)
				//If card exists, check that each card is not included more than four times.
				let cardCountObject = {};
				let cardPrototypeIdArray = [];
				for (let i = 0; i < deck.deckCards.length; i++) {

					let cardId = deck.deckCards[i];

					let cardExists = false;


					for (let j = 0; j < result.length; j++) {
						
						let resultId = result[j]._id;

						//Check if card exists
						if (resultId == cardId) {
							cardExists = true;

							let resultPrototype = result[j].cardPrototypeId;

							//Keep count of card prototypes and return if card is included in deck > 4 times
							if (cardCountObject[resultPrototype]) {
								cardCountObject[resultPrototype]++;
								if(cardCountObject[resultPrototype] > 4) {
									resolve({'message': 'Decks can only have up to four of each card (TokenId: ' + resultId + '.)', 'validated': false});
									return;
								}
							}
							else {
								cardCountObject[resultPrototype] = 1;
							}

							let cardPrototypeIdObject = {};
							cardPrototypeIdObject.id = resultPrototype;
							cardPrototypeIdArray.push(cardPrototypeIdObject);

							break;
						}
					}
					
					if (cardExists == false) {
						resolve({'message': 'One or more of the cards you submitted (TokenId:' + cardId +') do not exist in the database.', 'validated': false});
						return;
					}
				}

				//Check that user owns all cards in deck
				for(let i = 0; i < result.length; i++) {
					if(result[i].address != address) {
						//If user doesn't own one of the cards in deck, return
						resolve({'message': 'You do not own one of the cards in this deck (TokenId:' + result[i]._id + ') Please try again.', 'validated': false});
						return;
					}
				}
				resolve({'message': 'Deck has been authenticated', 'validated': true, 'cardPrototypeIdArray': cardPrototypeIdArray});
			});
		} catch(e) {
			resolve({'message': "Failed to validate card deck. Please try again.", 'validated': false});
			return;
		}
	}

	async function saveDeck(address, deck) {
		return new Promise(async function(resolve,reject) {
			User.findOneAndUpdate({'ethAddress': address}, {$push: {decks: {deckName: deck.deckName, deckCards: deck.deckCards}}}, {'new': true, 'upsert': true}, function(e, result) {
			    if(e) {
			    	resolve({'message': "Failed to save deck. Please return and try again.", 'savedDeck': false});
			    	return;
			    }
			    else {
			    	resolve({'message': "Your deck was saved!",'savedDeck': true});
			  	}
			});

		});
	}
});

module.exports = router;