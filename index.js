const io = require('socket.io-client');
const ss = require('socket.io-stream');
const getUserMedia = require('getusermedia');
const MicrophoneStream = require('microphone-stream');
const L16Stream = require('./webaudio-l16-stream.js');

var socket;
var socketStream;
var micStream;

// Wait until start button is clicked
document.getElementById('start-button').onclick = () => {
  // Wire up streamable socket and mic
  socket = io();
  socketStream = ss.createStream({ objectMode: true });
  micStream = new MicrophoneStream({ objectMode: true });

  // Off we go!
  getUserMedia({ video: false, audio: true }, (_, stream) => {
    micStream.setStream(stream);

    // Downsample audio and pipe through socket
    micStream.pipe(new L16Stream(({ writableObjectMode: true }))).pipe(socketStream);
    ss(socket).emit('audio', socketStream);

    // Subscribe to and display audio transcripts
    socket.on('transcript', transcript => {
      document.getElementById('transcript').innerHTML = transcript.data;
    });
  });
}

// Turn things down gracefully when stop button is clicked
document.getElementById('stop-button').onclick = () => {
  document.getElementById('transcript').innerHTML = '';
  if (micStream) micStream.stop();
  if (socketStream) socketStream.end();
  if (socket) socket.disconnect();
};