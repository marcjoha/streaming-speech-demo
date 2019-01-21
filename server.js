const express = require('express');
const app = express();
const server = require('http').Server(app);
const secure = require('express-force-https');
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

const serveIndex = require('serve-index')
const tempyDir = require('tempy').directory();
const wav = require('wav');
const fs = require('fs');

// Enforce HTTPs, won't be able to use mic otherwise
app.use(secure);

// Set up serving
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.js', (req, res) => {
  res.sendFile(__dirname + '/index-compiled.js');
});
app.use('/latest', express.static(tempyDir), serveIndex(tempyDir, { 'icons': true, 'view': 'details' }))


// Start web server
server.listen(process.env.PORT || 3000);

// Initalize connection to the Speech API
var client = new speech.SpeechClient();

// Wait until a client connects
io.on('connection', socket => {
  ss(socket).on('audio', (audioStream, sampleRate) => {

    // START DEBUGGING

    var buffersFile = tempyDir + '/' + Math.random().toString(36).substring(2, 8) + ".txt";
    var audioFile = tempyDir + '/' + Math.random().toString(36).substring(2, 8) + ".wav";

    // Save buffers in text file
    audioStream.on('data', data => { fs.createWriteStream(buffersFile, { flags: 'a' }).write(JSON.stringify(data) + "\n"); });

    // Save audio in wav file
    audioStream.pipe(new wav.FileWriter(audioFile, { channels: 1, sampleRate: sampleRate, bitDepth: 16 }));

    // STOP DEBUGGING

    var streamingRecognize = client.streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        languageCode: 'en-US',
        sampleRateHertz: sampleRate
      },
      interimResults: false
    });

    audioStream.pipe(streamingRecognize).on('data', data => {
      socket.emit('transcript', data.results[0].alternatives[0].transcript);
    }).on('error', error => {
      console.log(error);
      socket.disconnect();
    });

  });

});
