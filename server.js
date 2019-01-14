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

// Prepare and configure the Speech API
const speechClient = new speech.SpeechClient();
const speechConfiguration = {
  config: {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
    sampleRateHertz: 16000
  },
  interimResults: true,
};

// Wait until client connects, and start piping audio
io.on('connection', socket => {
  ss(socket).on('audio', stream => {
    stream.pipe(speechClient.streamingRecognize(speechConfiguration).on('data', data => {
      socket.emit('transcript', { data: data.results[0].alternatives[0].transcript });
    }).on('error', error => {
      socket.emit('error', { data: error });
    }));
  });
});