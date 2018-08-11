var jwt = require('jsonwebtoken');

//Authentication function for checking the JSON webtoken of a user
async function verifyToken(address, token) {
	//Check if token exists
	return new Promise(function(resolve,reject) {


		if(token == "" || token == undefined) {
			//Token does not exist, prompt user to get a token by signing a Metamask message
			resolve({'message': 'You are not logged in. Please authenticate by signing a Metamask message.', 'authenticated': false});
		}

		jwt.verify(token, '************************REDACTED***********************************', function(e, decoded) {
			if(e) {resolve({'message': 'Failed to authenticate, please try again', 'authenticated': false});}
			else {
				//Token is authentic. Check to make sure requesting user is same as user token was assigned to
				if(decoded.user == address.toLowerCase()) {
					resolve({'message': 'You are now logged in.', 'authenticated': true});
				}
				else {
					//Requesting user is different than user that received token
					resolve({'message': 'Authentication is for a different user, please switch accounts.', 'authenticated': false});
				}
			}
		});
	});
}

module.exports = {
	verifyToken: verifyToken
}