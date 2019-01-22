'use strict'

const app = require('express')();
const server = require('http').Server(app);
const secure = require('express-force-https');
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

// Enforce HTTPs, won't be able to use mic otherwise
app.use(secure);

// https://cloud.google.com/appengine/docs/flexible/nodejs/how-requests-are-handled
app.use((req, res, next) => {
  res.header('Content-Type', 'text/event-stream');
  res.header('Cache-Control', 'no-cache');
  res.header('Connection', 'keep-alive');
  res.header('X-Accel-Buffering', 'no');
  next();
});

// Set up serving
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.js', (req, res) => {
  res.sendFile(__dirname + '/index-compiled.js');
});

// Start web server
server.listen(process.env.PORT || 3000);

// Wait for a client to transmit audio
io.on('connection', socket => {
  ss(socket).on('speech', (speechStream, sampleRate) => {

    // Initialize connection to Speech API
    var recognizeStream = new speech.SpeechClient().streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        languageCode: 'en-US',
        sampleRateHertz: sampleRate
      },
      interimResults: false
    }).on('error', error => {
      console.log(error);
      socket.disconnect();
    });

    // Stream audio to the API and feed results back to client
    speechStream.pipe(recognizeStream).pipe(speechStream);

  });
});