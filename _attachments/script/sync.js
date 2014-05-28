/* Little Library
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

$(document).ready(function() {
    //find out if this has a replication target attached to it via url paramter
    //and put it in the target field
    var replicationTarget = $.getUrlVar('ip');
    if (typeof replicationTarget !== 'undefined'){
        $("#repFrom").val(replicationTarget);
    }
});

function submitSync(repFrom, continuousRep, storedPassword) {
    // var repTriggered = false;
    if (repFrom !== '' && (storedPassword !== null || storedPassword !== "")) {
        var secureHome = "http://" + homeUser + ":" + storedPassword + "@" + window.location.host + "/" + homeURL;
        var theSource = repFrom.split("/");
        var singleDocumentReplication = (theSource.length === 5);



        /*
        * DELETE existing replications. There will normally be no more than 1.
        * Do not delete replications for application updates.
        * Note that we don't allow the user to create continuous replications.
        */

        $.getJSON(currentHost + '/_replicator/_all_docs', function (data) {
            $.each(data.rows, function (i, theRow) {
                $.ajax({
                    url: currentHost + '/_replicator/' + theRow.id,
                    type: "GET",
                    dataType: 'json',
                    async: false,
                    contentType: "application/json",
                    success: function (doc) {
                        if (doc._id !== "_design/_replicator" && (typeof doc.source !== 'undefined' && !doc.source.match(onlineBase + '/' + remoteDB))) {
                            $.ajax({
                                url: "/_replicator/" + doc._id + "?rev=" + doc._rev,
                                timeout: 60000,
                                type: "DELETE",
                                contentType: "application/json",
                                success: function () {
                                    console.log('Replication deleted: ' + doc._id + '?rev=' + doc._rev);
                                }
                            });
                        }
                    }
                });
            });
        });

        if (singleDocumentReplication) {
            var theDoc = theSource[4];
            var repFromBase = repFrom.substr(0, repFrom.indexOf(theDoc) - 1);

            $.ajax({
                url: "/_replicator",
                timeout: 60000,
                type: "POST",
                data: JSON.stringify({ "source": repFromBase, "target": secureHome,
                    "userCtx": { "name": homeUser, "roles": ["_admin", homeUser] },
                    "continuous": continuousRep,
                    "connection_timeout": 6000000,
                    "retries_per_request": 10,
                    "http_connections": 3,
                    "doc_ids": [theDoc]
                }),
                contentType: "application/json",
                error: function () {                    
                    dialog(libLang.noSync);
                },
                success: function (message) {
                    if (message) {                        
                        dialog(libLang.synced);
                    }
                    repTriggered = true;
                }
            });

        } else {

            $.ajax({
                url: "/_replicator",
                timeout: 60000,
                type: "POST",
                data: JSON.stringify({ "source": repFrom, "target": secureHome,
                    "userCtx": { "name": homeUser, "roles": ["_admin", homeUser] },
                    "continuous": continuousRep,
                    "connection_timeout": 6000000,
                    "retries_per_request": 10,
                    "http_connections": 3
                }),
                contentType: "application/json",
                error: function () {                    
                    dialog(libLang.noSync);
                },
                success: function (message) {
                    if (message) {                        
                        dialog(libLang.synced);
                    }
                    repTriggered = true;
                }
            });
        }
    }
}

// Show the message in Modal Dialog instead of Alert
function dialog(message) {
    $('<div>').simpledialog
        ({
            mode: 'button',
            headerText: libLang.appName,
            headerClose: false,
            buttonPrompt: message,
            buttons: {
                'OK': {
                    id: 'btn_Ok',
                    click: function () {
                    }
                }
            }
        });
    $("#btn_Ok").find('.ui-btn-text').html(libLang.okBtn);
}

// Initialize the page
$('div#sync').live("pageshow", function () {
    // Get text for language
    $('h1').text(libLang.syncOptions);
    $('.ui-slider-label-b').text(libLang.once);
    $('.ui-slider-label-a').text(libLang.continuously);
    $('.getFrom').text(libLang.getFrom);
    // $('.getFrom span.ui-btn-inner').text(libLang.getFrom);
    // $('.submitRepFrom span.ui-btn-inner').text(libLang.get);
    $(".syncForm").find('.ui-btn-text').text(libLang.get);
    $('#syncInstructions').html("<h2>" + libLang.instructions + "</h2><p>" + libLang.syncInstructions + "</p>");
    $('.userLabel').text(libLang.userLabel);
    $('.passLabel').text(libLang.passLabel);
    $('.login').text(libLang.login);
    $('th.object').text(libLang.database);
    $('th.status').text(libLang.status);

    // Get the library URL
    $('span.libraryURL').text(homeDB);

    // Find and display the any existing replication.  Normally there will be no more than 1.
    // To avoid race conditions, this must be done synchronously (async: false).
    var lastRep = "";

    $.ajax({
        url: currentHost + "/_replicator/_all_docs",
        type: "GET",
        dataType: 'json',
        contentType: "application/json",
        async: false,
        success: function (data) {
            $.each(data.rows, function (i, theRow) {

                $.ajax({
                    url: currentHost + '/_replicator/' + theRow.id,
                    type: "GET",
                    dataType: 'json',
                    async: false,
                    contentType: "application/json",
                    success: function (doc) {
                        if (doc._id !== "_design/_replicator" && (typeof doc.source !== 'undefined')) {
                            lastRep = doc.source;
                        }
                    }
                });
            });

            $('.syncForm input#repFrom').val(lastRep);
        }
    });

    // On submit, set up Sync Options for getting replication
    $('.submitRepFrom').click(function (event) {
        event.preventDefault();
        //URL validation (the Regex function has copied from jquery.validate.js file)
        repFrom = $.trim($('.syncForm input#repFrom').val());
        if (!(/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(repFrom))) {
            dialog(libLang.invalidURL);
        }
        else {
            $.mobile.showPageLoadingMsg();
            // gather info from DOM (page)

            // globals on purpose

            storedPassword = userPassword; //sessionStorage.getItem('current');
            continuousRep = false;

            // Try submitting the request
            if (storedPassword === null || storedPassword === "") {
                $.mobile.changePage("sync_login.html", { transition: 'pop', role: 'dialog', type: 'get', data: { user: homeUser} });
            } else {
                submitSync(repFrom, continuousRep, storedPassword);
            }

            // Make sure the URL is filled in and create new a replication entry

            $.mobile.hidePageLoadingMsg();
        }
    });
});

$('div#sync_login').live("pageshow", function() {
  $('h1').text(libLang.login);
  $('.userLabel').text(libLang.userLabel);
  $('.passLabel').text(libLang.passLabel);
  $('.login').text(libLang.login);

  $("#username").val(homeUser);
  $("#password").val(userPassword);

  $('.login').click(function() {
    sessionStorage.setItem('current',$('#password').val());
    storedPassword = sessionStorage.getItem('current');
    return submitSync(repFrom, continuousRep, storedPassword);
  });
});