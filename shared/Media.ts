export enum MediaService {
    SoundCloud,
    YouTube,
}

export class Media {
    id: string | null
    type: MediaService | null
    url: string
    title?: string
    description?: string
    coverUrl?: string
    constructor(url: string) {
        this.url = url
        this.id = null
        this.type = null
    }
}
