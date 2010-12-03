setupMessageHandlers();

// --------------------------------------------------------------------
// State

//Session Scope

var cryptoKey;
var isActive = false;

// Local Storage Scope

const defaultState = {
		cryptoKey: "",
		hideCryptoKey: false,
		saveCryptoKey: true
};


function setState(state) {
	if (!state.saveCryptoKey) {
		cryptoKey = state.cryptoKey;
		state.cryptoKey = "";
	}
	
	localStorage["state"] = JSON.stringify(state);
}

function getState() {
	
	var state;
	
	try {
		state = JSON.parse(localStorage["state"]);
	}
	catch (error) {
		setState(defaultState);
		state = JSON.parse(localStorage["state"]);
	}
	
	if (!state.saveCryptoKey)
		state.cryptoKey = cryptoKey;
	
	return state;
}

// --------------------------------------------------------------------
// Messaging

function setupMessageHandlers() {
	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			try {
				switch (request.action) {
				case "isActive":
					sendResponse({result: isActive});
					break;
				case "isEncrypted":
					sendResponse({result: isEncrypted(request.data)});
					break;
				case "encrypt":
					sendResponse({result: encrypt(request.data), isKeyEmpty: getState().cryptoKey.length == 0});
					break;
				case "decrypt":
					sendResponse({result: decrypt(request.data)});
					break;
	
				default:
					// Always send some response so caller isn't left hanging.
					sendResponse({});
					break;
				}
			}
			catch (error) {
				sendResponse({error: error});
			}
		});
}

// --------------------------------------------------------------------
// Cryptography

const cipherLabel = "safe2d.com";
const AES256BASE64 = "aes256/base64";

function isEncrypted(cryptoJson) {
	try {
		var crypto = JSON.parse(cryptoJson);
		return crypto[cipherLabel] != null;
	}
	catch(error) {
		return false;
	}
}

function encrypt(stringToEncrypt) {
	var crypto = {};
	crypto[cipherLabel] = GibberishAES.enc(stringToEncrypt, getState().cryptoKey);
	crypto.enc = AES256BASE64;
	return JSON.stringify(crypto);
}

function decrypt(cryptoJson) {
	var crypto = JSON.parse(cryptoJson);
	if (crypto.enc == AES256BASE64)
		return GibberishAES.dec(crypto[cipherLabel], getState().cryptoKey);
}