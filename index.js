var io = require('socket.io-client');
var ss = require('socket.io-stream');
var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');
var L16 = require('./webaudio-l16-stream.js');

// set up socket to stream audio through and get results from
var socket = io();
var socketStream = ss.createStream({ objectMode: true });
ss(socket).emit('audio', socketStream);

// mic streaming
document.getElementById('start-button').onclick = function () {
  var micStream = new MicrophoneStream({ objectMode: true });

  // grab mic input
  getUserMedia({ video: false, audio: true }).then(function (stream) {
    micStream.setStream(stream);
  }).catch(function (error) {
    console.log(error);
  });

  // pipe to server
  var l16Stream = new L16({ writableObjectMode: true });
  micStream.pipe(l16Stream).pipe(socketStream);

  // Stop when ready
  document.getElementById('stop-button').onclick = function () {
    micStream.stop();
  };
}

socket.on('update-transcript', function (transcript) {
  console.log(transcript.data);
  document.getElementById('transcript').innerHTML = transcript.data;
});