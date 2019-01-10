const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

// Set up web serving, on App Engine and locally
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Build a stream to the Speech API
const client = new speech.SpeechClient();
const recognizeStream = client
  .streamingRecognize({
    config: {
      encoding: 'LINEAR16',
      languageCode: 'en-US',
      sampleRateHertz: 16000
    },
    interimResults: true,
  })
  .on('error', console.error)
  .on('data', data => {
    var transcript = data.results[0].alternatives[0].transcript;
    io.sockets.emit('update-transcript', { data: transcript });
  }
  );

// Wait until client connects and pipe incoming audio stream to the Speech API stream
io.on('connection', function (socket) {
  ss(socket).on('audio', function (stream) {
    stream.pipe(recognizeStream);
  });
});