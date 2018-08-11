
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create CardSetDeploy schema
var cardSetDeploySchema = new Schema({
  _id: {type: Number},
  setTitle: String,
  setRarity: Number,
});


module.exports = mongoose.model('CardSetDeploy', cardSetDeploySchema);