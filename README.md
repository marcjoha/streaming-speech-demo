# streaming-speech-demo
Demo web app using the Google Cloud Speech API in streaming mode.

You need a billable GCP project, with the Speech API enabled.

If deployed locally, you also need a service account key wired up in Application Default Credentials:

```bash
export PROJID="bla bla"
gcloud iam service-accounts create streaming-speech-demo --display-name "streaming-speech-demo"
gcloud iam service-accounts keys create svc-acc-key.json --iam-account=streaming-speech-demo@$PROJID.iam.gserviceaccount.com
export GOOGLE_APPLICATION_CREDENTIALS=svc-acc-key.json
```

Once all set, do:

1. `npm install`
2. `npm start`
3. `open http://localhost:3000`
