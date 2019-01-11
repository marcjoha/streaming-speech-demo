const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

// Listen on designated port, and in case of PAAS, trust thy proxy
server.listen(process.env.PORT || 3000);
app.enable("trust proxy");

// Wire up root and static folder
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

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