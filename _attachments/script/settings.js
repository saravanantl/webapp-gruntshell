/* Little Library
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */


// Initialize the page
$('div#settings').live("pageshow", function() {

  // Get text for language
  $('.delResources').text(libLang.deleteLabel);
  $('.titleLabel').text(libLang.titleLabel);
  $('.authorLabel').text(libLang.authorLabel);
  $('.descriptionLabel').text(libLang.descriptionLabel);
  $('.dateLabel').text(libLang.dateLabel);
  $('.typeLabel').text(libLang.typeLabel);
  $('.fileLabel').text(libLang.fileLabel);
  $('.finalField .ui-btn-text').text(libLang.submitBtn);
  $('.Submit').val(libLang.submitBtn);
  $('.select-books').text(libLang.books);
  $('.select-pictures').text(libLang.pictures);
  $('.select-videos').text(libLang.videos);
  $('.select-audio').text(libLang.audio);
  $('.select-documents').text(libLang.documents);
  $('.select-notes').text(libLang.notes);
  $('.select-courses').text(libLang.courses);

  // Get the document id and type (i.e. book, video, etc.) from the URL
  var itemID = $('#settings').getParameter('id'),
        itemType = $('#settings').getParameter('type'),
        fileURL = '',
        rowId = '';
    //convert special characters in itemID by using "decodeURI"
    itemID = decodeURI(itemID);

  // Set the title of the page
  $('h1').text(libLang.add +' '+ libLang[itemType]);

    //set the back button
    $('a .backBtn').text('library.html?type=' + itemType);

    // Set the item's type/category
    $('.settingsForm .typeField .ui-btn-text').text(libLang[itemType]);
    $('.settingsForm select#type').val(itemType);

    // If user has clicked on add button, don't look for any JSON files to fill in form and remove delete button
    $('.deleteButton').fadeOut();

    if (itemType == 'notes') {

        $('.settingsForm .descriptionLabel').text(libLang[itemType]);
        $('.settingsForm #description').attr('style', 'height: 250px;');
    }

    // Fill out the form with data if it exists
    if (itemID != 'add') {
        $('.deleteButton').fadeIn();
        $('.settingsForm').formShow(itemID);
    };


    /*// Show progress of uploads
    $('input[type="file"]').change(function(){
    $(this).after('<progress max="100" value="50">50</progress>');
    });*/

    // When user clicks on the form submit button, information is saved to the database
    $('input.Submit').click(function (event) {

        event.preventDefault();

        $('.settingsForm').sendForm(itemID, itemType);

    });

    // Show the message in Modal Dialog instead of Alert
    function dialog(message, source) {
        if (source == 'file') {
            $('<div>').simpledialog
            ({
                mode: 'button',
                headerText: libLang.appName,
                headerClose: false,
                buttonPrompt: message,
                buttons: {
                    'OK': {
                        id: 'btn_DeleteFile',
                        click: function () {
                            event.preventDefault();
                            $.getJSON("/" + homeURL + "/" + itemID, function (revData) {
                                itemRev = revData._rev;
                                $.ajax({
                                    url: '/' + homeURL + '/' + itemID + '/' + fileURL + '?rev=' + itemRev,
                                    dataType: 'json',
                                    type: 'DELETE'
                                });
                                rowId.fadeOut();
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
            $("#btn_DeleteFile").find('.ui-btn-text').html(libLang.okBtn);
            $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
        }
        else if (source == 'resource') {
            $('<div>').simpledialog
            ({
                mode: 'button',
                headerText: libLang.appName,
                headerClose: false,
                buttonPrompt: message,
                buttons: {
                    'OK': {
                        id: 'btn_DeleteResource',
                        click: function () {
                            rowId.fadeOut();
                            var theData = "{\"" + itemID + "\":[\"" + $('.settingsForm input#_rev').val().toString() + "\"]}";
                            $.ajax({
                                url: '/' + homeURL + '/_purge',
                                timeout: 60000,
                                type: "POST",
                                async: false,
                                data: theData,
                                contentType: "application/json"
                            });
                            window.location.replace("library.html?type=" + itemType);
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
            $("#btn_DeleteResource").find('.ui-btn-text').html(libLang.okBtn);
            $("#btn_Cancel").find('.ui-btn-text').html(libLang.cancelBtn);
        }
    }

    // Delete entire resource
    $('a.deleteThisRescource').live('click', function (event) {
        event.preventDefault();
        rowId = $(this).parent();
        dialog(libLang.areYouSure, 'resource');
    });

    // Allow users to delete single file attachments to the item
    $('a.deleteThisFile').live('click', function (event) {
        event.preventDefault();
        fileURL = $(this).attr('rel');
        rowId = $(this).parents("tr");
        dialog(libLang.areYouSure, 'file');
    });
});