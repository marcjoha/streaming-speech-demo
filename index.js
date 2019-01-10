var io = require('socket.io-client');
var ss = require('socket.io-stream');
var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

// set up socket to stream audio through
var socket = io.connect('http://' + document.domain + ':' + location.port + '/');
var socketStream = ss.createStream();
ss(socket).emit('audio', socketStream);

document.getElementById('start-button').onclick = function () {
  var micStream = new MicrophoneStream();

  // grab mic input
  getUserMedia({ video: false, audio: true }).then(function (stream) {
    micStream.setStream(stream);
  }).catch(function (error) {
    console.log(error);
  });

  // pipe to server
  micStream.pipe(socketStream);

  // It also emits a format event with various details (frequency, channels, etc)
  micStream.on('format', function (format) {
    console.log(format);
  });

  // Stop when ready
  document.getElementById('stop-button').onclick = function () {
    micStream.stop();
  };
}