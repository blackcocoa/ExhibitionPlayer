import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { Exhibition } from '../../../shared/Exhibition'

export class ExhibitionList {
    db: firebase.firestore.Firestore

    constructor(db) {
        this.db = db
    }

    async fetchAll(): Promise<Exhibition[]> {
        const snapshot = await this.db.collection('exhibitions').get()

        let exhibitions = []
        snapshot.forEach((doc) => {
            const data = doc.data()
            const e = new Exhibition(doc.id, data.name, data.slug)
            exhibitions.push(e)
        })

        return exhibitions
    }
}
