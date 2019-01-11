var io = require('socket.io-client');
var ss = require('socket.io-stream');
var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');
var L16 = require('./webaudio-l16-stream.js');

// Set up socket to stream audio through and get transcripts from
var socket = io({ transports: ['websocket'] });
var socketStream = ss.createStream({ objectMode: true });
ss(socket).emit('audio', socketStream);

// Grab mic stream
var micStream = new MicrophoneStream({ objectMode: true });

// Wait until start button is clicked
document.getElementById('start-button').onclick = () => {

  // todo: make start-button inactive

  // Off we go!
  getUserMedia({ video: false, audio: true }).then(stream => {
    micStream.setStream(stream);
  });

  // Downsample audio from Float32 to Linear16 and pipe through socket
  var l16Stream = new L16({ writableObjectMode: true });
  micStream.pipe(l16Stream).pipe(socketStream);

  // Continue until stop button is clicked
  document.getElementById('stop-button').onclick = () => {
    micStream.stop();
    // todo: make stop-button inactive
  };
}

// Subscribe to server errors, and abort if needed
// todo

// Subscribe to transcripts from the server
socket.on('update-transcript', transcript => {
  document.getElementById('transcript').innerHTML = transcript.data;
});

// Display transcripts as they come in from the Speech API
socket.on('update-transcript', transcript => {
  document.getElementById('transcript').innerHTML = transcript.data;
});