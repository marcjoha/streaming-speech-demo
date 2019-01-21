# streaming-speech-demo
This is a demo app of using the Google Cloud Speech API in streaming mode. It's built in Node.js and streams audio from the user's microphone, over a websocket connection to a backend, that in turn feeds the stream to the Speech API. Transcripts are fed back as they arrive.

The app is running at https://streaming-speech-demo.appspot.com.

Credits to [nfriedly](https://github.com/nfriedly) for [webaudio-l16-stream.js](https://github.com/watson-developer-cloud/speech-javascript-sdk/blob/438d657d98ae0cf00f7461ea86b0d3aa81f76e70/speech-to-text/webaudio-l16-stream.js) which is used to down-sample the audio and convert to Linear16 format.

## Run locally
You will need a billable GCP project, with the Speech API enabled. Then create a service account, download the key file, and wire up in Application Default Credentials (ADC), e.g. like this:

```bash
export PROJECT_ID=`gcloud config get-value project`
gcloud iam service-accounts create streaming-speech-demo --display-name "streaming-speech-demo"
gcloud iam service-accounts keys create svc-acc-key.json --iam-account=streaming-speech-demo@$PROJECT_ID.iam.gserviceaccount.com
export GOOGLE_APPLICATION_CREDENTIALS=svc-acc-key.json
```

Once all set, do:

1. `npm install`
2. `npm start`
3. `open http://localhost:3000`

## Deploy on Google App Engine Flexible Environment

TBC.
