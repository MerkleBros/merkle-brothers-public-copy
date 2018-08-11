
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create user schema
var userSchema = new Schema({
  _id: {type: Number},
  name: String,
  email: String,
  ethAddress: String,
  mailingAddress: String,
  sendPromoEmail: Boolean,
  decks: [{deckName: String, deckCards: [{id: Number}]}],
  selectedDeck: String,
  userName: String,
  gameId: String
}, {timestamps: {}});


module.exports = mongoose.model('User', userSchema);