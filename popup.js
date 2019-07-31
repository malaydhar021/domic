$(function() {
  // Initialization
  init();
  // deleteStorage();
  checkAuthStatus();

  // Form Submission
  $("form").submit(function(e) {
    e.preventDefault();
    if (!validation()) return;
    const data = $(this).serializeArray();
    const serializedData = serializeFormData(data);
    saveFormData(serializedData);
    sendRequest(serializedData);
  });

  $("#login").click(function() {
    // alert("hello");
    var email = $("#email").val();
    authRemote(email);
  });
});

function authRemote(email) {
  var data = JSON.stringify({ email: email });
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://app.fbdomination.io/users/login", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      const resp = JSON.parse(xhr.responseText);
      if(xhr.status == 200) {
        if (resp.accessToken) {
          saveAccessToken(resp.accessToken)
        }
      } else {
        $(".errMsg").css("display","block").text(resp.msg);
      }
    }
  };
  xhr.send(data);
}

function deleteStorage() {
  chrome.storage.local.clear(function(obj) {
    console.log("Cleared");
  });
}

function showLogin() {
  $(".ext").hide();
  $(".extLogin").show();
}

function showExtDash() {
  $(".ext").show();
  $(".extLogin").hide();
}

function validation() {
  var $isInfinite, $NREQ, $KW;
  var bool = false;
  $isInfinite = $("#reqType_i");
  $NREQ = $("#numberOfReq");
  $KW = $("#tagInput");
  if (!$isInfinite.is(":checked")) {
    if ($.trim($NREQ.val()) == "") {
      $(".nqMsg").css("display", "block");
      bool = false;
    } else {
      $(".nqMsg").css("display", "none");
      bool = true;
    }
  }
  if ($.trim($KW.val()) == "") {
    $(".kwMsg").css("display", "block");
    bool = false;
  } else {
    $(".kwMsg").css("display", "none");
    bool = true;
  }

  return bool;
}

function init() {
  // Initialize request limit
  $(".reqType").click(function() {
    if ($("#reqType_l").is(":checked")) {
      $("#numberOfReq").removeAttr("disabled");
      $(".noOfReqBlock").slideDown();
    } else {
      $("#numberOfReq").attr("disabled", "disabled");
      $(".noOfReqBlock").slideUp();
    }
  });

  $("#numberOfReq").blur(function() {
    if ($.trim($(this).val()) == "") {
      $(".nqMsg").css("display", "block");
    } else {
      $(".nqMsg").css("display", "none");
    }
  });

  // Retrive previously added form data.
  $("#loadFormData").click(retrieveFormData);
  // Action if Stop Request Triggered
  $("#stopScript").click(stopScriptRequest);
}

function serializeFormData(data) {
  const formData = {};
  // Pushing this form data into a single object
  $.each(data, function(index, val) {
    if (val.name !== "keywords") {
      formData[val.name] = val.value;
    } else {
      var keywords = val.value;
      formData[val.name] = keywords.split(",");
    }
  });
  return formData;
}

function sendRequest(data) {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (chrome.runtime.lastError)
        alert("Runtime error! Please reload the page and re-run the extension");

      data.tabID = tabs[0].id;
      const param = {
        action: "sendFrndReq",
        payload: data
      };
      // console.log(param);
      chrome.tabs.sendMessage(tabs[0].id, param, function(data) {
        console.log(data);
      });
    });
  } catch (e) {
    console.log(e.message);
    alert("Runtime error! Please refresh the page and re-run the extension");
  }
  // console.log("Got Run Request. Sending action request to Active Tab...");
  // Sending message to content.inj.js
}

function stopScriptRequest() {
  // Sending stop script request to content.js
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var payloads = {
      action: "stopScript",
      payload: {
        tabID: tabs[0].id
      }
    };
    chrome.tabs.sendMessage(tabs[0].id, payloads);
  });
}

function saveFormData(data) {
  // console.log(data);
  chrome.storage.sync.set({ formData: { ...data } }, function() {
    console.log("Saved");
  });
}

function retrieveFormData() {
  chrome.storage.sync.get("formData", function(items) {
    console.log(items.formData);
    if (items.formData) {
      $("#loadFormData").show();
      $(".interval option[value=" + items.formData.interval + "]").attr(
        "selected",
        "selected"
      );
      if (items.formData.reqType == "1") {
        $("#reqType_i").removeAttr("checked");
        $("#reqType_l").attr("checked", "checked");
        $(".numberOfReq").val(items.formData.numberOfReq);
      } else {
        $("#reqType_l").removeAttr("checked");
        $("#reqType_i").attr("checked", "checked");
        $(".noOfReqBlock").css("display", "none");
      }

      if (items.formData.keywords) {
        $("#tagInput").val();
        $("#tagInput").tagsinput("add", items.formData.keywords.join());
      }
    } else {
      $("#loadFormData").hide();
    }
  });
}

function saveAccessToken(data) {
  chrome.storage.local.set({accessToken: data}, checkAuthStatus);
}

function checkAuthStatus() {
  chrome.storage.local.get("accessToken", function(data){
    if(data.accessToken) {
      showExtDash();
    } else {
      showLogin();
    }
  });
}
/* 
#### Commented Out Functions -- Can be used later ####

function sendReqToBackground() {
  var payloads = {
    backgroundAction: "sendFrndReq",
    payload: {
      action: "sendFrndReq",
      value: $("#sendRQInput").val(),
      // findFrindSearch: 0
      findFrindSearch: 1
    }
  }
  chrome.runtime.sendMessage(payloads);
}

########################## END ##########################
*/
