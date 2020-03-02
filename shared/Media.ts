export enum MediaService {
    SoundCloud,
    YouTube,
}

export class Media {
    id: string | null
    type: MediaService | null
    url: string
    constructor(url: string) {
        this.url = url
        this.id = null
        this.type = null
    }
}
