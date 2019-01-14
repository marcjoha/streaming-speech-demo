const io = require('socket.io-client');
const ss = require('socket.io-stream');
const getUserMedia = require('get-user-media-promise');
const MicrophoneStream = require('microphone-stream');
const L16 = require('./webaudio-l16-stream.js');

// Set up socket to stream audio through and get transcripts from
// N.B. disable long-polling, it wouldn't work well anyway
var socket = io({ transports: ['websocket'] });
var socketStream = ss.createStream({ objectMode: true });
ss(socket).emit('audio', socketStream);

// Wait until start button is clicked
document.getElementById('start-button').onclick = () => {

  // Grab mic stream
  var micStream = new MicrophoneStream({ objectMode: true });

  // Off we go!
  getUserMedia({ video: false, audio: true }).then(stream => {
    micStream.setStream(stream);
  }).catch(error => {
    console.log(error);
  });

  // Downsample audio from Float32 to Linear16 and pipe through socket
  var transformStream = new L16({ writableObjectMode: true });
  micStream.pipe(transformStream).pipe(socketStream);

  // Continue until stop button is clicked
  document.getElementById('stop-button').onclick = () => {
    micStream.stop();
  };
}

// Subscribe to and display audio transcripts
socket.on('transcript', transcript => {
  document.getElementById('transcript').innerHTML = transcript.data;
});

// Subscribe to and display audio transcripts
socket.on('error', error => {
  document.getElementById('error').innerHTML = error.data;
});