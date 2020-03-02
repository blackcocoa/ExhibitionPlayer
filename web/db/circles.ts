import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Circle } from '../../shared/Circle'
import { Exhibition } from '../../shared/Exhibition'

export class CircleResource {
    db: firestore.Firestore
    exhibition: Exhibition

    constructor(db: firestore.Firestore, exhibition: Exhibition) {
        this.db = db
        this.exhibition = exhibition
    }

    async fetch() {
        const snapshot = await this.db
            .collection('exhibitions')
            .doc(this.exhibition.id)
            .collection('circles')
            .get()

        let circles: Circle[] = []
        snapshot.forEach(doc => {
            circles.push(<Circle>doc.data())
        })
        return circles
    }
}
