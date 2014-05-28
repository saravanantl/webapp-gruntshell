$(document).ready(function(){
	
	var itemURL = $('#jplayer').getParameter('url'),
	itemPath = $('#jplayer').getParameter('path'),
	itemName = $('#jplayer').getParameter('name'),
	useplayer = $('#jplayer').getParameter('useplayer');
	useAudioPlayer = $('#jplayer').getParameter('useAudioPlayer');
	useImageGalery = $('#jplayer').getParameter('useImageGalery');
	
	if (useAudioPlayer=='true') {
		$('#jp_container_1').show();
	} else {
		$('#jp_container_1').hide();
	}

	if (useImageGalery=='true') {
		$('#home-device').show();
	} else {
		$('#home-device').hide();
	}
	
	var couchPlaylist = new jPlayerPlaylist({
		jPlayer: "#jquery_jplayer_1",
		cssSelectorAncestor: "#jp_container_1"
	}, [], {
		swfPath: "../js",
		supplied: "oga, mp3",
		wmode: "window"
	});
	
	var extType = '';
	var noPlayerItems = [];
	var imageItems = [];
	
	noPlayerItems.push('<ul>');
 
	$.ajax ({
		url: currentHost + itemURL,
		dataType: 'json',
		async: false,
		success: function(itemData) {	

			for   (var filename in itemData._attachments){
				fileURL = currentHost + itemURL +'/'+ encodeURIComponent(filename);  
				extType = getFileExtension(filename);	
	        	if(jplayerArray[extType]){
					couchPlaylist.add({
						title:filename,
						artist:"",
						mp3:fileURL
						//poster: "http://www.jplayer.org/audio/poster/Miaow_640x360.png"
					}); 
	        	} else if(imageArray[extType]){
	        		//html5gallery imageItems.push('<a href=' + fileURL + '>' + '<img src=' + fileURL + '></a>')
	        		imageItems.push('<div class="swiper-slide">');
	        		imageItems.push('<img src=' + fileURL + '>');
	        		//imageItems.push('<p>new slide</p>');
	        		imageItems.push('</div>');
	        	}
	        	else {
	        		noPlayerItems.push('<li><a href=' + fileURL + ' class="itemURL ui-link-inherit" rel="external"><h3 class="itemTitle ui-li-heading">' + filename + '</h3></a></li>');
	        	}
			}
			$('#swiper-wrapper').append( imageItems.join('') );
			var mySwiper = $('.swiper-container').swiper({
				simulateTouch : true,
				speed : 500, //Set animation duration to 500ms
			    freeMode : true, //Enable free mode
			    freeModeFluid : true, //Enable 'fluid' free mode
				pagination: '.pagination1',
				slidesPerSlide: 1,
				grabCursor: true,
				loop: true
			}
		);
			$('.arrow-left').click(function(e) {
				e.preventDefault()
				mySwiper.swipePrev()
			});
			$('.arrow-right').click(function(e) {
				e.preventDefault()
				mySwiper.swipeNext()
			});
			
			noPlayerItems.push('</ul>'); //TO DO:check for empty ?
			$('#noPlayer').html( noPlayerItems.join('') );
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
		        alert("Status: " + textStatus); alert("Error: " + errorThrown); 
		    }
	});	
	
});