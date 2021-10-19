import firebase from 'firebase/app'
import 'firebase/firestore'
import { Exhibition } from '../../shared/Exhibition'

export class ExhibitionResource {
    db: firebase.firestore.Firestore
    collections: firebase.firestore.CollectionReference

    constructor(db: firebase.firestore.Firestore) {
        this.db = db
        this.collections = this.db.collection('exhibitions')
    }

    async fetch() {
        const snapshot = await this.collections.orderBy('createdAt', 'desc').get()

        let exhibitions: Exhibition[] = []
        snapshot.forEach((doc) => {
            const data = doc.data()
            exhibitions.push(new Exhibition(doc.id, data.name, data.slug))
        })
        return exhibitions
    }

    async findBySlug(slug: string) {
        const snapshot = await this.collections.where('slug', '==', slug).get()

        if (snapshot.empty) {
            throw new Error('not found')
        }

        const data = snapshot.docs[0].data()
        return new Exhibition(snapshot.docs[0].id, data.name, data.slug)
    }
}
