

/*
 * Software Update Preference Functions
 * We only really need to toggle a switch, so we can just test for the existence of the updatepref
 * record. But we need to add some content to the record so set a var 'allwaysUpdate'. For now, this will
 * always be true, if updatepref exists.
 */

// If a record exists, delete it. Then create a new record if alwaysUpdate = true, else do nothing.
function saveSoftwareUpdate(alwaysUpdate) {
  $.ajax({
     url: homeDB + "/_local/updatepref?rev=0-1",
     timeout : 6000000,
     type: "DELETE",
     async:false,
     contentType:"application/json",
     error: function(){
    	 if (alwaysUpdate) {
    		 doSaveSoftwareUpdate(alwaysUpdate);
    	 }
     },
     success: function(message){
    	 if (alwaysUpdate) {
    		 doSaveSoftwareUpdate(alwaysUpdate);
    		
    	 }
     }
  });
}

function doSaveSoftwareUpdate(alwaysUpdate) {
  var result = false;
  $.ajax({
     url: homeDB + "/_local/updatepref",
     timeout : 6000000,
     type: "PUT",
     async:false,
     data: JSON.stringify({"alwaysUpdate": alwaysUpdate}),
     contentType:"application/json",
     error: function(){
      result = false;
      },
     success: function(message){
        result = true
     }
  });
  
  return result;
}

//Only need to test if updatepref exists to set the switch.
function getSoftwareUpdatePref() {
	var result = false;
  $.ajax({
     url: homeDB + "/_local/updatepref",
     timeout : 6000000,
     async: false,
     type: "GET",
     contentType:"application/json",
     error: function(){
    	 result = false;
    	 
     },
     success: function(message){
    	 result = true;
     }
  });
  
  return result;
}


/*
 * Update the user's environment (dev|test|prod).
 * Note that there is no get function here. The get is done at the top of library.js.
 *
 */
function saveUserEnv(env) {
	  $.ajax({
	     url: homeDB + "/_local/userenv?rev=0-1",
	     timeout : 6000000,
	     type: "DELETE",
	     async:false,
	     contentType:"application/json",
	     error: function(){
	    	 doSaveUserEnv(env);
	    	 
	     },
	     success: function(){
	    	doSaveUserEnv(env);
	    	
	     }
	  });
}

function doSaveUserEnv(env) {
	  var result = false;
	  $.ajax({
	     url: homeDB + "/_local/userenv",
	     timeout : 6000000,
	     type: "PUT",
	     async:false,
	     data: JSON.stringify({"env": env}),
	     contentType:"application/json",
	     error: function(){
	      result = false;
	      },
	     success: function(){
	        result = true
	     }
	  });
	  
	  return result;
}

/*
 *  Save the user's nick name for discovery
 *   Note that there is no get function here. The get is done at the top of library.js.
 *
 */

function saveUserNickname(nickName, password) {
	  $.ajax({
	     url: homeDB + "/_local/nickName?rev=0-1",
	     timeout : 6000000,
	     type: "DELETE",
	     async:false,
	     contentType:"application/json",
	     error: function(){
	         doSaveUserNickname(nickName, password);
	    	 
	     },
	     success: function(){
	         doSaveUserNickname(nickName, password);
	    	
	     }
	  });
}

function doSaveUserNickname(nickName, password) {
	  var result = false;
	  $.ajax({
	     url: homeDB + "/_local/nickName",
	     timeout : 6000000,
	     type: "PUT",
	     async:false,
	     data: JSON.stringify({ "nickName": nickName,
	                "password": password
                    }),
	     contentType:"application/json",
	     error: function(){
	      result = false;
	      },
	     success: function(message){
	        result = true
	     }
	  });
	  
	  return result;
}

/*
 *  Save "Remember Me" check & Account create/skip by user 
 *  Note that there is no get function here. The get is done at the top of library.js.
 *
 */

function saveUserInfo(isRememberMe, isAccountCreate) {
    $.ajax({
        url: homeDB + "/_local/userinfo?rev=0-1",
        timeout: 60000,
        type: "DELETE",
        async: false,
        contentType: "application/json",
        error: function () {
            doUserInfo(isRememberMe, isAccountCreate);
        },
        success: function () {
            doUserInfo(isRememberMe, isAccountCreate);
        }
    });
}

function doUserInfo(isRememberMe, isAccountCreate) {
    var result = false;
    $.ajax({
        url: homeDB + "/_local/userinfo",
        timeout: 60000,
        type: "PUT",
        async: false,
        data: JSON.stringify(
                { "rememberme": isRememberMe,
                    "accountcreate": isAccountCreate
                }
            ),
        contentType: "application/json",
        error: function () {
            result = false;
        },
        success: function (message) {
            result = true
        }
    });
    return result;
}




