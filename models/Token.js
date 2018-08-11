
//NOTE - MONGODB SAVES address AS A LOWERCASE STRING FOR SOME REASON
//DOING TOKEN.FIND({'0xA123'}) WILL NOT RETURN BUT TOKEN.FIND({'0xa123'}) WILL
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create token schema
var tokenSchema = new Schema({
  _id: {type: String},
  address: {type: String, index: true},
  cardPrototypeId: Number,
  blockNumber: Number
}, {timestamps:{}});

module.exports = mongoose.model('Token', tokenSchema);