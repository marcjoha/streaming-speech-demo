# streaming-speech-demo
Demo web app using the Google Cloud Speech API in streaming mode.

You need a billable GCP project, with the Speech API enabled.

Credits to [nfriedly](https://github.com/nfriedly) for [webaudio-l16-stream.js](https://github.com/watson-developer-cloud/speech-javascript-sdk/blob/438d657d98ae0cf00f7461ea86b0d3aa81f76e70/speech-to-text/webaudio-l16-stream.js) which is used to down-sample the audio.

## Deploy locally
You need a service account key wired up in Application Default Credentials:

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
