# Getting SoundCloud Tokens

1. Manually log into SoundCloud, inspect network and see client_id
2. Inspect cookie and see 'oauth_token'

https://www.npmjs.com/package/soundcloud.ts

# Backup

## Export Firestore

```
gcloud firestore export gs://soundscraper-d0273.appspot.com
```

## Import

```
gcloud firestore operations list
gcloud firestore import {url}
```
