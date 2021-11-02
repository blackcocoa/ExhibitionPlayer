import { Log } from '../debug/Log'
import * as moment from 'moment'
import axios from 'axios'

export class YouTubeClient {
    apiKey: string
    searchWords: string[]

    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY
        this.searchWords = []
    }

    private isRelated(name: string) {
        for (let searchword of this.searchWords) {
            if (name.search(searchword) >= 0) return true
        }
        return false
    }

    private onError(username: string, error: any): void {
        console.error(username, error)
    }

    setSearchWords(words: string[]) {
        this.searchWords = words
    }

    async fetchChannelId(username: string): Promise<string> {
        try {
            const response: any = await axios.get(
                `https://www.googleapis.com/youtube/v3/channels?key=${this.apiKey}&forUsername=${username}`
            )
            if (response?.items.length) {
                return response.items[0].id
            }
        } catch (error) {
            this.onError(username, error)
            return null
        }
    }

    async fetch(channelId: string): Promise<string> {
        try {
            const response: any = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&channelId=${channelId}&part=snippet&maxResults=10`
            )
            for (let item of response.data.items) {
                let title = item.snippet.title
                let description = item.snippet.description
                if (this.isRelated(title) || this.isRelated(description)) {
                    //TODO
                    return item.id.videoId
                }
            }
            return null
        } catch (error) {
            this.onError(channelId, error)
            return null
        }
    }
}
