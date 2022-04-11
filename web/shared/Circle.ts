import { Exhibition } from './Exhibition'
import { Media } from './Media'

export class Circle {
    id: string
    booth: BoothNumber
    name: string
    description: string
    twitterId: string
    youtubeId?: string
    media?: Media

    constructor(
        id: string,
        booth: BoothNumber,
        name: string,
        description: string,
        twitterId: string,
        youtubeId = undefined,
        media = undefined
    ) {
        this.id = id
        this.booth = booth
        this.name = name
        this.description = description
        this.twitterId = twitterId
        this.youtubeId = youtubeId
        this.media = media
    }
}

export interface BoothNumber {
    area: string
    number: string
}
