
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create action schema
var actionDeploySchema = new Schema({
  _id: {type: Number},
  action: String,
  description: String
});


module.exports = mongoose.model('ActionDeploy', actionDeploySchema);