import { Exhibition } from './Exhibition'
import { Media } from './Media'

export class Circle {
    booth: BoothNumber
    name: string
    description: string
    twitterId: string
    media?: Media

    constructor(booth: BoothNumber, name: string, description: string, twitterId: string, media = undefined) {
        this.booth = booth
        this.name = name
        this.description = description
        this.twitterId = twitterId
        this.media = media
    }
}

export interface BoothNumber {
    area: string
    number: string
}
