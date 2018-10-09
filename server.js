const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

// Serve web page
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
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
    process.stdout.write(
      data.results[0] && data.results[0].alternatives[0]
        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
        : `\n\nReached transcription time limit, press Ctrl+C\n`
    )
  }
);

// Wait until client connects and pipe incoming audio stream to the Speech API stream
io.on('connection', function(socket) {
  ss(socket).on('audio', function(stream) {
    stream.pipe(recognizeStream);
  });
});

http.listen(3000, function() {
  console.log('listening on http://localhost:3000');
});
