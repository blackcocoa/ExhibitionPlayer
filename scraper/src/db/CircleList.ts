import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { Circle } from '../../../shared/Circle'
import { Exhibition } from '../../../shared/Exhibition'

export class CircleList {
    db: firebase.firestore.Firestore
    exhibition: Exhibition
    circles: Circle[]

    constructor(db) {
        this.db = db
    }

    add(circles: Circle[]): void {
        this.circles = circles
    }

    setExhibition(exhibition: Exhibition) {
        this.exhibition = exhibition
    }

    private async batchSave(c: Circle[]): Promise<void> {
        if (!c.length) return

        let batch = this.db.batch()
        let circles = [...c]
        const length = Math.min(circles.length, 499)

        for (let i = 0; i < length; i++) {
            let circle = circles.pop()
            let params = {
                booth: circle.booth,
                name: circle.name,
                description: circle.description,
                twitterId: circle.twitterId,
                media: null,
            }
            if (circle.media) {
                params.media = {
                    id: circle.media.id,
                    type: circle.media.type,
                    url: circle.media.url,
                }
            }
            const ref = this.db.collection('exhibitions').doc(this.exhibition.id).collection('circles').doc()
            batch.set(ref, params)
        }
        try {
            await batch.commit()
        } catch (error) {
            console.error(error)
        }
        await this.batchSave(circles)
    }

    async save(): Promise<void> {
        this.batchSave(this.circles)
    }

    // async saveCircle(circle): Promise<string> {
    //     let params = { ...circle }
    //     params.exhibition = this.db.doc('exhibitions/' + params.exhibition.id)
    //     try {
    //         const result = await this.db.collection('circles').add(params)
    //         return result.id
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }
}
