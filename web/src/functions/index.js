const path = require('path')
const functions = require('firebase-functions')
const next = require('next')
const axios = require('axios')

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

/**
 * Get SoundCloud Streaming Url by Media ID
 */

const getItById = async (trackId) => {
    const clientId = 'wNHGoG6RrCXPaRsA49blO9sZxs98xaQ6'

    const response = await axios.get(`https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${clientId}`)
    const transcoding = response.data.media.transcodings.filter((t) => t.format.protocol === 'progressive')
    if (!transcoding) return res.json({ url: null })
    const coverUrl = response.data.artwork_url || response.data.user.avatar_url
    const streamResponse = await axios.get(`${transcoding[0].url}?client_id=${clientId}`)
    return { url: streamResponse.data.url, id: trackId, coverUrl: coverUrl }
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
