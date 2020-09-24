import { TwitterTimeline } from './TwitterTimeline'
import { Log } from '../debug/Log'
import * as moment from 'moment'
import axios from 'axios'

const Twitter = require('twitter-lite')

interface RawTweet {
    //temporary
    text: string
    created_at: string
    entities: {
        urls: [{ expanded_url: string }]
    }
}

export class RateLimitError extends Error {}

export class TwitterClient {
    static MAX_TWEET_NUM = 10
    client: any
    token: string | null
    since: Date
    until: Date

    constructor() {
        this.client = new Twitter({
            version: '2',
            consumer_key: 'DC2s1669PdFGIPkhewWvY3Iir',
            consumer_secret: 'PorekH4bsUED33NuqsM6XKA25JO4vzQirzjZbmo0GfBM4yj7lR',
            // access_token_key: '135470684-0XbudyTHeWy68adMUfT4IAykpVK8KUXB8u1E1ZIS',
            // access_token_secret: 'fd6y9KQ3U4ksWmlrarBOllS9mdmgJOzDDcXPwMpHs1t4f',
        })
        this.token = null
        this.since = new Date('2020-9-25 00:00:00')
        this.until = new Date('2020-10-25 23:59:59')
    }

    private getAvailableUrls(response: RawTweet[]): string[] {
        let urls: any[] = []
        const regexSoundCloud = /^https?:\/\/(?:soundcloud\.com)\/(.*)/i

        response.forEach((rawTweet) => {
            const u = rawTweet.entities.urls
                .map((u) => u.expanded_url)
                .filter((url) => url.match(/^https?:\/\/(?:soundcloud\.com|youtu\.be|www\.youtube\.com)\/(.*)/im))
            if (!u.length) return
            urls.push({
                url: u[0],
                createdAt: moment(rawTweet.created_at, 'LLLL ZZ YYYY').unix(),
            })
        })

        urls = urls.sort((a, b) => {
            if (a.url.match(regexSoundCloud)) {
                if (b.url.match(regexSoundCloud)) return a.createdAt > b.createdAt ? -1 : 1
                else return -1
            } else if (b.url.match(regexSoundCloud)) return 1
            else return a.createdAt > b.createdAt ? -1 : 1
        })

        return urls.map((u) => u.url)
    }

    private onGetTimeline(tweets: RawTweet[]): TwitterTimeline {
        //TODO: twitter-lite type hinting
        return {
            user: null,
            tweets: tweets
                .filter((raw) => {
                    const d = new Date(raw.created_at)
                    return this.since < d && d < this.until
                })
                .map((raw) => {
                    return {
                        body: raw.text,
                    }
                })
                .slice(0, TwitterClient.MAX_TWEET_NUM),
            urls: this.getAvailableUrls(tweets),
        }
    }

    private onError(screenName: string, error: any): void {
        if (!error?.errors?.length) {
            Log.print(`An unknown error occured when accessing ${screenName}`)
            return
        }
        for (let e of error.errors) {
            switch (e.code) {
                case 34:
                    Log.print(`${screenName} is not found`)
                    return
                case 88:
                    throw new RateLimitError()
                default:
                    Log.print(`An unknown error occured when accessing ${screenName} (Code: ${e.code})`)
                    return
            }
        }
    }

    async getBearerToken() {
        const response = await this.client.getBearerToken()

        this.token = response.access_token
        this.client = new Twitter({
            version: '2',
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
            const tweetResponse: RawTweet[] = await this.client.get('statuses/user_timeline', {
                screen_name: username,
                trim_user: true,
                count: 200,
            })
            const tagResponse: any = await this.client.get('search/tweets', { q: `#M3 from:${username}` })
            if (userResponse.data.includes?.tweets?.length) {
                tweetResponse.unshift(userResponse.data.includes.tweets[0])
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
