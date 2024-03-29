/*global
    window
*/
(function (_w, _d) {
    'use strict';

    var width = 1280,
        height = 720,
        video = _d.querySelector('#video'),
        capture = _d.querySelector('#capture'),
        canvas = _d.querySelector('#canvas'),
        sources = _d.querySelector('#sources'),
        filters = _d.querySelector('#filters'),
        mirroring = _d.querySelector('#mirroring'),
        error = _d.querySelector('#error'),
        isMirroringEnabled = false,
        _stream = null,
        filtersMap = {
            none: 'none',
            blackandwhite: 'url(#blackandwhite)',
            huerotate: 'hue-rotate(90deg)',
            sepia: 'sepia()',
            invert: 'invert()',
            contrast: 'contrast(200%)',
            brightness: 'brightness(0.5)',
            saturate: 'saturate()',
            blur: 'blur(5px)'
        },
        videoStyleTransform = 'scaleX(-1)';

    // function

    function getFilter(value) {
        try {
            return filtersMap[value];
        } catch (e) {
            _w.console.error(e);
            return 'none';
        }
    }

    function log(message) {
        error.innerHTML += '<br>Error: ' + message;
    }

    function createOption(value, text) {
        var e = _d.createElement('option');
        e.value = value;
        e.text = text;
        return e;
    }

    function clearPhoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = '#AAA';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function takePicture() {

        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;

            if (!isMirroringEnabled) {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }

            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
            context.filter = getFilter(filters.value);

            context.drawImage(video, 0, 0, width, height);
        } else {
            clearPhoto();
        }
    }

    function playStream(stream) {
        _stream = stream;

        if (isMirroringEnabled) {
            video.style.transform = 'none';
        } else {
            video.style.transform = videoStyleTransform;
        }

        video.srcObject = stream;
        video.onloadedmetadata = function () {
            video.play();
        };
    }

    function stopPlay() {
        // disable stream
        if (_stream !== null) {
            _stream.getTracks().forEach(function (track) {
                track.stop();
            });
            _stream = null;
        }
        // disable video
        video.pause();
        video.src = '';
    }

    function handleError(error) {
        _w.console.error(error);
        log(error.message || error);
    }

    function initGetUserMedia(deviceId) {
        if (!deviceId) {
            log('Selected device not loaded [DeviceId="' + deviceId + '"]');
            stopPlay();
            return;
        }

        if (!_w.navigator.mediaDevices || !_w.navigator.mediaDevices.getUserMedia) {

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
            _w.navigator.mediaDevices.getUserMedia(constraints)
                .then(playStream)
                .catch(handleError);
        }
    }

    function gotDevices(deviceInfos) {
        var addedDeviceIds = [].map.call(sources.querySelectorAll('option[value]'), x => x.value);

        deviceInfos.forEach(function (deviceInfo) {
            if (deviceInfo.kind === 'videoinput') {
                var optionTitle = deviceInfo.label || 'camera ' + (sources.length + 1);
                if (addedDeviceIds.indexOf(deviceInfo.deviceId) === -1) {
                    sources.appendChild(createOption(deviceInfo.deviceId, optionTitle));
                }
            }
        });
    }

    function start() {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
        if (!_w.navigator.mediaDevices || !_w.navigator.mediaDevices.enumerateDevices) {

            log('enumerateDevices() not supported.');
        } else {

            _w.navigator.mediaDevices.enumerateDevices()
                .then(gotDevices)
                .then(function () {
                    initGetUserMedia(sources.value);
                })
                .catch(handleError);
        }
    }

    function toggleFullScreen() {
        if (!_d.fullscreenElement) {
            video.requestFullscreen().catch(err => {
                var errorMessage = "Error attempting to enable fullscreen mode: " + err.message + " " + err.name + "";
                console.log(err);
                log(errorMessage);
              });
        } else {
            if (_d.exitFullscreen) {
                _d.exitFullscreen();
            }
        }
    }

    // main
    start();

    // events

    capture.addEventListener('click', function (e) {
        _w.setTimeout(takePicture, 0);
        e.preventDefault();
    }, false);

    sources.addEventListener('change', function (e) {
        initGetUserMedia(e.target.value);
        e.preventDefault();
    }, false);

    filters.addEventListener('change', function (e) {
        video.style.filter = getFilter(e.target.value);
        e.preventDefault();
    }, false);

    mirroring.addEventListener('change', function (e) {
        isMirroringEnabled = e.target.checked;
        start();
        e.preventDefault();
    });

    _d.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) {
            toggleFullScreen();
        }
    }, false);

}(window, window.document));
