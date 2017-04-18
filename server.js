const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ss = require('socket.io-stream');
const speech = require('@google-cloud/speech')();

const request = {
  config: {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
    sampleRateHertz: 44100
  },
  singleUtterance: false,
  interimResults: true,
};

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  ss(socket).on('audio', function(stream) {
    stream.pipe(speech.createRecognizeStream(request)
      .on('error', console.error)
      .on('data', function(data) {
        console.log('Data received: %j', data);
      })
    );
  });
});

http.listen(3000, function() {
  console.log('listening on http://localhost:3000');
});
