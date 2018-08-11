
//Login for web3
function loginWeb3(tokenName, web3) {
  return new Promise(function(resolve, reject) {

    let cookie = getCookie(tokenName);

    if (typeof web3 == 'undefined' || typeof web3 === 'undefined') {
    	console.log('Web3 was not detected when attempting to login.');
      reject(false);
    	return;
    }

    var xhr = new XMLHttpRequest();
  	xhr.open('POST', '/authenticate-user', true);
  	xhr.setRequestHeader("Content-Type", "application/json");
  	xhr.onreadystatechange = function() {

  	    if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {

          //Get token and save as cookie (valid for 1d)
          let token = JSON.parse(xhr.response).token;
    			let expires = new Date();
    			expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));

    			document.cookie = "x-access-token=" + token + ";expires=" + expires.toUTCString();
          resolve(true);
      		try {	
            showLogin();
          } catch(e) {console.log(e);}

          return;
  	    }
  	}

    let msg = "Please sign this message to confirm ownership of your account.";
    let addr = web3.eth.accounts[0];

    //Sign web3 message to verify account ownership
    web3.personal.sign(web3.toHex(msg), addr, function(e, result) {

      if(e){
      	console.log(e);
        reject(false);
      	return;
      }

      else {
    		xhr.send(JSON.stringify({'address': addr, 'message': msg, 'userSignature': result}));
      }

    });
  });
}

//Takes key of cookie and returns value of cookie
function getCookie(cookieName) {
  var name = cookieName + "=";
  var cookieAray = document.cookie.split(';');
  for(var i = 0; i < cookieAray.length; i++) {
      var c = cookieAray[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

//Update login font color if logged in
function showLogin() {
	
		if (getCookie('x-access-token')) {

			let link = document.getElementById("web3LoginButton").children[0];

			link.style.color = "#5bff5b";
			link.style.fontWeight = "#5bff5b";
		}

}

window.onload = function () { 
	try {

		document.getElementById("web3LoginButton").addEventListener("click", function(){

		    loginWeb3('x-access-token', web3);

		});

		showLogin();
	} catch(e) {console.log(e);}
}
