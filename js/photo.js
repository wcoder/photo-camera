(function() {
	'use strict';
	
	var width = 1280,
		height = 720, 
		video = document.querySelector('#video'),
		canvas = createCanvas(),
		capture = document.querySelector('#capture'),
		photo = document.querySelector('#photo'),
		sources = document.querySelector('#sources'),
		error = document.querySelector('#error'),
		vendorUrl = window.URL || window.webkitURL;
	
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia
	
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.getUserMedia) {

		log('getUserMedia() not supported');
	} else {

		var constraints = {
			video: {
				width: width,
				height: height
			},
			audio: false
		};

		navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
	}


	// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.enumerateDevices) {

  		log('enumerateDevices() not supported.');
	} else {

		navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
	}
	
	// events
	
	capture.addEventListener('click', function(e) {
		window.setTimeout(takepicture, 0);
		e.preventDefault();
	}, false);
	

	// private

	function createCanvas() {
		var e = document.createElement('canvas');
		e.width = width;
		e.height = height;
		return e;
	}

	function createOption(value, text) {
		var e = document.createElement('option');
		e.value = value;
		e.text = text;
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
		context.fillStyle = '#AAA';
		context.fillRect(0, 0, canvas.width, canvas.height);

		var data = canvas.toDataURL('image/png');
		photo.setAttribute('src', data);
	}

	function gotStream(stream) {
		video.src = vendorUrl.createObjectURL(stream);
		video.onloadedmetadata = function(e) {
			video.play();
		};
	}

	function gotDevices(deviceInfos) {
		deviceInfos.forEach(function (deviceInfo) {
			if (deviceInfo.kind === 'videoinput') {
				sources.appendChild(createOption(deviceInfo.deviceId,
					deviceInfo.label ||
					'camera ' + (sources.length + 1)));
			}
		});
	}

	function handleError(error) {
		console.error(error);
		log(error.message);
	}

	function log(message) {
		error.innerHTML += '<br>Error: ' + message;
	}
	
})();
