import { Log } from '../debug/Log'
import * as moment from 'moment'
import axios from 'axios'
require('dotenv').config()

export class YouTubeClient {
    apiKey: string
    searchWords: string[]
    period: [Date, Date]

    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY
        this.searchWords = []
        this.period = [new Date('1970-1-1 00:00:00'), new Date('2099-12-31 23:59:59')]
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

    setPeriod(since: Date, until: Date) {
        this.period = [since, until]
    }

    async fetchChannelId(username: string): Promise<string> {
        try {
            const response: any = await axios.get(
                `https://www.googleapis.com/youtube/v3/channels?key=${this.apiKey}&forUsername=${username}`
            )
            if (response?.data?.items?.length) {
                return response.data.items[0].id
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
                const publishedAt = new Date(item.snippet.publishedAt)
                if (
                    this.period[0] < publishedAt &&
                    publishedAt < this.period[1] &&
                    (this.isRelated(title) || this.isRelated(description))
                ) {
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
