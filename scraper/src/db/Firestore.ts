import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const serviceAccount = require('../../../serviceAccountKey.json')

export class Firestore {
    db: firebase.firestore.Firestore

    constructor() {
        const fbId = process.env.FIREBASE_PROJECT_ID
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: `${fbId}.firebaseapp.com`,
            databaseURL: `https://${fbId}.firebaseio.com`,
            projectId: fbId,
            storageBucket: `${fbId}.appspot.com`,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        }

        firebase.initializeApp(firebaseConfig)

        this.db = firebase.firestore()
    }

    async login() {
        await firebase
            .auth()
            .signInWithEmailAndPassword(process.env.FIREBASE_ADMIN_EMAIL, process.env.FIREBASE_ADMIN_PASSWORD)
    }
}
