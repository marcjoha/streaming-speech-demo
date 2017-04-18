var io = require('socket.io-client');
var ss = require('socket.io-stream');
var MicrophoneStream = require('microphone-stream');

// set up socket to stream audio through 
var socket = io.connect('http://' + document.domain + ':' + location.port + '/');
var socketStream = ss.createStream();
ss(socket).emit('audio', socketStream);


// grab mic input and stream through socket
navigator.getUserMedia({audio: true}, function(stream) {
  var micStream = new MicrophoneStream(stream);  

  // todo: feed sample rate to backend and configure accordingly
  micStream.on('format', function(format) {
    console.log(format);
  });

  micStream.on('data', function(data) {
    micStream.pipe(socketStream)
      .on('error', function(error) {
        console.error("Couldn't send audio to backend", error);
        micStream.stop();
        socket.close();
      });
  });

},
  function(error) {
    console.error("Couldn't connect to audio input", error);
  }
);



