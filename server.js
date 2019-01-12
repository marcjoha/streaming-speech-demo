const express = require('express');
const app = express();
const server = require('http').Server(app);
const secure = require('express-force-https');
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

// Enforce HTTPs, won't be able to use mic otherwise
app.use(secure);

// Set up serving
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Start web server
server.listen(process.env.PORT || 3000);

// Wait until client connects,
// pipe incoming audio to the Speech API,
// and emit transcripts to the UI as they come in
io.on('connection', socket => {
  ss(socket).on('audio', stream => {
    stream.pipe(new speech.SpeechClient().streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        languageCode: 'en-US',
        sampleRateHertz: 16000
      },
      interimResults: true,
    }).on('data', data => {
      socket.emit('update-transcript', { data: data.results[0].alternatives[0].transcript });
    }));
  });
});