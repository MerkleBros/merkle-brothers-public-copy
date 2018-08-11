
//NOTE - MONGODB SAVES address AS A LOWERCASE STRING FOR SOME REASON
//DOING TOKEN.FIND({'0xA123'}) WILL NOT RETURN BUT TOKEN.FIND({'0xa123'}) WILL
var mongoose = require('mongoose');
var Schema = mongoose.Schema

//Create token schema
var totemTokenSchema = new Schema({
  _id: {type: String},
  address: {type: String, index: true},
  cardPrototypeId: Number,
  assignedSet: Number,
  assignedRarity: Number,
  usedArray: [Number], //Add setIds to this array as the totem is used to generate a card from each set
  lastUpdateBlock: Number,
  blockNumber: Number 
}, {timestamps:{}});

module.exports = mongoose.model('TotemToken', totemTokenSchema);