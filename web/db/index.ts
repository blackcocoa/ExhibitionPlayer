import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/functions'

export class Database {
    db: firebase.firestore.Firestore

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
