import { TwitterTimeline } from './TwitterTimeline'
import { Log } from '../debug/Log'
import * as moment from 'moment'
import axios from 'axios'

const Twitter = require('twitter-lite')

interface RawTweet {
    //temporary
    text: string
    created_at: string
    reliability: number
    retweeted_status?: object
    quoted_status?: object
    entities: {
        urls: [{ expanded_url: string }]
        hashtags: { text?: string; tag?: string }[]
    }
}

export class RateLimitError extends Error {}

export class TwitterClient {
    static MAX_TWEET_NUM = 10
    client: any
    token: string | null
    since: Date | null
    until: Date | null

    /**
     *
     * @param since Date
     * @param until Date
     */
    constructor() {
        this.client = new Twitter({
            version: '1.1',
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        })
        this.token = null
        this.since = null
        this.until = null
    }

    private getReliability(hashtags: { text?: string; tag?: string }[]) {
        if (!hashtags) return 0.3

        for (const tag of hashtags) {
            if (!tag.tag && !tag.text) continue
            const text = tag.tag || tag.text
            if (text.match(/(M3|M3春|春M3|M3秋|秋M3|M3まとめ)/)) return 0.6
        }
        return 0.3
    }

    private getAvailableUrls(response: RawTweet[]): { urls: string[]; reliability: number } {
        let urls: any[] = []
        const regexSoundCloud = /^https?:\/\/(?:soundcloud\.com)\/(.*)/i

        response.forEach((rawTweet) => {
            if (!rawTweet?.entities?.urls) return
            const u = rawTweet.entities.urls
                .map((u) => u.expanded_url)
                .filter((url) => url.match(/^https?:\/\/(?:soundcloud\.com|youtu\.be|www\.youtube\.com)\/(.*)/im))
            if (!u.length) return
            urls.push({
                url: u[0],
                reliability: this.getReliability(rawTweet.entities.hashtags),
                createdAt: moment(rawTweet.created_at, 'LLLL ZZ YYYY').unix(),
            })
        })
        urls = urls.sort((a, b) => {
            if (a.reliability > b.reliability) return -1
            if (a.reliability < b.reliability) return 1

            if (a.url.match(regexSoundCloud)) {
                if (b.url.match(regexSoundCloud)) return a.createdAt > b.createdAt ? -1 : 1
                else return -1
            } else if (b.url.match(regexSoundCloud)) return 1

            return a.createdAt > b.createdAt ? -1 : 1
        })
        return { urls: urls.map((u) => u.url), reliability: urls[0]?.reliability }
    }

    private onGetTimeline(tweets: RawTweet[]): TwitterTimeline {
        //TODO: twitter-lite type hinting
        tweets = tweets
            .filter((raw) => {
                return !raw.retweeted_status && !raw.quoted_status
            })
            .filter((raw) => {
                if (!this.since || !this.until) return true
                const d = new Date(raw.created_at)
                return this.since < d && d < this.until
            })
        const urls = this.getAvailableUrls(tweets)
        return {
            user: null,
            tweets: tweets
                .map((raw) => {
                    return {
                        body: raw.text,
                    }
                })
                .slice(0, TwitterClient.MAX_TWEET_NUM),
            urls: urls.urls,
            reliability: urls.reliability,
        }
    }

    private onError(screenName: string, error: any): void {
        if (!error || !error.response || !error.response.status) {
            Log.print(`An unknown error occured when accessing ${screenName}`)
            return
        }
        switch (error.response.status) {
            case 34:
                Log.print(`${screenName} is not found`)
                return
            case 88:
            case 429:
                throw new RateLimitError()
            default:
                Log.print(`An unknown error occured when accessing ${screenName} (Code: ${error?.response?.status})`)
                return
        }
    }

    /**
     *
     * @param since Date
     * @param until Date
     */
    setPeriod(since, until) {
        this.since = since
        this.until = until
    }

    async getBearerToken() {
        const response = await this.client.getBearerToken()
        this.token = response.access_token
        this.client = new Twitter({
            version: '1.1',
            bearer_token: this.token,
        })
    }

    async fetch(screenName: string): Promise<TwitterTimeline> {
        const username = screenName.replace(/\//g, '')

        try {
            const userResponse: any = await axios.get(
                `https://api.twitter.com/2/users/by/username/${username}?expansions=pinned_tweet_id&user.fields=description&tweet.fields=text,created_at,entities`,
                { headers: { Authorization: 'Bearer ' + this.token } }
            )
            const tweetResponse: RawTweet[] = (
                await this.client.get('statuses/user_timeline', {
                    screen_name: username,
                    trim_user: true,
                    exclude_replies: true,
                    include_rts: false,
                    tweet_mode: 'extended',
                    count: 200,
                })
            ).map((t) => ({ ...t, text: t.full_text || t.text }))
            // const tagResponse: RawTweet[] = (
            //     await this.client.get('search/tweets', {
            //         q: `#M3 OR #M3春 OR #M3秋 OR #M3まとめ from:${username}`,
            //         tweet_mode: 'extended',
            //     })
            // ).statuses.map((t) => ({ ...t, reliability: 0.6 }))
            if (userResponse.data.includes?.tweets?.length) {
                const tweet = userResponse.data.includes.tweets[0]
                tweetResponse.unshift({
                    ...tweet,
                    reliability: tweet.text.match(/(#M3|#M3春|#春M3|#秋M3|#M3秋|#M3まとめ)/) ? 0.6 : 0.5,
                })
            }
            const result = this.onGetTimeline(tweetResponse)
            result.user = {
                id: userResponse.data.data.id,
                screenName: userResponse.data.data.username,
                name: userResponse.data.data.name,
                description: userResponse.data.data.description,
            }
            return result
        } catch (error) {
            this.onError(screenName, error)
            return null
        }
    }
}
