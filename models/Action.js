
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create action schema
var actionSchema = new Schema({
  _id: {type: Number},
  action: String,
  actionHex: String,
  actionCreator: String,
  blockNumber: Number,
}, {timestamps: {}});


module.exports = mongoose.model('Action', actionSchema);