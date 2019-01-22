'use strict'

const io = require('socket.io-client');
const ss = require('socket.io-stream');
const getUserMedia = require('get-user-media-promise');
const MicrophoneStream = require('microphone-stream');
const L16Stream = require('./webaudio-l16-stream.js');

const TARGET_SAMPLE_RATE = 16000;

var socket;
var speechStream;
var micStream;
var transformStream;

var buttonClicks = 0;

// Toogle recording audio on button click
document.getElementById('record').onclick = () => {
  if (buttonClicks++ % 2 == 0) {

    // User started recording
    document.getElementById('record').innerHTML = '🛑 Stop recording';

    // Set up socket, without long-polling, and wait for connection
    socket = io({ transports: ['websocket'] }).on('connect', _ => {

      // Prepare duplex socket to stream audio and transcrips through
      speechStream = ss.createStream({ objectMode: true });
      ss(socket).emit('speech', speechStream, TARGET_SAMPLE_RATE);

      // Wire up the mic, and wait to learn current sample rate
      micStream = new MicrophoneStream().on('format', format => {

        // Prepare transform for down-sampling and converting to Linear16
        // todo: rewrite transform so that TARGET_SAMPLE_RATE is properly exposed
        transformStream = new L16Stream({ sourceSampleRate: format.sampleRate, downsample: true });

        // With user's blessing, grab mic and get started
        getUserMedia({ video: false, audio: true }).then(stream => {
          micStream.setStream(stream);
        }).catch(error => {
          console.log(error);
          shutdown();
        });

        // Pipe audio through the transform, the API and all the way back...
        micStream.pipe(transformStream).pipe(speechStream).on('data', data => {
          render(data);
        });

      });

    }).on('disconnect', _ => {
      // Closing connection due to server-side error
      shutdown();
    });

  } else {
    // User stopped recording
    shutdown();
  }

  // Helper function to shut down gracefully
  function shutdown() {

    // Stop listening for audio
    if (micStream) micStream.stop();

    //  Stop stream,  kill socket and reset UI when finished
    if (speechStream) speechStream.end(_ => {
      socket.disconnect();
      document.getElementById('record').innerHTML = '🎤 Start recording';
    });

  }

  // Helper function to show audio transcripts
  function render(data) {
    var transcript = data.results[0].alternatives[0].transcript;
    document.getElementById('transcript').append(transcript, document.createElement('br'));
  }

};