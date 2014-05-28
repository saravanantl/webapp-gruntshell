$('div#about').live("pageshow", function () {
    // Remove change password feature
    /* $('.passwordForm').remove(); */

    $('.librarySize').text(libLang.totalSize);
    $('.compact span.ui-btn-inner').text(libLang.compact);
    $('.compact label').text("(" + libLang.compactLabel + ")");
    $('.logInfo').text(libLang.logout);

    $('label.newPass').text(libLang.newPass);
    $('label.repeatPass').text(libLang.repeatPass);

    $('.logout span.ui-btn-inner').text(libLang.logout);
    $('h1').text(libLang.about);
    $('.networkForm h3').text(libLang.network);
    $('#network').parent().find('.ui-btn-text').text(libLang.update);
    $('.networkForm label').text(libLang.putOnNetwork);
    $('.networkForm .ui-slider-label-a').text(
    libLang.networkingOn);
    $('.networkForm .ui-slider-label-b').text(
    libLang.networkingOff);
    var updateSoftware = getSoftwareUpdatePref();
    $("input[type='checkbox']:first").attr("checked", updateSoftware).checkboxradio("refresh");

    $('div.appUpdates h3').text(libLang.SoftwareUpdates);
    $("div.appUpdates label[for='alwaysUpdateSwitch'] span.ui-btn-text").text(libLang.AlwaysUpdate);
    $('#updatecheck').text(libLang.updatecheck).button('refresh');

    $('#updatenickname').text(libLang.update).button('refresh');
    $('input#nickname').val(nickname);

    // Show the message in Modal Dialog instead of Alert
    function dialog(message, mode) {
        if (mode == 'redirect') {
            $('<div>').simpledialog
            ({
                mode: 'button',
                headerText: libLang.appName,
                headerClose: false,
                buttonPrompt: message,
                buttons: {
                    'Ok': {
                        id: 'btn_Redirect',
                        click: function () {
                            //event.preventDefault();
                            $.ajax({
                                url: "/_restart",
                                type: "POST",
                                contentType: "application/json",
                                success: function () {
                                    window.location.replace('login.html');
                                }
                            });
                        }
                    }
                }
            });

            //Assign button text from language file        
            $("#btn_Redirect").find('.ui-btn-text').html(libLang.okBtn);
            $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
        }
        else if (mode == 'refresh') {
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
                            window.location.replace('about.html');
                        }
                    }
                }
            });

            //Assign button text from language file        
            $("#btn_Refresh").find('.ui-btn-text').html(libLang.okBtn);
            $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
        }
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

    //TODO: See if this can be moved to only execute when the check for update button is clicked.
    var updateAvailable = false;
	var minApkOK		= true;
    var remoteVersion 	= 0;
	var remoteMinApk 	= 0;
    console.log("templateDB: " + templateDB);
    $.ajax({
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        url: templateDB + '/appinfo',
        beforeSend: setHeader,
        error: function (error) {
            console.log(error);
        },
        success: function (remoteAppInfo) {
            remoteVersion 	= remoteAppInfo[env]["version"];
			remoteMinApk 	= remoteAppInfo[env]["minAPKversion"];
			minApkOK		= (parseFloat(minApk) >= parseFloat(remoteMinApk));
            updateAvailable = (parseFloat(version) < parseFloat(remoteVersion)) &&
								minApkOK;
        }
    });

    //TODO: get estanteuser:password from appinfo
    function setHeader(xhr) {
        console.log("setHeader");
        xhr.setRequestHeader('Authorization', "Basic " + btoa("estanteuser:Dnbatfydnkwadm6f"));
    }


    // Show current size of library
    $.getJSON(
    homeDB, function (dbInfo) {
        netTotal = dbInfo.disk_size / maxDBSize;
        total = Math.round(netTotal * 100);
        spaceUsed = Math.round(dbInfo.disk_size / 1000000);
        spaceUsedTwo = spaceUsed * 2;

        if (spaceUsedTwo <= 10) {
            spaceUsedTwo = 10;
        }

        $('h3.librarySize').after('<p><span style="border: 1px solid #225377; height: 20px; width: 200px; padding: 6px; text-align: right; display: inline-block; position: relative;border-radius: 6px; z-index: 1; overflow: hidden; -webkit-box-shadow: inset 0px 0px 6px #aaa;">' + spaceUsed + 'MB<span style="border-radius: 6px;background: #bbb; display: block; position: absolute; top: 0px; height: 32px; right: 0px;width: ' + spaceUsedTwo + 'px;z-index: -1;"> </span></span> (' + total + libLang.limit + ')</p>');
    });

    // See if library is broadcasting on the local network
    $.ajax({
        url: "/_config/httpd/bind_address",
        type: "GET",
        async: false,
        contentType: "text/plain",
        success: function (resp) {
            var response = resp.replace(/(")/g, '');

            // If broadcasting on local network, provide network
            // address and set network to "On"
            if (response.length !== 10) {

                /* $("#networkSwitch").val("networkingOn").slider("refresh"); */
                var myswitch = $("#networkSwitch");
                myswitch[0].selectedIndex = 1;
                myswitch.slider("refresh");
            }
        }
    });

    // Compact database
    $('input.compact').live('click', function (event) {

        event.preventDefault();

        $.ajax({
            url: homeDB + "/_compact",
            type: "POST",
            contentType: "application/json",
            async: true,
            success: function () {
                window.location.replace("about.html");
            }
        });
        dialog(libLang.compacted, "default");
    });

    // Update Nickname
    $('input.updatenickname').live('click', function (event) {
        event.preventDefault();
        nickname = $.trim($('input#nickname').val());
        saveUserNickname(nickname, userPassword);
        dialog(libLang.saved, "refresh");
    });

    // Set up library on the local network
    $('input#network').live('click', function (event) {

        event.preventDefault();

        if ($('select#networkSwitch').val() == "networkingOn") {
            // Turn on local networking
            $.ajax({
                url: "/_config/httpd/bind_address",
                type: "PUT",
                data: JSON.stringify("0.0.0.0"),
                contentType: "application/json",
                success: function () {
                    dialog(libLang.networkingOn, "redirect");
                }
            });


        } else {
            // Turn off local networking
            $.ajax({
                url: "/_config/httpd/bind_address",
                type: "PUT",
                data: JSON.stringify("127.0.0.1"),
                contentType: "application/json",
                success: function () {
                    dialog(libLang.networkingOff, "redirect");
                }
            });
        };
    });

    // Check for application updates
    $('input.updatecheck').live('click', function (event) {

        secureHome = "http://" + homeUser + ":" + sessionStorage.getItem('current') + "@" + window.location.host + "/" + homeURL;
        alwaysUpdate = $('.appUpdateForm input#alwaysUpdateSwitch').is(':checked');
        console.log('updatecheck: ' + updateAvailable)
		
		if (!minApkOK) {
			dialog(libLang.needNewAPK, "default");
		};
		
        if (updateAvailable) {

            /*
            * DELETE only existing app update replications. There will normally be no more than 1.
            * Needed in particular for the case of the user 1st saying they to always update and then
            * changing their mind.
            */

            $.ajax({
                url: currentHost + '/_replicator/_all_docs',
                type: "GET",
                dataType: 'json',
                async: false,
                contentType: "application/json",
                success: function (data) {
                    $.each(data.rows, function (i, theRow) {
                        $.ajax({
                            url: currentHost + '/_replicator/' + theRow.id,
                            type: "GET",
                            dataType: 'json',
                            async: false,
                            contentType: "application/json",
                            success: function (doc) {
                                if (doc._id !== "_design/_replicator" && doc.source.match(onlineBase + '/' + remoteDB)) {
                                    $.ajax({
                                        url: "/_replicator/" + doc._id + "?rev=" + doc._rev,
                                        timeout: 60000,
                                        type: "DELETE",
                                        async: false,
                                        contentType: "application/json",
                                        success: function () {
                                            console.log('Replication deleted: ' + doc._id + '?rev=' + doc._rev);
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            });

            $.ajax({
                url: "/_replicator",
                type: "POST",
                async: false,
                data: JSON.stringify({ "source": templateDB, "target": secureHome,
                    "userCtx": { "name": homeUser, "roles": ["_admin", homeUser] },
                    "continuous": alwaysUpdate,
                    "retries_per_request": 20,
                    "http_connections": 30
                }),
                contentType: "application/json",
                error: function () {
                    dialog(libLang.updateFailed, "default");
                    saveSoftwareUpdate(alwaysUpdate);
                    $.mobile.hidePageLoadingMsg();
                },
                success: function (message) {
                    saveSoftwareUpdate(alwaysUpdate);
                    if (message) {
                        dialog(libLang.updateStarted, "refresh");
                        $.mobile.hidePageLoadingMsg();
                    }
                }
            });
        } else {
            dialog(libLang.noUpdate, "default");
            saveSoftwareUpdate(alwaysUpdate);

        }
    });

});