
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create set schema
var setSchema = new Schema({
  _id: {type: Number},
  setTitle: String,
  setTitleHex: String,
  setRarity: Number,
  setCreator: String,
  blockNumber: Number,
}, {timestamps: {}});


module.exports = mongoose.model('CardSet', setSchema);