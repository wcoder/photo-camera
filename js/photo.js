(function() {
	'use strict';
	
	var width = 1280,
		height = 720, 
		video = document.querySelector('#video'),
		canvas = createCanvas(),
		capture = document.querySelector('#capture'),
		photo = document.querySelector('#photo'),
		vendorUrl = window.URL || window.webkitURL;
	
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia
	navigator.getUserMedia = navigator.getUserMedia
                           || navigator.webkitGetUserMedia 
                           || navigator.mozGetUserMedia 
                           || navigator.msGetUserMedia;
						 
	if (navigator.getUserMedia) {
		navigator.getUserMedia({
			video: {
				width: width,
				height: height
			},
			audio: false
		}, function (stream) {
			video.src = vendorUrl.createObjectURL(stream);
			video.onloadedmetadata = function(e) {
	           video.play();
	        };
		}, function (error) {
			console.log(error.message);
		});
	} else {
	   console.log("getUserMedia not supported");
	}
	
	
	capture.addEventListener('click', function(e) {
		takepicture();
		e.preventDefault();
	}, false);
	
	
	function createCanvas() {
		var e = document.createElement('canvas');
		e.width = width;
		e.height = height;
		return e;
	}
	
	function takepicture() {
		var context = canvas.getContext('2d');
		if (width && height) {
			canvas.width = width;
			canvas.height = height;
			
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
			
			context.drawImage(video, 0, 0, width, height);
			photo.setAttribute('src', canvas.toDataURL('image/png'));
		} else {
			clearphoto();
		}
	}
	
	function clearphoto() {
	    var context = canvas.getContext('2d');
	    context.fillStyle = "#AAA";
	    context.fillRect(0, 0, canvas.width, canvas.height);
	
	    var data = canvas.toDataURL('image/png');
	    photo.setAttribute('src', data);
	}
	
})();
