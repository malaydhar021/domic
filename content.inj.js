// console.log("Running Extension?");
let requestSent = 0;
var interval, currentTabID, addBtnClass, frndBtnDiv;

$(document).ready(function(){
  // addBtnClass = $(".FriendRequestAdd");
  frndBtnDiv = $(".FriendButton");
  chrome.runtime.onMessage.addListener(callbackOnMessage);
});

function callbackOnMessage(param, sender, sendResponse) {
  // console.log(param);
  switch (param.action) {
    case "sendFrndReq":
      currentTabID = param.tabID;
      console.log(param.payload);
      toastMessage("Task Started", "Your script has been started. Do not press refresh.",3);
      sendFrndReq(param.payload);
      sendResponse({ msg: "Script Started" });
      break;
    case "stopScript":
      stopRunningScripts();
      break;
  }
}

/* Show more div class = friendBrowserCheckboxContentPager */
// Further Attempt
function sendFrndReq(payload, prevLength=0) {
  var membersRow = $(".clearfix").find("[data-name='GroupProfileGridItem']");
  var buttons = $(".FriendRequestAdd");
  var rowLength = membersRow.length;
  var i = 0;
  if(!buttons.length) {
    // stopRunningScripts(1);
  }
  if(prevLength) {
    i = prevLength;
  }
  if(rowLength) {
    console.log(rowLength+" Rows found in current UI");
    if(!i) $(membersRow[i]).addClass("working");
    interval = setInterval(function(){
      // console.clear();
      console.log("Task Progress -- ", i+1);
      if(i !== rowLength) {
        $(membersRow[i]).removeClass("working");
        $(membersRow[i+1]).addClass("working");
        checkSendFriend(membersRow[i], payload);
      } else {
        $(membersRow).removeClass("working"); // Remove all custom bordered elements
        console.log("Recalling same method. Prevlength param is "+rowLength);
        $(membersRow[i]).removeClass("working");
        clearInterval(interval);
        sendFrndReq(payload, rowLength);
      }
      i++;
    },payload.interval);
  } else {
    toastMessage("Finished","Done sending friend requests. Process ended.", 2);
    clearInterval(interval);
  }
}

function checkSendFriend(el, data) {  
  if($(el).find("button").hasClass("FriendRequestAdd")) {
    btn = $(el).find(".FriendRequestAdd");
    requestOutgoing = $(el).find(".FriendRequestOutgoing");
    // Search for the keyword and click on the add friend button
    console.log("Checking Keywords");
      if(checkKeywords(el, data)) {
        // console.log("Button Press");
        // $(btn).css("background-color","red");
        if(!$(btn).hasClass("hidden_elem")) {
          console.log("Request outgoing button is not there. Sending Friend Request");
          // $(btn).css("background-color","blue");
          $(btn).click();
          requestSent++;
          toastMessage("Success",requestSent+" requests sent. Looking for next...");
        } else {
          console.log("Skipping this row");
        }
        setTimeout(function(){
          // $(".uiOverlayButton").click();
          // $(".layerCancel").click();
          $(".layerConfirm").click();
        },3000);
      }
    
    // END -- Search for the keyword and click on the add friend button

    // Stop Interval if request limit value reached
    if(parseInt(data.reqType) == 1 && parseInt(data.numberOfReq) == requestSent) stopRunningScripts(1);
    // var id = "#"+$(el).attr("id");
    // Scroll to div
    $('html,body').animate({
      scrollTop: $(el).offset().top
    }, 'slow');
  } else {
    // console.log(anchor.html());
    $(el).removeClass("working");
    $(el).addClass("noAddBtn");
  }
  // Press Show more if available
  pressShowMore();
}

function pressShowMore() {
  var seeMoreEl = document.getElementsByClassName('uiMorePagerPrimary');
  var len = seeMoreEl.length;
  console.log("See More Button Length",len);

  if(len) {
    // console.log(seeMoreEl[len-1].innerText);
    if(seeMoreEl[len-1].innerText.toLowerCase() == "see more") {
      seeMoreEl[len-1].click();
    }
  }
  
}

function checkKeywords(el, payload) {
  let bool = false;
  const keywordsArr = payload.keywords;
  // const subEl = ($(el).find("._60rj").text()).toLowerCase();
  if(!$(el).find("._60rj").text().length) return;
  
  console.log($(el).find("._6a").find("._60rj").length);
  var keyDiv = $(el).find("._6a").find("._60rj"); 
  for(var i=0;i<keyDiv.length;i++) {
    keywordsArr.find((arrEl) => {
      var rSearchTerm = new RegExp('\\b' + arrEl.toLowerCase() + '\\b','i');
      var subEl = $(keyDiv[i]).text().toLowerCase();
      if(subEl.match(rSearchTerm)) {
        console.log("Keyword matched");
        bool = true;
      }
    });
    if(bool) break;
  }
  return bool;

  // const subEl = ($(el).find("._6a").text()).toLowerCase();
  // console.log($(el).find("._6a").text());
  
  // if(!subEl.length) return;

  // keywordsArr.find((arrEl) => {
  //   var rSearchTerm = new RegExp('\\b' + arrEl.toLowerCase() + '\\b','i');
  //   if(subEl.match(rSearchTerm)) {
  //     bool = true;
  //   }
  // });
  // return bool;
  // clearInterval(interval);
}

function stopRunningScripts(isFinished=0) {
  var membersRow = $(".clearfix").find("[data-name='GroupProfileGridItem']"); 
  $(membersRow).removeClass("working");
  clearInterval(interval);

  if (!isFinished){
    toastMessage(
      "Task Stopped",
      "The running tasks have been stopped",
      0
    );
  } else {
    toastMessage(
      "Task Finshed",
      "The current tasks have been finished.",
      2
    );
  }
  
}

// 0 = Error, 1 = Success, 2 = Info, 3 = Warning
function toastMessage(heading, body, type = 1) {
  // alert("Toast Shown");
  toastType = ["error", "success", "info", "warning"];
  $.toast({
    heading: heading,
    text: body,
    showHideTransition: "slide",
    icon: toastType[type],
    position: "bottom-left"
  });
}
/*
// TEST FUNCTIONS TO BE DELETED LATER

function checknSendRequest(payload) {
  const numberOfReqTobeSent = parseInt(payload.numberOfReq);
  // $(addBtnClass[requestSent]).css("background-color", "#F00");
  $(frndBtnDiv[requestSent]).find(".FriendRequestAdd").css("background-color", "#0F0");
  // $(addBtnClass[requestSent]).click();
  requestSent++;
  let msg = requestSent + " Requests Sent Successfully";
  toastMessage("Success", msg);
  console.log( $(addBtnClass[requestSent]).text());
  if (requestSent === numberOfReqTobeSent) {
    clearInterval(interVal);
    msg = requestSent + " Requests has been successfully";
    setTimeout(function() {
      toastMessage("Task Completed", msg, 2);
      requestSent = 0;
    }, 4000);
  }
}

function sendFrndReqOld(payload) {
  var btn = $(".FriendRequestAdd");
  console.log("Checking Add Friend Buttons...");
  if(btn.length > 0) {
    console.log(btn.length+" buttons are there in the currently loaded UI.");
    var i = 0;
    interval = setInterval(function(){
      if(i !== btn.length){
        var rootParentDiv = $(btn[i]).parent().parent().parent().parent().parent().parent().parent();
        $(btn[i]).css("background-color","green");
        requestSent++;
        rootParentDiv.remove();
        i++;
        console.log(i+" requests sent so far. Looking for next.");
        toastMessage("Success",requestSent+" Requests sent. Processing Next...", 1);
      } else {
        console.clear();
        console.log("Reached to max Add buttons available in the UI");
        // toastMessage("Refreshing","Checking and reloading content if any", 2);
        clearInterval(interval);
        toastMessage("Success",requestSent+" Requests sent. Processing Next...", 1);
        console.log("Checking if show more button is there or not");
        if($(".uiMorePagerPrimary")[0]) {
          console.log("Got showmore. Pressing show more...");
          $(".uiMorePagerPrimary")[0].click();
          $(".uiMorePagerPrimary")[0].click();
        }
        console.log("Initiating the process again.");
        setTimeout(function(){
          sendFrndReq(payload);
        },payload.interval);
      }
    },payload.interval);
  } else {
    console.log("No Add Friend button in this interface. Stopping the process...");
    toastMessage("Finished","Done sending friend requests. Process ended.", 2);
    clearInterval(interval);
  }
}

*/