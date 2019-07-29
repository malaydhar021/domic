chrome.runtime.onMessage.addListener(callbackAction);

function callbackAction(request, sender, sendResponse) {
  console.log(request);
  switch (request.backgroundAction) {
    case "sendFrndReq":
      processSendFrndRequest(request.payload);
      break;
    case "stopScript":
      processStopScript();
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
