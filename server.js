const app = require('express')();
const server = require('http').Server(app);
const secure = require('express-force-https');
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');
const latestAudioFile = require('tempy').file({extension: 'wav'});
const wav = require('wav');

// Enforce HTTPs, won't be able to use mic otherwise
app.use(secure);

// Set up serving
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.js', (req, res) => {
  res.sendFile(__dirname + '/index-compiled.js');
});
app.get('/latest', (req, res) => {
  res.sendFile(latestAudioFile);
});

// Start web server
server.listen(process.env.PORT || 3000);

// Wait until a client connects
io.on('connection', socket => {
  ss(socket).on('audio', (audioStream, sampleRate) => {

    // Initialize a stream to the Speech API
    var recognizeStream = new speech.SpeechClient().streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        languageCode: 'en-US',
        sampleRateHertz: sampleRate
      },
      interimResults: false
    })

    // Pipe audio from client to the API, and feed results back
    audioStream.pipe(recognizeStream.on('data', data => {
      socket.emit('transcript', data.results[0].alternatives[0].transcript );
    })).on('error', error => {
      console.log(error);
      socket.disconnect();
    });

    // Keep the latest audio for debugging
    audioStream.pipe(new wav.FileWriter(latestAudioFile, {
      channels: 1,
      sampleRate: sampleRate,
      bitDepth: 16
    }));

  });
});
