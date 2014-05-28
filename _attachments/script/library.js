/* The Little Library
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

var currentHost = window.location.protocol + "//" + window.location.host; // variable for the database domain
var dbURL = document.URL.split("//");
dbURL = (dbURL[1] ? dbURL[1] : dbURL[0]).split("/");
var homeURL = dbURL[1]; // variable for the database name
var homeDB = currentHost +"/"+ homeURL; // variable for the database full url
var repOptions = {"continuous":true};
var templateDB = "unknown"; // URL to the template for The Little Library
var onlineBase = "unknown"; // URL of online database hosting all onlineDBs
var designDoc  = "unknown"; // Name of the _design document in use
var remoteDB   = "unknown"; // Name of the database from which the _design document should be retrieved. Should match the db specified in templateDB.
var maxDBSize = 10000000000; // Default max DB size is 1000MB
var homeUser = '';
var itemUser = '';
var env = 'unknown';
var version = 0.0;
var minApk	= 0.0;
var initialScale = '1.3';
// File formats to expect for thumbnails
var imageArray = {'jpg':'jpg','gif':'gif','png':'png','jpeg':'jpeg','bmp':'bmp','ico':'ico','JPG':'JPG','GIF':'GIF','PNG':'PNG','JPEG':'JPEG','BMP':'BMP','ICO':'ICO'};
// File formats to send to jPlayer
var jplayerArray = { 'MP3': 'MP3', 'mp3': 'mp3' }
var _itemType = '';
var _itemId = '';
var _itemRev = '';
var nickname = '';
var isRememberMe = 'no';
var isAccountCreate = "yes";
var currentLangId = '';
var libLang = {};
var userPassword = '';

//Get the user's environment
$.ajax({
     url: homeDB + "/_local/userenv",
     timeout : 6000000,
     dataType: "json",
     async: false,
     type: "GET",
     contentType:"application/json",
     error: function(){
    	 env = "prod";
     },
     success: function(envinfo){
    	 env = envinfo.env; //Set the environment. Should be dev | test | prod.
     }
});

//Get the user's nickname
$.ajax({
    url: homeDB + "/_local/nickName",
    timeout: 60000,
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    async: false,
    error: function () {
        nickname = "";
    },
    success: function (data) {
        nickname = data.nickName;
        userPassword = data.password;
    }
});

//Get "Remember Me" check & Account is create/skip
$.ajax({
    url: homeDB + "/_local/userinfo",
    timeout: 60000,
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    async: false,
    error: function () {
        isRememberMe = "no";
        isAccountCreate = "yes";
    },
    success: function (data) {
        isRememberMe = data.rememberme;
        isAccountCreate = data.accountcreate;
    }
});

// Show the message in Modal Dialog instead of Alert
function dialog(message, mode) {    
    if (mode == 'refresh') {
        $('<div>').simpledialog
        ({
            mode: 'button',
            headerText: libLang.appName,
            headerClose: false,
            buttonPrompt: message,
            buttons: {                
                'Ok': {
                    id: 'btn_Refresh',
                    click: function () {
                        window.location.replace("library.html?type=" + _itemType);
                    }
                }
            }
        });

        //Assign button text from language file        
        $("#btn_Refresh").find('.ui-btn-text').html(libLang.okBtn);        
        $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
    } 
    /*else if (mode == 'delete') {
        $('<div>').simpledialog
        ({
            mode: 'button',
            headerText: libLang.appName,
            headerClose: false,
            buttonPrompt: message,
            buttons: {
                'Ok': {
                    id: 'btn_Delete',
                    click: function () {
                        $.couch.db(homeURL).removeDoc({ '_id': _itemId, "_rev": _itemRev });
                        window.location.replace("library.html?type=" + _itemType);
                    }
                },
                'Cancel': {
                    id: 'btn_Cancel',
                    click: function () {
                        $('#buttonoutput').text('Cancel');
                    },
                    icon: "delete",
                    theme: "c"
                }
            }
        });

        //Assign button text from language file        
        $("#btn_Delete").find('.ui-btn-text').html(libLang.okBtn);
        $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
    } */
    else {
        $('<div>').simpledialog
        ({
            mode: 'button',
            headerText: libLang.appName,
            headerClose: false,
            buttonPrompt: message,
            buttons: {
                'OK': {
                    id: 'btn_Validate',
                    click: function () {
                    }
                }
            }
        });

        //Assign button text from language file
        $("#btn_Validate").find('.ui-btn-text').html(libLang.okBtn);        
        $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
    }    
}

// Get local application configuration
$.ajax({
	   url: '/'+ homeURL +'/appinfo',
	   dataType: 'json',
	   async: false,
	   success: function(appinfo){
		   version		= appinfo[env]["version"];
		   minApk		= appinfo[env]["minAPKversion"];
		   templateDB 	= appinfo[env]["dataSource"]["templateDB"];
		   onlineBase 	= appinfo[env]["dataSource"]["onlineBase"];
		   designDoc  	= appinfo[env]["dataSource"]["designDoc"];
		   remoteDB 	= templateDB.split("//");
		   remoteDB 	= (remoteDB[1].split("/"))[1];
	   },
	   error: function(request, status, error){
		      console.log("Session error: " + request.responseText);
		   }
});

// Get username
// This appears to be useless if the user doesn't already have an account
// it returns 'null' and happily goes along. There's no logic to force a login
$.ajax({
   url: '/_session?callback=',
   dataType: 'json',
   async: false,
   success: function(session){
      homeUser = session.userCtx.name;
   },
   error: function(request, status, error){
      console.log("Session error: " + request.responseText);
   }
});

//Get & Set UI Language details
$.ajax({
    url: homeDB + "/_local/uilanguage",
    timeout: 60000,
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    async: false,
    error: function () {
        updateLanguagefile();
    },
    success: function (data) {
        currentLangId = data.currentLangId;        
        //Set language texts based on local variable...
        $.ajax({
            url: '/' + homeURL + '/' + currentLangId,
            dataType: 'json',
            async: false,
            success: function (langData) {
                libLang = langData.texts;
            }
        });        
    }
});

/*
// Translate UI to language of choice

$.ajax({
   url: '/'+ homeURL +'/_design/library/_view/currentLang?callback=',
   dataType: 'json',
   async: false,
   success: function(langJSON){
      if(langJSON.total_rows == '0'){
         $.ajax({
            url: '/'+ homeURL +'/_design/library/language.json',
            dataType:'json',
            async: false,
            success: function(langData){
               libLang = langData.texts;
            }
         });
      }
      else {
         $.ajax({
            url: '/'+ homeURL +'/'+ langJSON.rows[0].id,
            dataType: 'json',
            async: false,
            success: function(langData){
               libLang = langData.texts;
            }
         });
      }
   }
});
*/

// Ensure authentication
jQuery.fn.libraryAuth = function () {

    // If logged in already, display nickname at the end of the list
    if (homeUser !== undefined && homeUser !== null) {        
        nickname = nickname.length > 0 ? nickname : homeUser;
        $('.ui-footer h4').prepend(nickname + '<br />');

        // If not logged in, go to login/signup page
    } else {
        window.location.replace("login.html");
    }
};
    
// Sign up for new library and login
jQuery.fn.signupForm = function(username, password){
   $.mobile.showPageLoadingMsg();
   $.couch.signup({"name": username,roles:[username]}, password, {
      success: function(){
         // window.location.replace('login.html');
        $.couch.login({
          "name": username,
          "password": password,
          success: function(){
            window.location.replace('index.html');
          },
          error: function(request, status, error){                    
                    dialog("Hey, what's going on here?", "default");
          }
        });
      },
      error: function(request, status, error){            
            dialog("Hey, what's going on here?", "default");
      }
   });
   $.mobile.hidePageLoadingMsg();
};

// Home page categories list
jQuery.fn.categoryShow = function () {    
    // Get JSON file
    $.getJSON('/' + homeURL + '/_design/library/?callback=', function (data) {
        // List each item in the library category
        $.each(data.views, function (singleView) {
            translatedSingleView = singleView;
            if (singleView == "books") {
                translatedSingleView = libLang.books;
            }
            if (singleView == "audio") {
                translatedSingleView = libLang.audio;
            }
            if (singleView == "videos") {
                translatedSingleView = libLang.videos;
            }
            if (singleView == "pictures") {
                translatedSingleView = libLang.pictures;
            }
            if (singleView == "documents") {
                translatedSingleView = libLang.documents;
            }
            if (singleView == "notes") {
                translatedSingleView = libLang.notes;
            }
            if (singleView == "courses") {
                translatedSingleView = libLang.courses;
            }
            // Don't list the languages views
            if (singleView !== "languages" && singleView !== "currentLang" && singleView !== "helpdocs") {
                $('ul.homeList').append('<li class="ui-li-has-count"><a href="library.html?type=' + singleView + '" rel="external" data-transition="slide">' + translatedSingleView + '<span class="' + singleView + 'Total"></span></a></li>');
            }
        });
        $('#home ul.homeList').listview('refresh');
    });
};

// Get the theFile's extension
function getFileExtension(theFile) {
   return theFile.split('.').pop();
}

// Category page list of items
// the 3rd var (local) is only ever false on the storeItems.html page
jQuery.fn.listShow = function (category, libURL, local) {
    var categoryName = category,
   useImageGalery = 'false',
   useAudioPlayer = 'false';
    $('h1').text(libLang[category]);


    // Get JSON file
    /*$.getJSON(libURL +'/_design/library/_view/'+ categoryName +'?callback=', function(categoryData) {*/
    if (local === false) {
        jsonUsed = "jsonp";
    }
    else {
        jsonUsed = "json";
    }

    $.ajax({
        type: 'GET',
        url: libURL + '/_design/library/_view/' + categoryName,
        processData: true,
        dataType: jsonUsed,
        error: function () {            
            dialog("What happened?", "default");
        },
        success: function (categoryData) {
            if (categoryData.rows == '') {

                $('ul.' + categoryName + 'List').append('');
            }
            else {
                // List each item in the library category
                $.each(categoryData.rows, function (cat, singleItem) {

                    var itemDate = '',
                  fileURL = '';

                    var attachmentCount = 0

                    if (singleItem.key._attachments) {
                        attachmentCount = Object.keys(singleItem.key._attachments).length;
                    }


                    if (singleItem.key.date !== undefined && singleItem.key.date !== '') {
                        itemDate = ('(' + singleItem.key.date + ')');
                    }

                    settingsURL = libURL + '/_design/library/settings.html?id=' + singleItem.key._id + '&amp;type=' + singleItem.key.type;
                    itemThumb = '';

                    // If the key 'filename' is defined, that should be the file that opens when the resource is opened
                    // If 'filename' is not defined and there is an index.html or default.html, use that

                    if (typeof singleItem.key.filename !== 'undefined') {
                        fileURL = libURL + '/' + singleItem.key._id + '/' + encodeURIComponent(singleItem.key.filename);
                    }

                    if (typeof singleItem.key.cover !== 'undefined') {
                        if (singleItem.key.cover == 'none') {
                            itemThumb = '';
                        }
                        else {
                            itemThumb = '<img src="' + libURL + '/' + singleItem.key._id + '/' + encodeURIComponent(singleItem.key.cover) + '" />';
                        }
                    }

                    if (fileURL == '' || itemThumb == '') {
                        for (var filename in singleItem.key._attachments) {

                            //TO DO, break this into two function calls, one for fielURL and one for itemThumb
                            filename = encodeURIComponent(filename);
                            extType = getFileExtension(filename);

                            if (itemThumb == '' && imageArray[extType]) {
                                itemThumb = '<img src="' + libURL + '/' + singleItem.key._id + '/' + filename + '" />';
                            }                            

                            if (filename == "default.htm" || filename == "default.html" || filename == "index.htm" || filename == "index.html") {
                                if (!local || local === false) {
                                    fileURL = libURL + '/' + singleItem.key._id + '/' + filename;
                                }
                                else { // this section is only used for Notes at the moment (I think).
                                    fileURL = 'wrapper.html?name=' + singleItem.key.title + '&amp;url=' + libURL + '/' + singleItem.key._id + '&amp;path=' + filename;
                                }
                                break; // once we know we have index type page, ignore any following attachments. TODO: rework this code to have 1 entry and 1 exit
                            } else {
                                if (jplayerArray[extType]) {
                                    useAudioPlayer = 'true'
                                } else if (imageArray[extType]) {
                                    useImageGalery = 'true'
                                }
                                if (jplayerArray[extType] || imageArray[extType]) {
                                    fileURL = 'jplayer.html?useAudioPlayer=' + useAudioPlayer + '&amp;useImageGalery=' + useImageGalery + '&amp;name=' + singleItem.key.title + '&amp;url=' + libURL + '/' + singleItem.key._id;
                                }
                            }
                        } // end attachments loop

                        // if we still don't have a fileURL then check the number of attachments.
                        // if none go to settings page; if > 1 use player page else link to the 1 attachment
                        if (!fileURL || fileURL === '' || fileURL === null || fileURL === 'undefined') {
                            if (attachmentCount == 0) {
                                fileURL = "_show/details/" + singleItem.key._id;

                            } else if (attachmentCount > 1) {
                                fileURL = 'jplayer.html?useAudioPlayer=' + useAudioPlayer + '&amp;useImageGalery=' + useImageGalery + '&amp;name=' + singleItem.key.title + '&amp;url=' + libURL + '/' + singleItem.key._id;
                            }
                            else {
                                fileURL = libURL + '/' + singleItem.key._id + '/' + filename;
                            }
                        }
                    }
                    // Create the html the item
                    if (singleItem.key.type !== 'helpdoc') {
                        $('ul.listedItems').append('<li><a href="' + fileURL + '" class="itemURL" rel="external">' + itemThumb + '<h3 class="itemTitle">' + (singleItem.key.title).replace(/(<([^>]+)>)/ig, "") + '</h3><p class="itemDetails"><strong>' + (singleItem.key.author).replace(/(<([^>]+)>)/ig, "") + '</strong> ' + (itemDate).replace(/(<([^>]+)>)/ig, "") + '<br />' + (singleItem.key.description).replace(/(<([^>]+)>)/ig, "") + '</p></a><a href="' + settingsURL + '" rel="external" class="used' + jsonUsed + '" data-library-url="' + singleItem.key._id + '">' + libLang.settings + '</a></li>');
                    } else {
                        $('#addFile').remove();
                        $('ul.listedItems').append('<li><a href="' + fileURL + '" class="itemURL" rel="external"><h3 class="itemTitle">' + (singleItem.key.title).replace(/(<([^>]+)>)/ig, "") + '</h3></a></li>');
                    }
                    $('ul.listedItems').listview('refresh');

                });
            }
        }
    });
};


// Find the cat (category) parameter in the URL when changing settings on an item
// This function is adapted from: http://www.bloggingdeveloper.com/post/JavaScript-QueryString-ParseGet-QueryString-with-Client-Side-JavaScript.aspx
jQuery.fn.getParameter = function(key, default_){

   if (default_==null) default_="add";

   key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");

   var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
   var qs = regex.exec(window.location.href);

   if(qs == null)
      return default_;
   else
      return qs[1];
};


// Category page list of items
jQuery.fn.formShow = function (itemID) {

    var itemName = itemID;

    // Get JSON file and fill in form with data
    $.getJSON('/' + homeURL + '/' + itemName + '?callback=', function (itemData) {
        if (itemData.rows == '') {

            $('.settingsForm').fadeOut(function () {
                $(this).html('<p>' + libLang.errorSettings + '</p>').fadeIn(500); // Get text for langauge
            });
        }
        else {
            // Fill out the form with current data for the item

            if (itemData.user) {
                itemUser = itemData.user;

                //Disable controls if current user is not the resource owner
                if (itemUser != homeUser) {
                    $('#settingsSubmit').attr('disabled', 'disabled');
                    $('.settingsForm input#title').attr('disabled', 'disabled');
                    $('.settingsForm input#author').attr('disabled', 'disabled');
                    $('.settingsForm textarea#description').attr('disabled', 'disabled');
                    $('.settingsForm input#date').attr('disabled', 'disabled');
                    $('.settingsForm select').attr('disabled', 'disabled');
                    $('.uploadField').hide()
                } else {
                    $('#settingsSubmit').removeAttr('disabled');
                    $('.settingsForm input#title').removeAttr('disabled');
                    $('.settingsForm input#author').removeAttr('disabled');
                    $('.settingsForm textarea#description').removeAttr('disabled');
                    $('.settingsForm input#date').removeAttr('disabled');
                    $('.settingsForm select').removeAttr('disabled');
                    $('.uploadField').show();
                }

                //show resource delete button
                $(".deleteThisRescource").show();

                var headerMessage = []
                headerMessage.push('<br/><p style="color: #777777">');
                headerMessage.push('<em>' + libLang.fromTheLibrary + ' <strong>' + nickname + '</strong></em>');
                headerMessage.push('<span class="shareQRSpan"><a class="shareQRLink" rel="external" href="' + '/' + homeURL + '/' + itemName + '?qr">');
                headerMessage.push('<img src="style/images/qr_estante.png" width="64" height="64"></a><br />' + libLang.sendToEstante + '</span></p>');
                $('#formHeader').html(headerMessage.join(''));
            }

            $('#settings h1').text(itemData.title);
            $('.settingsForm input#title').val(itemData.title);
            $('.settingsForm input#author').val(itemData.author);
            $('.settingsForm textarea#description').val(itemData.description);
            $('.settingsForm input#date').val(itemData.date);
            $('.settingsForm input#_rev').val(itemData._rev);
            $('.settingsForm input#type').val(itemData.type);
            itemData.cover == '' ? $('.settingsForm input#cover').val('none') : $('.settingsForm input#cover').val(itemData.cover);
            if (itemData.filename == "") {
                for (var objFileName in itemData._attachments) break;
                $('.settingsForm input#filename').val(objFileName);
            } else {
                $('.settingsForm input#filename').val(itemData.filename);
            }
            $('form.settingsForm').attr({ "action": "/" + homeURL + "/" + itemData._id });

            var attachments = null, len = 0;
            if (itemData._attachments !== undefined) {
                attachments = itemData._attachments;
                len = Object.keys(attachments).length;
            }

            /*if (!itemData.filename || !itemData._attachments || itemData._attachments.length <= 0) {*/
            if (!attachments || len <= 0) {
                return false;
            }
            else {
                // Show all attached files                

                var fileListData = [];
                //Add label -  Current Files label 
                fileListData.push('<div data-role="collapsible" data-theme="b" data-content-theme="b"><h3>' + libLang.attachedFilesLabel + '</h3>');
                fileListData.push('<table style="position:relative;" width="97%">'); //<tr><td colspan="4"><h3>' + libLang.currentFilesLabel + '</h3></td></tr>');

                //Add Header
                fileListData.push('<tr style="padding-top:2px"><td align="center" style="width:10%">' + libLang.fileshareLabel + '&nbsp;</td>');
                fileListData.push('<td align="center" style="width:60%">' + libLang.filenameLabel + '&nbsp;</td>');
                fileListData.push('<td align="center" style="width:13%">' + libLang.filesizeLabel + '&nbsp;</td>');
                if (itemUser != homeUser) {
                    fileListData.push('<td>&nbsp;</td></tr>');
                }
                else {
                    fileListData.push('<td align="center" style="width:10%">' + libLang.deleteLabel + '</td></tr>');
                }

                // Get filenames by iterating over attachments
                for (var filename in itemData._attachments) {

                    fileSizes = itemData._attachments[filename].length - 1;
                    newSize = Math.round(fileSizes / 1000);
                    if (newSize <= 999) {
                        newSize = newSize + 'KB';
                    }
                    else if (newSize <= 9999999) {
                        newSize = newSize + 'MB';
                    }
                    else if (newSize <= 999999999) {
                        newSize = newSize + 'GB';
                    }
                    /* mimeType = itemData._attachments[filename].content_type */

                    fileURL = '/' + homeURL + '/' + itemData._id + '/' + encodeURIComponent(filename);
                    fileListData.push('<tr><td align="center" style="width:10%"><a href="' + fileURL + '?share" rel="external"><img class="shareIcon" src="style/images/android-share_icon.png"></a></td>');
                    fileListData.push('<td align="left" style="width:60%"><a href="' + fileURL + '" rel="external"><div class="wrapword">' + filename + '&nbsp;</div></a></td>');
                    fileListData.push('<td align="right" style="width:13%"><span style="color: #999">' + newSize + '&nbsp;</span></td>');
                    if (itemUser != homeUser) {
                        fileListData.push('<td>&nbsp;</td></tr>');
                    } else {
                        fileListData.push('<td valign="middle" align="center" style="width:10%"><a title="' + libLang.deleteLabel + ' ' + filename + '" rel="' + encodeURIComponent(filename) + '" data-role="button" data-icon="delete" title="Delete" data-iconpos="notext" class="deleteThisFile ui-btn ui-btn-icon-notext ui-btn-corner-all ui-shadow ui-btn-down-c ui-btn-up-c">');
                        fileListData.push('<span class="ui-btn-inner ui-btn-corner-all" aria-hidden="true"><span class="ui-btn-text">' + libLang.deleteLabel + '</span>');
                        fileListData.push('<span class="ui-icon ui-icon-delete ui-icon-shadow"></span></a></td></tr>');
                    }
                }
                fileListData.push('</table></div>');
                $('.settingsForm').append(fileListData.join(''));
                $('.settingsForm').trigger('create');
            }
        }
    });
    $('div#settings').trigger('create');
};


jQuery.fn.sendForm = function (itemID, itemType) {
    // Get all of the values from the form fields
    var itemTitle = $('.settingsForm input#title').val(),
      itemAuthor = $('.settingsForm input#author').val(),
      itemDescription = $('.settingsForm textarea#description').val(),
      itemDate = $('.settingsForm input#date').val(),
      itemRev = $('.settingsForm input#_rev').val(),
      itemDelete = $('.settingsForm input#delete:checked').val(),
      itemType = $('.settingsForm select').val(),
      itemFilename = $('.settingsForm input:file').val();
      itemCover = $('.settingsForm input#cover').val();
      _itemType = itemType;

    // Force to add a title (the only required field)
    if (!itemTitle || itemTitle.length == 0) {        
        dialog(libLang.addTitle, "default");
        return;
    }

    // Check for new uploaded file
    if (itemFilename == undefined || itemFilename == "") {
        $('.settingsForm input:file').remove();
        itemFilename = "";
    }
    else {
        itemFilename = itemFilename.replace(/^C:\\fakepath\\/i, '');
    }    

    // If no new file, default to index.html if it exists, then fall back on the old filename
    // This will reset itemFilename to index.html, even if the previous itemFilename was something else
    // This is useful to fix mass-pushed resources, but may conflict with courses (?)
    if (!itemFilename || itemFilename.length == 0) {
        //TODO: Can this be removed? itemFilename = $('.filesList a[href$="index.html"]').text() == "index.html" ? $('.filesList a[href$="index.html"]').text() : $('.settingsForm input#filename').val();
        // itemFilename = $('.settingsForm input#filename').val(); // should this be here? It's resetting to a hidden field, filled in from a query on the resource
    }

    // Check if size of db is above the limit
    dbSize = maxDBSize;
    $.ajax({
        url: "/" + homeURL,
        dataType: 'json',
        async: false,
        success: function (dbInfo) {
            dbSize = dbInfo.data_size;
        }
    });
    if (itemDelete != 'Yes' && dbSize >= maxDBSize) {        
        dialog(libLang.noSpace, "default");
        return;
    }

    if (itemDelete != 'Yes') {

        //show a loading message when submitting changes
        //loadingMessageTextVisible is temporarily set to 'true' so that the libLang text can be shown
        //when the loading message is hidden, loadingMessageTextVisible is set to false in case it
        //is used elsewhere in the system.
        if (itemFilename.length > 0) {
            $.mobile.loadingMessageTextVisible = true;
            $.mobile.showPageLoadingMsg("b", libLang.savingProgress, false)
        }

        if (itemID != 'add') {

            // Update existing record
            $(this).ajaxSubmit({
                url: "/" + homeURL + "/" + itemID,
                data: { "filename": itemFilename },
                success: function (resp) {

                    $.getJSON("/" + homeURL + "/" + itemID, function (revData) {
                        itemRev = revData._rev;
                        itemAttachment = revData._attachments;
                        user = revData.user;

                        if (!revData._attachments || revData._attachments.length == 0) {

                            $.couch.db(homeURL).saveDoc({
                                "_id": itemID,
                                "_rev": itemRev,
                                //TODO: Can this be removed? "filename":itemFilename,
                                "cover": itemCover,
                                "title": itemTitle,
                                "author": itemAuthor,
                                "type": itemType,
                                "description": itemDescription,
                                "date": itemDate,
                                "user": user
                            }, {
                                success: function () {
                                    $.mobile.hidePageLoadingMsg(); //hide the saving message
                                    $.mobile.loadingMessageTextVisible = false; //set to false in case it is used elsewhere - this may not need to be reset to false                                    
                                    dialog(libLang.saved, "refresh");
                                }
                            });
                        }
                        else {
                            $.couch.db(homeURL).saveDoc({
                                "_id": itemID,
                                "_rev": itemRev,
                                //TODO: Can this be removed? "filename":itemFilename,
                                "cover": itemCover,
                                "title": itemTitle,
                                "author": itemAuthor,
                                "type": itemType,
                                "description": itemDescription,
                                "date": itemDate,
                                "user": user,
                                "_attachments": itemAttachment
                            }, {
                                success: function () {
                                    $.mobile.hidePageLoadingMsg(); //hide the saving message
                                    $.mobile.loadingMessageTextVisible = false; //set to false in case it is used elsewhere - this may not need to be reset to false                                                                      
                                    dialog(libLang.saved, "refresh");
                                }
                            });
                        }
                    });
                }
            });
        }
        else {

            // Add new record
            uniqueID = $.couch.newUUID();
            //itemID = itemTitle.replace(/[\s]/g, '_');
            //itemID = homeUser + '-' + itemType.charAt(0).toUpperCase() + itemType.slice(1) + '-' + encodeURI(itemID) + '-' + uniqueID;
            itemID = uniqueID.replace(/[^a-z 0-9 _ -]+/gi, '');


            $('form .settingsForm').attr({ "action": "/" + homeURL + "/" + itemID });

            // Save information
            $.couch.db(homeURL).saveDoc({
                "_id": itemID,
                //TODO: Can this be removed? "filename":itemFilename,
                "cover": itemCover,
                "title": itemTitle,
                "author": itemAuthor,
                "type": itemType,
                "description": itemDescription,
                "date": itemDate,
                "user": homeUser
            }, {
                success: function () {

                    // Get saved info, then add attachment to item
                    $.getJSON("/" + homeURL + "/" + itemID, function (revData) {

                        $('.settingsForm input#_rev').val(revData._rev);

                        var data = {};

                        $.each($("form :input").serializeArray(), function (i, field) {
                            data[field.name] = field.value;
                        });

                        $("form :file").each(function () {
                            data[this.name] = this.value.replace(/^C:\\fakepath\\/g, ''); // file inputs need special handling
                        });

                        itemFilename = data._attachments;

                        $('form.settingsForm').ajaxSubmit({
                            url: "/" + homeURL + "/" + itemID,
                            success: function (resp) {
                                $.getJSON("/" + homeURL + "/" + itemID, function (saveData) {
                                    itemRev = saveData._rev;
                                    itemAttachment = saveData._attachments;

                                    // Resave all information
                                    $.couch.db(homeURL).saveDoc({
                                        "_id": itemID,
                                        "_rev": itemRev,
                                        //TODO: Can this be removed?  "filename":itemFilename,
                                        "cover": itemCover,
                                        "title": itemTitle,
                                        "author": itemAuthor,
                                        "type": itemType,
                                        "description": itemDescription,
                                        "date": itemDate,
                                        "user": homeUser,
                                        "_attachments": itemAttachment
                                    }, {
                                        success: function () {
                                            $.mobile.hidePageLoadingMsg(); //hide the saving message
                                            $.mobile.loadingMessageTextVisible = false; //set to false in case it is used elsewhere - this may not need to be reset to false                                         
                                            dialog(libLang.saved, "refresh");
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
    } else {
        // Delete the item from the library        
        _itemId = itemID;
        _itemRev = itemRev;
        dialog(libLang.areYouSure, "delete");
        /*
        if (confirm(libLang.areYouSure)) {
            $.couch.db(homeURL).removeDoc({ '_id': itemID, "_rev": itemRev });
            window.location.replace("library.html?type=" + itemType);
        }
        */
    }
};


// Save UI Language in _local variable
function saveCurrentLanguage(languageId) {
    $.ajax({
        url: homeDB + "/_local/uilanguage?rev=0-1",
        timeout: 60000,
        type: "DELETE",
        async: false,
        contentType: "application/json",
        error: function () {
            doCurrentLanguage(languageId);
        },
        success: function () {
            doCurrentLanguage(languageId);
        }
    });
}

function doCurrentLanguage(languageId) {
    var result = false;    
    $.ajax({
        url: homeDB + "/_local/uilanguage",
        timeout: 60000,
        type: "PUT",
        async: false,
        data: JSON.stringify({ "currentLangId": languageId}),
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

// Update new data model in existing language files (Ticket #193)
function updateLanguagefile() {

    var langId = '',
        langName = '',
        engLangId = '',
        engTextData = {},
        langList = {};
    isLangDocExist = false;    

    // Get _id & texts fields from latest default(English) language file
    $.ajax({
        url: '/' + homeURL + '/_design/library/_view/languages?callback=',
        dataType: 'json',
        async: false,
        success: function (languagesData) {
            $.each(languagesData.rows, function (cat, rowsHere) {
                currentID = (rowsHere.id).split('-');
                if (currentID.length == 1) {
                    if (rowsHere.key.lang.iso == 'eng' && rowsHere.key.relation.source == 'original') {
                        engLangId = rowsHere.id;
                        engTextData = rowsHere.key.texts;
                    }
                    langList[rowsHere.key.lang.name] = rowsHere.id;
                }
            });
        }
    });
    
    // Get current language file
    $.ajax({
        url: '/' + homeURL + '/_design/library/_view/languages?callback=',
        dataType: 'json',
        async: false,
        success: function (languagesData) {
            $.each(languagesData.rows, function (cat, rowsHere) {
                currentID = (rowsHere.id).split('-');
                docId = currentID[currentID.length - 1];
                createdUsername = currentID[currentID.length - 2];

                var langData = {},
                    relationData = {},
                    sourceIdList = [];

                if (currentID.length > 1) {
                    if (rowsHere.key.current == true) {
                        isLangDocExist = true;
                        langId = rowsHere.id;
                        langName = rowsHere.key.name;

                        if (createdUsername == 'Default') {
                            // Set language texts if the current language is built in language
                            $.each(langList, function (key, value) {
                                if (key == langName) {
                                    saveCurrentLanguage(value);

                                    //Set language texts 
                                    $.ajax({
                                        url: '/' + homeURL + '/' + value,
                                        dataType: 'json',
                                        async: false,
                                        success: function (langData) {
                                            libLang = langData.texts;
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            // Set language texts if the current language is user contributed language
                            langTextData = rowsHere.key.texts;
                            $.each(engTextData, function (key, value) {
                                if (!(key in langTextData)) {
                                    langTextData[key] = value;
                                }
                            });

                            langData["iso"] = "eng";
                            langData["name"] = rowsHere.key.name;
                            sourceIdList.push(engLangId);
                            relationData["source"] = sourceIdList;

                            // Create existing user defined language doc in new data model                           
                            $.ajax({
                                url: '/' + homeURL + '/' + docId,
                                contentType: "application/json",
                                dataType: "json",
                                type: "PUT",
                                async: false,
                                data: JSON.stringify({
                                    "_id": docId,
                                    "type": rowsHere.key.type,
                                    "creator": createdUsername,
                                    "lang": langData,
                                    "relation": relationData,
                                    "texts": langTextData
                                }),
                                success: function (saved) {
                                    if (saved) {
                                        saveCurrentLanguage(docId);
                                        //Set language texts 
                                        libLang = langTextData;
                                    }
                                },
                                error: function () {
                                    console.log("Error: Create existing user defined language doc in new data model");
                                }
                            });
                        }
                    }

                    if (createdUsername != 'Default') {

                        langTextData = rowsHere.key.texts;
                        $.each(engTextData, function (key, value) {
                            if (!(key in langTextData)) {
                                langTextData[key] = value;
                            }
                        });

                        langData["iso"] = "eng";
                        langData["name"] = rowsHere.key.name;
                        sourceIdList.push(engLangId);
                        relationData["source"] = sourceIdList;                        

                        // Create existing user defined language doc in new data model                        
                        $.ajax({
                            url: '/' + homeURL + '/' + docId,
                            contentType: "application/json",
                            dataType: "json",
                            type: "PUT",
                            async: false,
                            data: JSON.stringify({
                                "_id": docId,
                                "type": rowsHere.key.type,
                                "creator": createdUsername,
                                "lang": langData,
                                "relation": relationData,
                                "texts": langTextData
                            }),
                            success: function (saved) {
                                if (saved) {
                                    console.log("Success: Create existing user defined language doc in new data model");
                                }
                            },
                            error: function () {
                                console.log("Error: Create existing user defined language doc in new data model");
                            }
                        });

                    }

                    // Remove existing default language & user defined language docs                    
                    $.ajax({
                        url: '/' + homeURL + '/' + rowsHere.id,
                        dataType: 'json',
                        async: false,
                        success: function (data) {
                            $.couch.db(homeURL).removeDoc({ '_id': rowsHere.id, "_rev": data._rev });
                        }
                    });
                }

            });
        }
    });
    if (!isLangDocExist) {
        var defaultLangId = '';        

        //Set language texts for new users
        $.ajax({
            url: '/' + homeURL + '/_design/library/language.json',
            dataType: 'json',
            async: false,
            success: function (langData) {
                defaultLangId = langData._id;
                libLang = langData.texts;                
            }
        });
        
        saveCurrentLanguage(defaultLangId);
    }
}

// Initialize library authentication
$('div[data-role="page"]').live("pageshow", function() {

   // Make sure user is logged in if they are not already on the login page
   if($('h1').attr('data-login') !== "login"){
      $('div[data-role="page"]').libraryAuth();
   }

   $('.ui-footer').after('<a href="http://creativecommons.org/licenses/by-sa/3.0/" style="display: block;position: relative; top: 10px; text-align: center;"><img src="style/images/by-sa.png" alt="Creative Commons License" /></a>');

   // Get text for language
   document.title = libLang.title;
/* $('a.backBtn span.ui-btn-text').text(libLang.backBtn);*/
   $('h1.ui-title').text(libLang.title);
   $('a.homeBtn').attr({'title': libLang.homeBtn});
   $('a.homeBtn span.ui-btn-text').text(libLang.homeBtn);
   $('a.optionsBtn').attr({'title': libLang.optionsBtn});
   $('a.optionsBtn span.ui-btn-text').text(libLang.optionsBtn);
});
