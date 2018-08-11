
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create card prototype schema
var cardPrototypeSchema = new Schema({
  _id: {type: Number},
  cardSet: Number,
  setTitle: String,
  setTitleHex: String,
  rarity: Number,
  actionPointCost: Number,
  attackValue: Number,
  healthValue: Number,
  actionOne: Number,
  actionOneString: String,
  actionTwo: Number,
  actionTwoString: String,
  actionThree: Number,
  actionThreeString: String,
  actionOneValue: Number,
  actionTwoValue: Number,
  actionThreeValue: Number,
  title: String,
  titleHex: String,
  artist: String,
  artistHex: String,
  artUrl: String,
  imageUrl: String,
  flavorText: String,
  deployable: Boolean,
  blockNumber: Number,
  lastUpdateBlock: Number,
  priceEth: String,
  amount: Number,
}, {timestamps: {}});

module.exports = mongoose.model('CardPrototype', cardPrototypeSchema);