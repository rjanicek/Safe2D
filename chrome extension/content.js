// ----------------------------------------------------------------------------
// Text Input Cryptography

addDelegateToEncryptableElements();

function addDelegateToEncryptableElements() {
	$("body").delegate("textarea,input:text", "mouseenter", function(){
		var element = this;
		chrome.extension.sendRequest({action: "isActive"}, function (response) {
			var isActive = response.result;
			if (isActive) {
				addCryptoFeaturesToElement(element);
			}
		});
	});
	
	$("body").delegate("textarea,input:text", "mouseleave", function(){
		var element = this;
		chrome.extension.sendRequest({action: "isActive"}, function (response) {
			var isActive = response.result;
			if (isActive) {
				removeCryptoFeaturesFromElement(element);
			}
		});
	});
}

function addCryptoFeaturesToElement(element) {
	chrome.extension.sendRequest({action: "isEncrypted", data: $(element).val()}, function(response) {
		var isEncrypted = response.result;
		updatedCipherElementStyle(element, isEncrypted);
		$(element)
			.css("background-repeat", "no-repeat")
			.css("background-position", "1px 1px")
			.css("padding-left", "20px")
			.click(function(e){
			    if (e.offsetX <= 20 && e.offsetY <= 20)
			    	encryptOrDecryptElement(this);
			});
	});
}

function removeCryptoFeaturesFromElement(element) {
	$(element)
		.css("background-repeat", "")
		.css("background-position", "")
		.css("padding-left", "")
		.css("background-image", "")
		.removeAttr("cipher")
		.unbind("click");		
}

function updatedCipherElementStyle(element, isEncrypted) {
	var imgName = isEncrypted ? "images/cipher2d_padlock_locked_16.png" : "images/cipher2d_padlock_unlocked_16.png"; 
	var imgURL = chrome.extension.getURL(imgName);
	$(element)
		.attr("cipher", isEncrypted ? "encrypted" : "decrypted")
		.css("background-image", "url('" + imgURL + "')");
}

function encryptOrDecryptElement(element) {
	var isEncrypted = $(element).attr("cipher") == "encrypted";
	if (isEncrypted)
		decryptElement(element);
	else
		encryptElement(element);
}

function encryptElement(element) {
	var data = $(element).val();
	chrome.extension.sendRequest({action: "encrypt", data: data}, function(response) {
		$(element).val(response.result); 
		updatedCipherElementStyle(element, true);
		triggerEventInContentContext(element);
		if (response.isKeyEmpty)
			$.cursorMessage("You are using a weak key, click the Safe2D icon to set a stronger key.", {hideTimeout:5000});
	});
}

function decryptElement(element) {
	var data = $(element).val();
	chrome.extension.sendRequest({action: "decrypt", data: data}, function(response) {
		if (response.result != null){
			$(element).val(response.result);
			updatedCipherElementStyle(element, false);
			triggerEventInContentContext(element);
		}
		else if (response.error != null)
			$.cursorMessage(response.error, {hideTimeout:5000});
	});
}

//-----------------------------------------------------------------------------
// Content Decryption

window.setInterval("parseAndDecryptCiphers()", 1000);

const cipherRegex = '{"safe2d.com":".+}';

function parseAndDecryptCiphers() {
	chrome.extension.sendRequest({action: "isActive"}, function(response) {
		var isActive = response.result; 
		if (isActive) {
			$("body *").replaceText( /{"safe2d.com":".+}/gi, decryptCipherText);
		}
	});
}

function decryptCipherText(cipher) {
	chrome.extension.sendRequest({action: "decrypt", data: cipher}, function(response) {
		if (response.result != null){
			$("body *").replaceText(cipher, "<pre>" + response.result + "</pre>");
		}
	});

	return cipher;
}