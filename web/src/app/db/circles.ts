import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Circle } from '../../../../shared/Circle'
import { Exhibition } from '../../../../shared/Exhibition'

export class CircleResource {
    db: firestore.Firestore
    collection: firestore.CollectionReference | undefined
    query: firestore.Query | undefined
    exhibition: Exhibition | undefined
    filterFields: string[] // To avoid firebase errors if where and orderBy are same
    limit: number
    last: { id: string; data: firestore.DocumentData } | null

    constructor(db: firestore.Firestore) {
        this.db = db
        this.limit = (process.env.CIRCLE_FETCH_LIMIT as unknown) as number
        this.last = null
        this.filterFields = []
    }

    private async _fetch() {
        if (!this.exhibition || !this.collection) {
            throw new Error('Exhibition not set')
        }
        if (!this.query) {
            this.query = this.collection
        }

        let doc = this.query

        if (!this.filterFields.find(f => f === 'booth.area')) doc = doc.orderBy('booth.area', 'asc')
        doc = doc.orderBy('booth.number', 'asc').orderBy(firebase.firestore.FieldPath.documentId())

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

    addFilter(field: string, operator: string, value: string): void {
        if (!this.collection) throw new Error('Exhibition not set')
        this.query = this.collection.where(field, operator as firestore.WhereFilterOp, value)
        this.filterFields.push(field)
    }

    clearFilter(): void {
        this.query = this.collection
        this.filterFields = []
    }

    async fetch(): Promise<Circle[]> {
        this.last = null
        return this._fetch()
    }

    async next(): Promise<Circle[]> {
        return this._fetch()
    }
}
