/* Little Library
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

// Initialize the page
$('div#interface').live("pageshow", function () {
    // Get text for language
    $('h1').text(libLang.interface);
    $('.language').text(libLang.language);
    $('.deleteLang').text(libLang.deleteLanguage);
    $('.changeLang').text(libLang.changeLanguage);
    $('.changeLangText').text(libLang.changeLanguageText);
    $('.languageInstructions').html("<strong>" + libLang.instructions + ":</strong> " + libLang.languageInstructions);
    $('.languageForm .SubmitBtn span.ui-btn-inner').text(libLang.submitBtn);
    $('.deleteLanguageForm .deleteBtn span.ui-btn-inner').text(libLang.deleteLabel);
    var itemID = '';
    var availableLangList = [];
    var shareLanguageURL = '';

    // Show the message in Modal Dialog instead of Alert
    function dialog(message, mode) {
        if (mode == 'delete') {
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
                            event.preventDefault();
                            $.ajax({
                                url: '/' + homeURL + '/' + itemID,
                                dataType: 'json',
                                async: false,
                                success: function (data) {
                                    $.couch.db(homeURL).removeDoc({ '_id': itemID, "_rev": data._rev });
                                    window.location.replace("interface.html");
                                }
                            });
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
                            window.location.replace("interface.html");
                        }
                    }
                }
            });

            //Assign button text from language file
            $("#btn_Refresh").find('.ui-btn-text').html(libLang.okBtn);
            $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
        }
        else if (mode == 'notify') {
            $('<div>').simpledialog
            ({
                mode: 'button',
                headerText: libLang.appName,
                headerClose: false,
                buttonPrompt: message,
                buttons: {
                    'Ok': {
                        id: 'btn_Notify',
                        click: function () {                            
                            window.location = shareLanguageURL;
                        }
                    }
                }
            });

            //Assign button text from language file
            $("#btn_Notify").find('.ui-btn-text').html(libLang.okBtn);
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

    // Fill dropdown with language options
    $.ajax({
        url: '/' + homeURL + '/_design/library/_view/languages?callback=',
        dataType: 'json',
        success: function (languagesData) {

            $('select#language option').remove();
            $.each(languagesData.rows, function (cat, rowsHere) {

                var appendNickname = '';
                var sourceLangtexts = {};

                if (rowsHere.key.relation.source != 'original') {
                    appendNickname = " (" + rowsHere.key.creator + ")";
                }

                if (currentLangId == rowsHere.id) {
                    //currentID = (rowsHere.id).split('-');                    

                    if (appendNickname != '') {
                        var userLanguage = []
                        shareLanguageURL = "/" + homeURL + "/" + rowsHere.id + "?qr";                        
                        userLanguage.push('<span class="shareQRSpan"><a id="shareLanguage" class="shareQRLink" rel="external" href="#" >');
                        userLanguage.push('<img src="style/images/qr_estante.png" width="64" height="64"></a><br />' + libLang.sendToEstante + '</span>');
                        $('#dvUserLanguage').html(userLanguage.join(''));

                        var sourceIdList = rowsHere.key.relation.source;
                        sourceIdList.reverse();
			
                        //Get sourceId texts from current language (check in descending order if the sourceId is available or not ) 
                        $.each(sourceIdList, function (index, sourceId) {
                            if (JSON.stringify(sourceLangtexts).length < 5) {
                                $.ajax({
                                    url: '/' + homeURL + '/' + sourceId,
                                    dataType: 'json',
                                    async: false,
                                    success: function (langData) {
                                        sourceLangtexts = langData.texts;
                                    },
                                    error: function (request, status, error) {                                        
                                        console.log("Error: " + error);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        sourceLangtexts = rowsHere.key.texts;
                    }

                    // Create options dropdown for current item
                    $('select#language').append('<option value="' + rowsHere.id + '" selected="selected">' + rowsHere.key.lang.name + appendNickname + '</option>');
                    $('.languageForm .ui-select span.ui-btn-text').text(rowsHere.key.lang.name + appendNickname);

                    // Create editing form
                    $('h3.changeLangText').append(' - <span style="color:#254F7A">' + rowsHere.key.lang.name + appendNickname + '</span>');
                    $('.ui-content').append('<form class="uiForm" method="PUT" enctype="multipart/form-data"><div id="editUI"></div><div data-theme="b" class="ui-btn ui-btn-corner-all ui-shadow ui-btn-inline ui-btn-up-b ui-btn-up-b" aria-disabled="false"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">' + libLang.submitBtn + '</span></span><input type="submit" id="submitEdit" data-inline="true" data-theme="b" class="submitEdit ui-btn-hidden" value="' + libLang.submitBtn + '" aria-disabled="false" /></div></form>');

                    // Make the name of the language file editable
                    langLabel = "name";
                    $('#editUI').append('<div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="' + langLabel + '" class="' + langLabel + 'Label ui-input-text"><strong>' + libLang.titleLabel + '</strong></label><br /><input type="text" value="' + rowsHere.key.lang.name + '" name="' + langLabel + '" id="' + langLabel + '" class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c" /></div><br/>');

                    //Add fields in array for sorting
                    var arrLangFields = [];
                    $.each(rowsHere.key.texts, function (variable, value) {
                        arrLangFields.push(variable);
                    });
                    //Sorting the fields in array
                    arrLangFields.sort();

                    var langTexts = rowsHere.key.texts;

                    // Add editable UI fields to the form in ascending order                        
                    $.each(arrLangFields, function (index, variable) {
                        // Don't make EULA editable
                        if (variable != "terms" && variable != "_conflicts" && variable != "_deleted_conflicts"
                            && variable != "_revs_info" && variable != "_attachments" && variable != "couchapp") {
                            // Add fields in textboxes for editing
                            $('#editUI').append('<div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="' + variable + '" class="' + variable + 'Label ui-input-text"><strong>' + sourceLangtexts[variable] + '</strong></label><br/><textarea name="' + variable + '" id="' + variable + '" class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c">' + langTexts[variable] + '</textarea></div>');
                        }
                    });

                    $.each(rowsHere.key, function (topVariable, topValue) {
                        // Add some hidden fields to the form like _id, _rev & type
                        if (topVariable != "texts" && topVariable != "lang") {
                            $('#editUI').append('<input type="hidden" value="' + topValue + '" name="' + topVariable + '" id="' + topVariable + '" class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c">');
                        }
                    });
                }
                else {
                    // If not the current language, just add drop down option

                    //currentID = (rowsHere.id).split('-');                    
                    $('select#language').append('<option value="' + rowsHere.id + '">' + rowsHere.key.lang.name + appendNickname + '</option>');

                    if (rowsHere.key.relation.source != 'original') {
                        //Add available language list in array
                        availableLangList.push(rowsHere.key.lang.name);

                        //Display language deletable section
                        $(".dvdeleteLanguage").show()

                        // Create the list of deletable languages
                        $('select#deleteLanguage').append('<option value="' + rowsHere.id + '">' + rowsHere.key.lang.name + appendNickname + '</option>');
                    }
                }

            });
        }
    });

    // Delete a language file
    $('form.deleteLanguageForm input.delete').live('click', function (event) {
        event.preventDefault();
        $.mobile.showPageLoadingMsg();
        itemID = $('.deleteLanguageForm select option:selected').val();
        if (itemID && itemID != '') {
            // Delete the language file from the library
            dialog(libLang.areYouSure, "delete");
        };
        $.mobile.hidePageLoadingMsg();
    });

    // Functionality for the form that changes language text
    $('form.uiForm input#submitEdit').live('click', function (event) {

        event.preventDefault();

        $.mobile.showPageLoadingMsg();

        langTitle = $('input#name').val();
        langRev = $('input#_rev').val();
        langID = $('input#_id').val();
        langType = $('input#type').val();
        rawLangName = $('input#name').val();
        itemID = langID;
        // Array that will hold the language text fields for saving later
        var textData = {};
        $.each($("form.uiForm :input").serializeArray(), function (i, field) {

            if (field.name != "_rev" && field.name != "_id" && field.name != "relation"
                        && field.name != "type" && field.name != "lang" && field.name != ""
                        && field.name != "_conflicts" && field.name != "_deleted_conflicts"
                        && field.name != "_revs_info" && field.name != "_attachments"
                        && field.name != "creator") {
                textData[field.name] = field.value;
            }
        });

        var langDatalst = {},
            relationData = {},
            sourceIdList = [],
            curLangName = '',
            isDocExist = false;

        //Check the new language name already exists or not                    
        $.each(availableLangList, function (index, value) {
            if (value.toLowerCase() == rawLangName.toLowerCase()) {
                isDocExist = true;
            }
        });

        // Change current language text and create/ update language doc
        $.ajax({
            url: '/' + homeURL + '/' + langID,
            dataType: 'json',
            async: false,
            success: function (langData) {
                // set new data model values
                langDatalst["iso"] = langData.lang.iso;
                langDatalst["name"] = rawLangName;
                curLangName = langData.lang.name;

                //add array of Sourcelist 
                if (langData.relation.source == 'original') {
                    sourceIdList.push(langID);
                    relationData["source"] = sourceIdList;
                }
                else if (curLangName == rawLangName) {
                    relationData["source"] = langData.relation.source;
                }
                else {
                    sourceIdList = langData.relation.source;
                    sourceIdList.push(langID);
                    relationData["source"] = sourceIdList;
                }

                // If the language file name or the user is new, create a new file
                if (curLangName.toLowerCase() != rawLangName.toLowerCase()) {
                    if (isDocExist) {
                        $.mobile.hidePageLoadingMsg();
                        dialog(libLang.validateLanguageName, "default");
                        return;
                    }

                    uniqueID = $.couch.newUUID();
                    itemID = uniqueID;
                    itemID = itemID.replace(/[^a-z 0-9 _ -]+/gi, '');

                    // Create new language file
                    $.ajax({
                        url: '/' + homeURL + '/' + itemID,
                        contentType: "application/json",
                        dataType: "json",
                        type: "PUT",
                        async: false,
                        data: JSON.stringify({
                            "_id": itemID,
                            "type": langType,
                            "creator": nickname,
                            "lang": langDatalst,
                            "relation": relationData,
                            "texts": textData
                        }),
                        success: function (savedNow) {
                            if (savedNow) {
                                saveCurrentLanguage(itemID);
                                dialog(libLang.saved, "refresh");
                            };
                        },
                        error: function () {
                            dialog(libLang.errorSettings, "default");
                        }
                    });
                }
                else if (langData.relation.source == 'original') {

                    if (isDocExist) {
                        $.mobile.hidePageLoadingMsg();
                        dialog(libLang.validateLanguageName, "default");
                        return;
                    }

                    uniqueID = $.couch.newUUID();
                    itemID = uniqueID;
                    itemID = itemID.replace(/[^a-z 0-9 _ -]+/gi, '');

                    // Create new language file
                    $.ajax({
                        url: '/' + homeURL + '/' + itemID,
                        contentType: "application/json",
                        dataType: "json",
                        type: "PUT",
                        async: false,
                        data: JSON.stringify({
                            "_id": itemID,
                            "type": langType,
                            "creator": nickname,
                            "lang": langDatalst,
                            "relation": relationData,
                            "texts": textData
                        }),
                        success: function (savedNow) {
                            if (savedNow) {
                                saveCurrentLanguage(itemID);
                                dialog(libLang.saved, "refresh");
                            };
                        },
                        error: function () {
                            dialog(libLang.errorSettings, "default");
                        }
                    });

                }
                else {
                    // Update old language file
                    $.ajax({
                        url: '/' + homeURL + '/' + itemID,
                        contentType: "application/json",
                        dataType: "json",
                        type: "PUT",
                        async: false,
                        data: JSON.stringify({
                            "_id": itemID,
                            "_rev": langData._rev,
                            "type": langType,
                            "creator": nickname,
                            "lang": langDatalst,
                            "relation": relationData,
                            "texts": textData
                        }),
                        success: function (savedNow) {
                            if (savedNow) {
                                saveCurrentLanguage(itemID);
                                dialog(libLang.saved, "refresh");
                            };
                        },
                        error: function () {
                            dialog(libLang.errorSettings, "default");
                        }
                    });
                }
            }
        });
    });


    // On submit, change current language
    $('#language').change(function (event) {

        event.preventDefault();

        // $.mobile.showPageLoadingMsg();

        itemID = $('.languageForm select option:selected').val();
        saveCurrentLanguage(itemID);
        //dialog(libLang.saved, "refresh"); 
        window.location.replace("interface.html");

        /*
        $.ajax({
            url: '/' + homeURL + '/_design/library/_view/currentLang?callback=',
            dataType: 'json',
            async: false,
            success: function (langJSON) {
                $.ajax({
                    url: '/' + homeURL + '/' + langJSON.rows[0].id,
                    dataType: 'json',
                    async: false,
                    success: function (langData) {
                        langData.current = false;

                        $.ajax({
                            url: '/' + homeURL + '/' + langJSON.rows[0].id,
                            contentType: "application/json",
                            dataType: "json",
                            type: "PUT",
                            async: false,
                            data: JSON.stringify(langData),
                            success: function () {

                                $.ajax({
                                    url: '/' + homeURL + '/' + itemID,
                                    dataType: 'json',
                                    async: false,
                                    success: function (langDataNew) {
                                        langDataNew.current = true;

                                        $.ajax({
                                            url: '/' + homeURL + '/' + itemID,
                                            contentType: "application/json",
                                            dataType: "json",
                                            type: "PUT",
                                            async: false,
                                            data: JSON.stringify(langDataNew),
                                            success: function (savedNow) {
                                                if (savedNow) {
                                                    dialog(libLang.saved, "refresh");
                                                };
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        */
    });

    $(document).ready(function () {
        $("#dvUserLanguage a").live('click', function (event) {
            event.preventDefault();            
            dialog(libLang.needNewWebApp, "notify");
        });
    });
});