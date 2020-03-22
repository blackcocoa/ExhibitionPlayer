import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Circle } from '../../../../shared/Circle'
import { Exhibition } from '../../../../shared/Exhibition'

export class CircleResource {
    db: firestore.Firestore
    collection: firestore.CollectionReference | undefined
    exhibition: Exhibition | undefined
    limit: number
    last: { id: string; data: firestore.DocumentData } | null

    constructor(db: firestore.Firestore) {
        this.db = db
        this.limit = (process.env.CIRCLE_FETCH_LIMIT as unknown) as number
        this.last = null
    }

    private async _fetch() {
        if (!this.exhibition || !this.collection) {
            throw new Error('Exhibition not set')
        }
        let doc = this.collection.orderBy('name', 'asc').orderBy(firebase.firestore.FieldPath.documentId())
        if (this.last) {
            const lastCircle = this.last.data as Circle
            doc = doc.startAfter(lastCircle.name, this.last.id)
        }
        const snapshot = await doc.limit(this.limit).get()

        if (snapshot.empty) return []

        this.last = {
            id: snapshot.docs[snapshot.docs.length - 1].id,
            data: snapshot.docs[snapshot.docs.length - 1].data(),
        }

        let circles: Circle[] = []
        snapshot.forEach(doc => {
            circles.push(<Circle>doc.data())
        })

        return circles
    }

    setExhibition(exhibition: Exhibition) {
        this.exhibition = exhibition
        this.collection = this.db
            .collection('exhibitions')
            .doc(this.exhibition.id)
            .collection('circles')
    }

    async fetch(): Promise<Circle[]> {
        this.last = null
        return this._fetch()
    }

    async next(): Promise<Circle[]> {
        return this._fetch()
    }
}
