import { MediaService } from '../../../shared/Media'
import { Media } from '../../../shared/Media'
import Soundcloud from 'soundcloud.ts'
import Axios from 'axios'

export class SoundCloudApiKeyError extends Error { }

export class MediaFactory {
    static async create(urls: string[], reliability: number): Promise<Media> {
        for (let url of urls) {
            try {
                return {
                    id: await MediaFactory.getMediaId(url),
                    type: MediaFactory.getMediaType(url),
                    url: url,
                    reliability: reliability,
                }
            } catch (error) {
                if (error?.response?.status === 403) {
                    throw new SoundCloudApiKeyError()
                }
                continue
            }
        }
    }

    static async getMediaId(url: string): Promise<string> {
        const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN)
        let result
        if (url.match(/^https?:\/\/(?:soundcloud\.com)\/(.*)/im)) {
            const response = await Axios.get(`https://api-v2.soundcloud.com/resolve?url=${url}&client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`)
            if (response.data.kind === 'track') return response.data.id
            else if (response.data.kind === 'playlist') return response.data.tracks[0].id
            throw new Error("This is not a track or playlist")
        } else if ((result = url.match(/^https?:\/\/(?:youtu\.be|www\.youtube\.com)\/(.*)/im))) {
            if (/^(channel\/|c\/|user\/|playlist)/.test(result[1])) throw new Error('This is channel URL')
            return result[1].replace('/', '')
        } else throw new Error("Couldn't detect media ID")
    }

    static getMediaType(url: string): MediaService {
        if (url.match(/^https?:\/\/(?:soundcloud\.com)\/(.*)/i)) {
            return MediaService.SoundCloud
        } else if (url.match(/^https?:\/\/(?:soundcloud\.com|youtu\.be|www\.youtube\.com)\/(.*)/i)) {
            return MediaService.YouTube
        } else throw new Error("Couldn't detect media type")
    }
}
