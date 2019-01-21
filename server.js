const app = require('express')();
const server = require('http').Server(app);
const secure = require('express-force-https');
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech');

// Enforce HTTPs, won't be able to use mic otherwise
app.use(secure);

// Set up serving
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.js', (req, res) => {
  res.sendFile(__dirname + '/index-compiled.js');
});

// Start web server
server.listen(process.env.PORT || 3000);

// Wait until a client connects
io.on('connection', socket => {

  // Initalize connection to the Speech API
  var client = new speech.SpeechClient();

  // Then wait for incoming audio
  ss(socket).on('speech', (speechStream, sampleRate) => {

    var recognizeStream = client.streamingRecognize({
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

    speechStream.pipe(recognizeStream).pipe(speechStream);

  });

});