import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Exhibition } from '../../../../shared/Exhibition'

export class ExhibitionResource {
    db: firestore.Firestore

    constructor(db: firestore.Firestore) {
        this.db = db
    }

    async fetch() {
        const snapshot = await this.db.collection('exhibitions').get()

        let exhibitions: Exhibition[] = []
        snapshot.forEach(doc => {
            const data = doc.data()
            exhibitions.push(new Exhibition(doc.id, data.name))
        })
        return exhibitions
    }
}
