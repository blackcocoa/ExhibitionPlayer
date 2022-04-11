import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { getApps, initializeApp } from 'firebase/app'

export const getStreamUrl = async (trackId: string[]) => {
    const config = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        appId: process.env.FIREBASE_APP_ID,
    }

    if (getApps().length < 1) initializeApp(config)
    const getStreamUrl = firebase.app().functions('us-central1').httpsCallable('getStreamUrl')
    const result = await getStreamUrl({ trackId })
    return result.data
}
