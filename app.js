var couchapp = require('couchapp')
    , attachpath = require('path');
	//, vendorpath = require('path');

  ddoc = {
      _id: '_design/library'
    , views: {}    
    , shows: {}
	, filters: {} 
  }

  module.exports = ddoc;
  
  ddoc.filters.deleted = function(doc,req) { 
		if (doc._deleted == true) {return true;}
    }  
			
   ddoc.filters.no_design = function (doc, req) { 
		if (doc._id[0] == '_' ) { return false;} 
		return true; 
	}
       
  ddoc.views.documents = {
    map: function(doc) { if (doc.type == 'documents') emit(doc); } }
	
  ddoc.views.videos = {
	map: function(doc) { if (doc.type == 'videos') emit(doc); } }
	
  ddoc.views.pictures = {
    map: function(doc) { if (doc.type == 'pictures') emit(doc); } }
	
  ddoc.views.notes = {
    map: function(doc) { if (doc.type == 'notes') emit(doc); } }
	
  ddoc.views.currentLang = {
    map: function(doc) { if (doc.type == 'language') emit(doc.texts); } }
	
  ddoc.views.languages = {
    map: function(doc) { if (doc.type == 'language') emit(doc); } }
	
  ddoc.views.courses = {
    map: function(doc) { if (doc.type == 'courses') emit(doc); } }
	
  ddoc.views.books = {
    map: function(doc) { if (doc.type == 'books') emit(doc); } }
	
  ddoc.views.audio = {
    map: function(doc) { if (doc.type == 'audio') emit(doc); } }
	
  ddoc.views.helpdocs = {
    map: function(doc) { if (doc.type == 'helpdoc') emit(doc); } }  

  ddoc.shows.details = function(doc, req) {
		var title = '',
			author = '',
			date = '',
			description = '';
		if (doc.title) {title = '<h1>' + doc.title + ' </h1>';};
		if (doc.author) {author = '<strong>' + doc.author + '</strong>'};
		if (doc.date) {date = ' (' + doc.date + ')';};
		if (doc.description) {description = '<br />' + doc.description + '<br />';};
		return '<div style=\" max-width: 900px; background: #fff; box-shadow: 0px 0px 200px #bbb; padding: 1px 15px; font-family: Helvetica, ' 			+	'Arial, sans-serif; margin: 40px auto; border-radius: 9px;\">' + title + '<p>' + author + date + '</p>' + description + 
			'<p> <a href=\"../../settings.html?id=' + doc._id + '&amp;type=' + doc.type + '\" style=\"width: 32px; height:32px;'+
			'background-image:url(../../style/images/icons-36-black.png); background-repeat: no-repeat; background-position:-577px -2px;'+
			'border-radius: 18px; box-shadow: 0px 0px 6px #999; display: inline-block;\"></a></p></div>';
	}


  ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {
    function require(field, message) {
      message = message || "Document must have a " + field;
      if (!newDoc[field]) throw({forbidden : message});
    };

    if (newDoc.type == "person") {
      require("name");
    }
  }

 couchapp.loadAttachments(ddoc, attachpath.join(__dirname, '_attachments'));    
//couchapp.loadAttachments(ddoc, vendorpath.join('D:\\Saravanan\\Mobile Development\\MAF\\Grunt\\Estante\\library\\build'));

module.exports = ddoc;