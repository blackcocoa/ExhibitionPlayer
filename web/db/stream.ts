import firebase from 'firebase/app'
import 'firebase/firestore'

export const getStreamUrl = async (trackId: string[]) => {
    const config = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        appId: process.env.FIREBASE_APP_ID,
    }
    if (!firebase.apps.length) firebase.initializeApp(config)
    const getStreamUrl = firebase.app().functions('us-central1').httpsCallable('getStreamUrl')
    const result = await getStreamUrl({ trackId })
    return result.data
}
