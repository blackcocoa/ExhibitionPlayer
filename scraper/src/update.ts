import Scraper from './circle/M32022SpringScraper'
import { TwitterClient, RateLimitError } from './sns/TwitterClient'
import { Log } from './debug/Log'
import { CircleList } from './db/CircleList'
import { MediaFactory } from './sns/MediaFactory'
import { Firestore } from './db/Firestore'
import { ExhibitionList } from './db/ExhibitionList'
import { YouTubeClient } from './sns/YouTubeClient'
import { Media, MediaService } from '../../shared/Media'
require('dotenv').config()

const twitterClient = new TwitterClient()
const youtubeClient = new YouTubeClient()

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec))

async function go() {
    await twitterClient.getBearerToken()

    const db = new Firestore()
    try {
        await db.login()
    } catch (error) {
        console.error(error)
    }

    const exhibitionList = new ExhibitionList(db.db)
    const exhibitions = await exhibitionList.fetchAll()
    const circles = new CircleList(db.db)
    const exhibition = exhibitions.find((e) => e.slug === Scraper.ID)
    twitterClient.setPeriod(Scraper.PERIOD[0], Scraper.PERIOD[1])
    youtubeClient.setSearchWords(Scraper.YOUTUBE_SEARCH_WORD)
    youtubeClient.setPeriod(Scraper.PERIOD[0], Scraper.PERIOD[1])
    circles.setExhibition(exhibition)

    const result = await circles.fetchAll()

    Log.print(`Circle List fetched. updating media...`)

    for (let i = 0; i < result.length; i++) {
        const { id, data } = result[i]
        let media: Media
        if (data.twitterId) {
            try {
                if (data.media && data.media.reliability >= 0.6) continue
                const timeline = await twitterClient.fetch(data.twitterId)
                if (!timeline || !timeline.urls.length) continue
                media = await MediaFactory.create(timeline.urls, timeline.reliability, id)
            } catch (error) {
                if (error instanceof RateLimitError) {
                    Log.print('Rate limit exceeded. waiting for 15 minutes...')
                    await sleep(15 * 60 * 1000)
                    i--
                } else {
                    Log.print(error)
                }
            }
        } else if (data.youtubeId) {
            const movieId = await youtubeClient.fetch(data.youtubeId)
            if (!movieId) continue
            media = {
                circleId: id,
                id: movieId,
                type: MediaService.YouTube,
                url: `https://youtu.be/${movieId}`,
                reliability: 0.4,
            }
        }
        if (!media) continue
        if (
            !data.media ||
            media.reliability > data.media.reliability ||
            (media.url !== data.media.url && media.reliability >= data.media.reliability)
        ) {
            await circles.update(id, { media })
            Log.print(`${data.twitterId || data.youtubeId}: media updated`)
        }
    }

    process.exit(0)
}

go()
