
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create totem prototype schema
var totemPrototypeSchema = new Schema({
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
  assignedSet: Number,
  assignedRarity: Number,
  blockNumber: Number,
  lastUpdateBlock: Number,
}, {timestamps: {}});

module.exports = mongoose.model('TotemPrototype', totemPrototypeSchema);