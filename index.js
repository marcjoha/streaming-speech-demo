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
  if (buttonClicks++ % 2 == 0) {
    // User started recording
    document.getElementById('record').innerHTML = "🛑 Stop recording";

    // Set up socket, without fallback to long-polling
    socket = io({ transports: ['websocket'] }).on('connect', _ => {
      socketStream = ss.createStream();

      // Wire up the mic, get started once we know sample rate
      micStream = new MicrophoneStream().on('format', format => {
        getUserMedia({ video: false, audio: true }, (_, stream) => {
          // Send mic into a stream object
          micStream.setStream(stream);

          // Send stream object over the socket (also convert to Linear16 and downsample to 16kHz)
          ss(socket).emit('audio', socketStream, 16000);
          micStream.pipe(new L16Stream({ sourceSampleRate: format.sampleRate, downsample: true })).pipe(socketStream);
        });
      });

    }).on('transcript', transcript => {
      // Display audio transcript as they come in over the socket
      document.getElementById('transcript').append(transcript, document.createElement("br"));

    }).on('disconnect', _ => {
      // Lost connection due to server-side error
      shutdown();

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