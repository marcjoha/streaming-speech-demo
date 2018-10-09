var io = require('socket.io-client');
var ss = require('socket.io-stream');
var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

// set up socket to stream audio through 
var socket = io.connect('http://' + document.domain + ':' + location.port + '/');
var socketStream = ss.createStream({ objectMode: false });
ss(socket).emit('audio', socketStream);

var micStream = new MicrophoneStream({ objectMode: false });

// grab mic input
getUserMedia({ video: false, audio: true }).then(function (audioStream) {
  micStream.setStream(audioStream);
}).catch(function (error) {
  console.log(error);
});

// pipe to server
micStream.pipe(socketStream);
