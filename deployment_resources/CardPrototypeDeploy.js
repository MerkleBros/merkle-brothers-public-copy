
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create card prototype schema
var cardPrototypeDeploySchema = new Schema({
  _id: {type: Number},
  cardSet: Number,
  rarity: Number,
  actionPointCost: Number,
  attackValue: Number,
  healthValue: Number,
  actionOne: Number,
  actionTwo: Number,
  actionThree: Number,
  actionOneValue: Number,
  actionTwoValue: Number,
  actionThreeValue: Number,
  cardTitle: String,
  cardArtist: String,
  flavorText: String,
});

module.exports = mongoose.model('CardPrototypeDeploy', cardPrototypeDeploySchema);