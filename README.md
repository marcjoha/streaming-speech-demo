# streaming-speech-demo
Demo web app using the Google Cloud Speech API in streaming mode.

You need a GCP project, with the Speech API enabled.

If deployed locally, you also need a service account key wired up in Application Default Credentials.

1. npm install
2. browserify index.js -o public/bundle.js
3. npm start
4. open http://localhost:3000
