$(function() {
	try {
		toggleIsActive();
		loadState();
		updateKeyUi();
	
		$("#keyText").keyup(function(){
			$("#keyPassword").val($(this).val());
			saveState();
		});
		$("#keyPassword").keyup(function(){
			$("#keyText").val($(this).val());
			saveState();
		});
		$("#hideKeyCheckbox").click(function(){
			saveState();
			updateKeyUi();
		});
		$("#saveKeyCheckbox").click(saveState);
	}
	catch (error) {
		alert(error);
	}
});

function toggleIsActive() {
	var backgroundPage = chrome.extension.getBackgroundPage();
	backgroundPage.isActive = !backgroundPage.isActive;
	var iconPath = "images/cipher2d_padlock_locked_19" + (backgroundPage.isActive ? ".png" : "_gray.png");
	chrome.browserAction.setIcon({path:iconPath});
	chrome.browserAction.setTitle({title: "Safe2D is " + (backgroundPage.isActive ? "On" : "Off")});
	$("#title").append(backgroundPage.isActive ? "On" : "Off");
}

function updateKeyUi() {
	if ($("#hideKeyCheckbox").is(":checked")) {
		$("#keyText").hide();
		$("#keyPassword").show();
	}
	else {
		$("#keyText").show();
		$("#keyPassword").hide();
	}
}

function saveState() {
	var state = chrome.extension.getBackgroundPage().getState();
	state.hideCryptoKey = $("#hideKeyCheckbox").attr("checked");
	state.saveCryptoKey = $("#saveKeyCheckbox").attr("checked");
	state.cryptoKey = $("#keyText").val();
	chrome.extension.getBackgroundPage().setState(state);
}

function loadState() {
	var state = chrome.extension.getBackgroundPage().getState();
	$("#keyText").val(state.cryptoKey);
	$("#keyPassword").val(state.cryptoKey);
	$("#hideKeyCheckbox").attr("checked", state.hideCryptoKey);
	$("#saveKeyCheckbox").attr("checked", state.saveCryptoKey);
}