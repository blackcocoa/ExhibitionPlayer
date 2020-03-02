import { Tweet } from '../../../shared/Tweet'

export interface TwitterTimeline {
    user: { id: number; screenName: string; name: string; description: string }
    tweets: Tweet[]
    urls: string[]
}
