import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Circle } from '../../../../shared/Circle'
import { Exhibition } from '../../../../shared/Exhibition'

export const getStreamUrl = async (trackId: string) => {
    const config = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        appId: process.env.FIREBASE_APP_ID,
    }
    if (!firebase.apps.length) firebase.initializeApp(config)
    const getStreamUrl = firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('getStreamUrl')

    return await getStreamUrl({ trackId })
}
