const io = require('socket.io-client');
const ss = require('socket.io-stream');
const getUserMedia = require('getusermedia');
const MicrophoneStream = require('microphone-stream');
const L16Stream = require('./webaudio-l16-stream.js');

var socket;
var socketStream;
var micStream;

var buttonClicks = 0;

// Toogle recording audio on button click
document.getElementById('record').onclick = () => {
  if(buttonClicks++ % 2 == 0) {
    // User started recording
    document.getElementById('record').innerHTML = "🛑 Stop recording";

    // Wires user audio directly into a node stream
    micStream = new MicrophoneStream();

    // Streamable websocket, disable fallback to long-polling
    socket = io({ transports: ['websocket'] }).on('disconnect', _ => {
      shutdown();
    });
    socketStream = ss.createStream();

    // Off we go!
    getUserMedia({ video: false, audio: true }, (_, stream) => {
      micStream.setStream(stream);

      // Downsample audio and pipe through socket
      micStream.pipe(new L16Stream()).pipe(socketStream);
      ss(socket).emit('audio', socketStream);

      // Subscribe to and display audio transcripts
      socket.on('transcript', transcript => {
        document.getElementById('transcript').append(transcript.data, document.createElement("br"));
      });
    });

  } else {
    // User stopped recording
    shutdown();
  }

  // Helper function to reset button, and stop all client-side streams gracefully
  function shutdown() {
    document.getElementById('record').innerHTML = "🎤 Start recording";

    // Gracefully shut down streams and sockets
    if (micStream) micStream.stop();
    if (socketStream) socketStream.end();
    if (socket) socket.disconnect();
  }

};