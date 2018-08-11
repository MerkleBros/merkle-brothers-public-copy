var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var ethUtil = require('ethereumjs-util');

//Check user's signature information and return a JSON webtoken if signature is correct for given address
router.post('/', function (req, res) {
	var address = req.body.address;
	
	var message = "Please sign this message to confirm ownership of your account.";
	var messageBuffer = ethUtil.toBuffer(message);
	var msgHash = ethUtil.hashPersonalMessage(messageBuffer);
	var signature = req.body.userSignature;
	var signatureBuffer = ethUtil.toBuffer(signature);

	// const r = '0x' + signature.slice(0, 64);
	// const s = '0x' + signature.slice(64, 128);
	// const v = '0x' + signature.slice(128, 130);
	//const v_decimal = web3.toDecimal(v);

	var sig = ethUtil.fromRpcSig(signatureBuffer);
	var publicKey = ethUtil.ecrecover(msgHash, sig.v, sig.r, sig.s);
	var sender = ethUtil.publicToAddress(publicKey);
	var derivedAddress = ethUtil.bufferToHex(sender);

	if(derivedAddress == address) {
		var token = jwt.sign({user: req.body.address}, "************************************", {expiresIn: "1d"});
		res.status(200).send({success: 1, token: token});
	}
	else {
		res.status(500).send({err: "Signature mismatch, failed to authenticate with signed personal message."});
	}
});

module.exports = router;

//Checksig function from Metamask example
// function checkSig(req, res) {
//   var sig = req.sig;
//   var owner = req.owner;
//   // Same data as before
//   var data = ‘i am a string’;
//   var message = ethUtil.toBuffer(data)
//   var msgHash = ethUtil.hashPersonalMessage(message)
//   // Get the address of whoever signed this message  
//   var signature = ethUtil.toBuffer(sig)
//   var sigParams = ethUtil.fromRpcSig(signature)
//   var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
//   var sender = ethUtil.publicToAddress(publicKey)
//   var addr = ethUtil.bufferToHex(sender)
 
//   // Determine if it is the same address as 'owner' 
//   var match = false;
//   if (addr == owner) { match = true; }
//   if (match) {
//     // If the signature matches the owner supplied, create a
//     // JSON web token for the owner that expires in 24 hours.
//     var token = jwt.sign({user: req.body.addr}, ‘i am another string’,  { expiresIn: “1d” });
//     res.send(200, { success: 1, token: token })
//   } else {
//     // If the signature doesn’t match, error out
//     res.send(500, { err: ‘Signature did not match.’});
//   }
// }