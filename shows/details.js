function(doc, req) {
	var title = '',
		author = '',
		date = '',
		description = '';
	if (doc.title) {
		title = '<h1>' + doc.title + ' </h1>';
	};
	if (doc.author) {
		author = '<strong>' + doc.author + '</strong>'
	};
	if (doc.date) {
		date = ' (' + doc.date + ')';
	};
	if (doc.description) {
		description = '<br />' + doc.description + '<br />';
	};
	return '<div style=" max-width: 900px; background: #fff; box-shadow: 0px 0px 200px #bbb; padding: 1px 15px; font-family: Helvetica, Arial, sans-serif; margin: 40px auto; border-radius: 9px;">' + title + '<p>' + author + date + '</p>' + description + '<p><a href="../../settings.html?id=' + doc._id + '&amp;type=' + doc.type + '" style="width: 32px; height: 32px;background-image: url(../../style/images/icons-36-black.png); background-repeat: no-repeat; background-position:-577px -2px; border-radius: 18px; box-shadow: 0px 0px 6px #999; display: inline-block;"></a></p></div>';
}