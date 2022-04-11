export enum MediaService {
    SoundCloud,
    YouTube,
}

export class Media {
    id: string | null
    circleId: string | null
    type: MediaService | null
    url: string
    title?: string
    description?: string
    coverUrl?: string
    reliability: number
    constructor(url: string) {
        this.url = url
        this.id = null
        this.circleId = null
        this.type = null
        this.reliability = 0
    }
}
