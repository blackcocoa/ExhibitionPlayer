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
    client.setPeriod(new Date('2020-9-25 00:00:00'), new Date('2020-10-25 23:59:59'))
    circles.setExhibition(exhibition)

    const result = await circles.fetchAll()

    Log.print(`Circle List fetched. updating media...`)

    for (let i = 0; i < result.length; i++) {
        const { id, data } = result[i]
        if (!data.twitterId) continue

        try {
            if (data.media && data.media.reliability >= 0.6) continue
            const timeline = await client.fetch(data.twitterId)
            if (!timeline || !timeline.urls.length) continue
            const media = await MediaFactory.create(timeline.urls, timeline.reliability)
            if (!media) continue
            if (!data.media || (media.reliability > data.media.reliability) || (media.url !== data.media.url && media.reliability >= data.media.reliability)) {
                await circles.update(id, {
                    media: media
                })
                Log.print(`${data.twitterId} : media updated`)
            }
        } catch (error) {
            if (error instanceof RateLimitError) {
                Log.print('Rate limit exceeded. waiting for 15 minutes...')
                await sleep(15 * 60 * 1000)
                i--
            } else {
                Log.print(error)
            }
        }
    }

    Log.print('Finished!')
}

go()
