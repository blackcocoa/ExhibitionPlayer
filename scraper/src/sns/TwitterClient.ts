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
    }
}

export class RateLimitError extends Error { }

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
            consumer_key: 'DC2s1669PdFGIPkhewWvY3Iir',
            consumer_secret: 'PorekH4bsUED33NuqsM6XKA25JO4vzQirzjZbmo0GfBM4yj7lR',
            // access_token_key: '135470684-0XbudyTHeWy68adMUfT4IAykpVK8KUXB8u1E1ZIS',
            // access_token_secret: 'fd6y9KQ3U4ksWmlrarBOllS9mdmgJOzDDcXPwMpHs1t4f',
        })
        this.token = null
        this.since = null
        this.until = null
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
                reliability: rawTweet.reliability,
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
            tweets: tweets.map((raw) => {
                return {
                    body: raw.text,
                }
            })
                .slice(0, TwitterClient.MAX_TWEET_NUM)
            ,
            urls: urls.urls,
            reliability: urls.reliability,
        }
    }

    private onError(screenName: string, error: any): void {
        if (!error?.response?.status) {
            Log.print(`An unknown error occured when accessing ${screenName}`)
            console.log(error.response)
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
                Log.print(`An unknown error occured when accessing ${screenName} (Code: ${error.status})`)
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
                { headers: { Authorization: 'Bearer ' + this.token }, data: {} }
            )
            const tweetResponse: RawTweet[] = (
                await this.client.get('statuses/user_timeline', {
                    screen_name: username,
                    trim_user: true,
                    exclude_replies: true,
                    include_rts: false,
                    count: 200,
                })
            ).map((t) => ({ ...t, reliability: 0.3 }))
            const tagResponse: RawTweet[] = (
                await this.client.get('search/tweets', {
                    q: `#M3 OR #M3春 OR #M3秋 from:${username}`,
                })
            ).statuses.map((t) => ({ ...t, reliability: 0.6 }))
            if (userResponse.data.includes?.tweets?.length) {
                tweetResponse.unshift({ ...userResponse.data.includes.tweets[0], reliability: 0.5 })
            }
            const result = this.onGetTimeline(tagResponse.concat(tweetResponse))
            result.user = {
                id: userResponse.id,
                screenName: userResponse.username,
                name: userResponse.name,
                description: userResponse.description,
            }
            return result
        } catch (error) {
            this.onError(screenName, error)
            return null
        }
    }
}
