import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Circle } from '../../../../shared/Circle'
import { Exhibition } from '../../../../shared/Exhibition'
import { SoundCloudStreamUrl } from '../../../../shared/SoundCloudStreamUrl'
import { getStreamUrl } from './stream'
import { MediaService } from '../../../../shared/Media'

export class CircleResource {
    db: firestore.Firestore
    collection: firestore.CollectionReference | undefined
    query: firestore.Query | undefined
    exhibition: Exhibition | undefined
    filterFields: string[] // To avoid firebase errors if where and orderBy are same
    limit: number
    last: firestore.DocumentSnapshot | null

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

        // if (!this.filterFields.find((f) => f === 'booth.area')) doc = doc.orderBy('booth.area', 'asc')
        doc = doc.orderBy(firebase.firestore.FieldPath.documentId(), 'asc')

        if (this.last) {
            doc = doc.startAfter(this.last)
        }
        const snapshot = await doc.limit(this.limit).get()

        if (snapshot.empty) return []

        this.last = snapshot.docs[snapshot.docs.length - 1]

        let circles: Circle[] = []
        snapshot.forEach((doc) => {
            circles.push(<Circle>doc.data())
        })

        const streamUrls: SoundCloudStreamUrl[] = await getStreamUrl(
            circles
                .filter((c) => c.media && c.media.id && c.media.type === MediaService.SoundCloud)
                .map<string>((c) => c.media!.id!)
        )

        return circles.map<Circle>((c) => {
            if (!c.media || !c.media.id) return c
            const streamUrl = streamUrls.find((u) => u.id === c.media!.id)
            if (!streamUrl || !streamUrl.url) return c

            c.media.title = `${c.name} (${c.booth.area} ${c.booth.number})`
            c.media.description = c.description
            c.media.url = streamUrl.url
            c.media.coverUrl = streamUrl.coverUrl

            return c
        })
    }

    setExhibition(exhibition: Exhibition) {
        this.exhibition = exhibition
        this.collection = this.db.collection('exhibitions').doc(this.exhibition.id).collection('circles')
    }

    addFilter(field: string, operator: string, value: string): void {
        if (!this.collection) throw new Error('Exhibition not set')
        this.query = this.collection.where(field, operator as firestore.WhereFilterOp, value)
        this.filterFields.push(field)
    }

    orderBy(field: string, order: 'desc' | 'asc' | undefined): void {
        this.query = this.query?.orderBy(field, order)
    }

    clearFilter(): void {
        if (!this.exhibition) throw new Error('Exhibition not set')
        this.query = this.db.collection('exhibitions').doc(this.exhibition.id).collection('circles')
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
