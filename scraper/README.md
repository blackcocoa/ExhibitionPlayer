# Getting SoundCloud Tokens

1. Manually sign into SoundCloud, inspect network and see client_id
2. Inspect cookie and see 'oauth_token'
3. see 'https://api-auth.soundcloud.com/connect/session?client_id=xxx' for client ID

https://soundcloud.com/hello1103/grace-takako
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
