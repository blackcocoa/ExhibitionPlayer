import { TwitterClient, RateLimitError } from './sns/TwitterClient'
import { Log } from './debug/Log'
import { CircleList } from './db/CircleList'
import { MediaFactory } from './sns/MediaFactory'
import { Firestore } from './db/Firestore'
import { ExhibitionList } from './db/ExhibitionList'
require('dotenv').config()

const client = new TwitterClient()

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec))

async function go() {
    await client.getBearerToken()

    const db = new Firestore()
    try {
        await db.login()
    } catch (error) {
        console.error(error)
    }

    const exhibitionList = new ExhibitionList(db.db)
    const exhibitions = await exhibitionList.fetchAll()
    const circles = new CircleList(db.db)
    const exhibition = exhibitions.find((e) => e.name === 'M3 2020秋')
    circles.setExhibition(exhibition)

    const result = await circles.fetchAll()

    for (let i = 0; i < result.length; i++) {
        const { id, data } = result[i]
        if (!data.twitterId) continue

        Log.print(`Fetching ${data.twitterId}`)

        try {
            const timeline = await client.fetch(data.twitterId)
            if (!timeline || !timeline.urls.length || (timeline.reliability && timeline.reliability >= 0.6)) continue

            const media = await MediaFactory.create(timeline.urls, timeline.reliability)
            if (!media) continue
            console.log(media)
            circles.update(id, {
                media: media
            })
        } catch (error) {
            if (error instanceof RateLimitError) {
                Log.print('Rate limit exceeded. waiting for 15 minutes...')
                await sleep(15 * 60 * 1000)
                i--
            }
        }
    }

    Log.print('Finished!')
}

go()
