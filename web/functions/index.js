const path = require('path')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const next = require('next')
const axios = require('axios')
const SOUNDCLOUD_CLIENT_ID = 'tvr5oyEDbwmNuQSmuNFkGLFrMn5wqT3H'
admin.initializeApp()

const firestore = admin.firestore()

var dev = process.env.NODE_ENV !== 'production'
var app = next({
    dev,
    conf: { distDir: `${path.relative(process.cwd(), __dirname)}/next` },
})
var handle = app.getRequestHandler()

exports.next = functions.region('us-central1').https.onRequest((req, res) => {
    console.log('File: ' + req.originalUrl) // log the page.js file that is being requested
    return app.prepare().then(() => handle(req, res))
})

async function fetchAllCircles(exhibitionId) {
    try {
        const snapshot = await firestore.collection('exhibitions').doc(exhibitionId).collection('circles').get()

        if (snapshot.empty) return []

        let circles = []
        snapshot.forEach((doc) => {
            circles.push({ id: doc.id, data: doc.data() })
        })

        return circles
    } catch (error) {
        console.error('Error getting circles: ', error)
    }
}

async function updateCircle(exhibitionId, circleId, data) {
    await this.db.collection('exhibitions').doc(exhibitionId).collection('circles').doc(circleId).update(data)
}

/**
 * Get SoundCloud Streaming Url by Media ID
 */

const getItById = async (trackId) => {
    const response = await axios.get(
        `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${SOUNDCLOUD_CLIENT_ID}`
    )
    const transcoding = response.data.media.transcodings.filter((t) => t.format.protocol === 'progressive')
    if (!transcoding) return res.json({ url: null })
    const coverUrl = response.data.artwork_url || response.data.user.avatar_url
    const streamResponse = await axios.get(`${transcoding[0].url}?client_id=${SOUNDCLOUD_CLIENT_ID}`)
    return { url: streamResponse.data.url, id: trackId, coverUrl: coverUrl }
}

const checkSoundCloudTokenHealth = async (context) => {
    const trackId = '563207157' // https://soundcloud.com/imtenpi/starstruck

    try {
        const response = await axios.get(
            `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${SOUNDCLOUD_CLIENT_ID}`
        )
    } catch (error) {
        console.error(new Error('Error validating the SoundCloud token'))
    }

    return null
}

exports.getStreamUrl = functions.region('us-central1').https.onCall(async (data, context) => {
    let media = []
    for (const id of data.trackId) {
        try {
            media.push(await getItById(id))
        } catch (error) {
            // continue
        }
    }
    return media
})

exports.fetchSoundCloudTokenHealth = functions.region('us-central1').https.onCall(checkSoundCloudTokenHealth)

exports.watchSoundCloudTokenHealth = functions
    .region('us-central1')
    .pubsub.schedule('every 12 hours')
    .onRun(checkSoundCloudTokenHealth)
