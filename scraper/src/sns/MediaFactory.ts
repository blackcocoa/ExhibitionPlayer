import { MediaService } from '../../../shared/Media'
import { Media } from '../../../shared/Media'
import Soundcloud from 'soundcloud.ts'

export class MediaFactory {
    static async create(urls: string[], reliability: number): Promise<Media> {
        for (let url of urls) {
            try {
                const id = await MediaFactory.getMediaId(url)
                return {
                    id: id,
                    type: MediaFactory.getMediaType(url),
                    url: url,
                    reliability: reliability,
                }
            } catch (error) {
                continue
            }
        }
    }

    static async getMediaId(url: string): Promise<string> {
        const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN)
        let result

        if (url.match(/^https?:\/\/(?:soundcloud\.com)\/(.*)/im)) {
            const id = await soundcloud.resolve.get(url)
            return id
        } else if ((result = url.match(/^https?:\/\/(?:youtu\.be|www\.youtube\.com)\/(.*)/im))) {
            return result[1].replace('c/', '').replace('user/', '').replace('/', '')
        } else throw new Error("Couldn't detece media ID")
    }

    static getMediaType(url: string): MediaService {
        if (url.match(/^https?:\/\/(?:soundcloud\.com)\/(.*)/i)) {
            return MediaService.SoundCloud
        } else if (url.match(/^https?:\/\/(?:soundcloud\.com|youtu\.be|www\.youtube\.com)\/(.*)/i)) {
            return MediaService.YouTube
        } else throw new Error("Couldn't detece media type")
    }
}
