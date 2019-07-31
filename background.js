chrome.runtime.onMessage.addListener(callbackAction);
const sendLoginReq = data => {
  var data = JSON.stringify({email: data});
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://app.fbdomination.io/users/login", true);
  xhr.setRequestHeader("Content-type", "application/json");
  // xhr.setRequestHeader("Content-length", data.length);
  // xhr.setRequestHeader("Connection", "close");
  // xhr.setRequestHeader("Remote-User", "myuser");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      console.log("xhr response: " + xhr.responseText);
    }
  };
  xhr.send(data);
};

function callbackAction(request, sender, sendResponse) {
  console.log(request);
  switch (request.message) {
    case "loginCheck":
      var req = sendLoginReq(request.email);
      break;
  }
}
/*
* TODO:
* Save the user input data in local storage
* Check if findFriendSearch Payload is Available or not
* CASE:: AVAILABLE
*** Then open find friend url in new tab
*** Open popup.html
*** Dispatch dynamic friend request send action to content.js 

* CASE:: NOT AVAILABLE
*** Dispatch dynamic friend request send action to content.js
*/
function processSendFrndRequest(payloads) {
  if (payloads.findFrindSearch) {
    var newURL = "https://www.facebook.com/?sk=ff";
    chrome.tabs.create({ url: newURL });
    chrome.tabs.onUpdated.addListener(function(tabId, info) {
      if (info.status === "complete") {
        payloads.action = "sendFrndReq";
        chrome.tabs.sendMessage(tabId, payloads);
        // console.log("Find Friend Tab Opened and Loaded");
        // chrome.tabs.sendMessage(tabId, request.payload);
      }
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      payloads.action = "sendFrndReq";
      chrome.tabs.sendMessage(tabs[0].id, payloads);
    });
  }
}

function processStopScript() {
  console.log("Stop Triggered in background");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    payloads = {
      action: "stopScript"
    };
    chrome.tabs.sendMessage(tabs[0].id, payloads);
  });
}
