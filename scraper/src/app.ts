import { M32020AutumnScraper } from './circle/M32020AutumnScraper'
import { TwitterClient, RateLimitError } from './sns/TwitterClient'
import { Log } from './debug/Log'
import { CircleList } from './db/CircleList'
import { MediaFactory, SoundCloudApiKeyError } from './sns/MediaFactory'
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

    const scraper = new M32020AutumnScraper(exhibition)
    circles.add(await scraper.fetch())
    client.setPeriod(new Date('2020-9-25 00:00:00'), new Date('2020-10-25 23:59:59'))

    Log.print(`Circle List fetched. getting media...`)

    for (let i = 0; i < circles.circles.length; i++) {
        const id = circles.circles[i].twitterId
        if (!id) continue

        try {
            const timeline = await client.fetch(id)
            if (timeline && timeline.urls.length) {
                circles.circles[i].media = await MediaFactory.create(timeline.urls, timeline.reliability)
            }
        } catch (error) {
            if (error instanceof SoundCloudApiKeyError) {
                Log.print('Soundcloud rejects the request. Please refresh the API Key!')
                process.exit(-1)
            }

            if (error instanceof RateLimitError) {
                Log.print('Rate limit exceeded. waiting for 15 minutes...')
                await sleep(15 * 60 * 1000)
                i--
            }
        }
    }
    await circles.save()

    Log.print('Finished!')
    process.exit(0)
}

go()
