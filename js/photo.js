(function() {
	'use strict';

	var width = 1280,
		height = 720,
		video = document.querySelector('#video'),
		capture = document.querySelector('#capture'),
		canvas = document.querySelector('#canvas'),
		sources = document.querySelector('#sources'),
		filters = document.querySelector('#filters'),
		error = document.querySelector('#error'),
		_stream = null,
		vendorUrl = window.URL || window.webkitURL,
		filtersMap = {
			none: 'none',
			blackandwhite: 'url(#blackandwhite)',
			huerotate: 'hue-rotate(90deg)',
			sepia: 'sepia()',
			invert: 'invert()',
			contrast: 'contrast(200%)',
			brightness: 'brightness(0.5)',
			saturate: 'saturate()',
			blur: 'blur(5px)',
		};

	// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.enumerateDevices) {

		log('enumerateDevices() not supported.');
	} else {

		navigator.mediaDevices.enumerateDevices()
			.then(gotDevices)
			.then(function () {
				initGetUserMedia(sources.value);
			})
			.catch(handleError);
	}

	// events

	capture.addEventListener('click', function(e) {
		window.setTimeout(takePicture, 0);
		e.preventDefault();
	}, false);

	sources.addEventListener('change', function(e) {
		initGetUserMedia(e.target.value);
		e.preventDefault();
	}, false);

	filters.addEventListener('change', function(e) {
		video.style.filter = getFilter(e.target.value);
		e.preventDefault();
	}, false);

	// private

	function createOption(value, text) {
		var e = document.createElement('option');
		e.value = value;
		e.text = text;
		return e;
	}

	function takePicture() {

		canvas.style.filter = getFilter(filters.value);

		var context = canvas.getContext('2d');
		if (width && height) {
			canvas.width = width;
			canvas.height = height;

			context.translate(canvas.width, 0);
			context.scale(-1, 1);

			context.drawImage(video, 0, 0, width, height);
		} else {
			clearPhoto();
		}
	}

	function clearPhoto() {
		var context = canvas.getContext('2d');
		context.fillStyle = '#AAA';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	function initGetUserMedia(deviceId) {
		if (!deviceId) {
			log('Selected device not loaded [DeviceId="' + deviceId + '"]');
			stopPlay();
			return;
		}

		if (!navigator.mediaDevices ||
			!navigator.mediaDevices.getUserMedia) {

			log('getUserMedia() not supported');
		} else {

			var constraints = {
				video: {
					width: width,
					height: height,
					deviceId: deviceId
				},
				audio: false
			};

			// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
			navigator.mediaDevices.getUserMedia(constraints).then(playStream).catch(handleError);
		}
	}

	function playStream(stream) {
		_stream = stream;

		video.src = vendorUrl.createObjectURL(stream);
		video.onloadedmetadata = function(e) {
			video.play();
		};
	}

	function stopPlay() {
		// disable stream
		if (_stream != null) {
			_stream.getTracks().forEach(function(track) {
				track.stop();
			});
			_stream = null;
		}
		// disable video
		video.pause();
		video.src = '';
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
		log(error.message || error);
	}

	function getFilter(value) {
		try {
			return filtersMap[value];
		} catch (e) {
			console.error(e);
			return 'none';
		}
	}

	function log(message) {
		error.innerHTML += '<br>Error: ' + message;
	}

})();
