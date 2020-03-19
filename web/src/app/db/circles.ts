import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Circle } from '../../../../shared/Circle'
import { Exhibition } from '../../../../shared/Exhibition'

export class CircleResource {
    db: firestore.Firestore
    collection: firestore.CollectionReference
    exhibition: Exhibition
    limit: number
    last: firestore.DocumentSnapshot | null

    constructor(db: firestore.Firestore, exhibition: Exhibition) {
        this.db = db
        this.exhibition = exhibition
        this.collection = this.db
            .collection('exhibitions')
            .doc(this.exhibition.id)
            .collection('circles')
        this.limit = (process.env.CIRCLE_FETCH_LIMIT as unknown) as number
        this.last = null
    }

    async fetch(page: number = 0) {
        const snapshot = await this.collection
            .orderBy('name', 'asc')
            .limit(this.limit)
            .get()

        this.last = snapshot.docs[snapshot.docs.length - 1]
        let circles: Circle[] = []
        snapshot.forEach(doc => {
            console.log(doc.data())
            circles.push(<Circle>doc.data())
        })
        return circles
    }

    async next() {
        if (!this.last) return await this.fetch()

        const lastData = this.last.data()
        if (!lastData) return null
        //TODO is name unique?
        const snapshot = await this.collection
            .orderBy('name', 'asc')
            .startAfter(lastData.name)
            .limit(this.limit)
            .get()
    }
}
