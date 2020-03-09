import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'

export class Database {
    db: firestore.Firestore

    constructor() {
        const config = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            appId: process.env.FIREBASE_APP_ID,
        }
        !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()

        this.db = firebase.firestore()
    }

    getInstance() {
        return this.db
    }
}
