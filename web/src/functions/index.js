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

exports.next = functions.region('asia-northeast1').https.onRequest((req, res) => {
    console.log('File: ' + req.originalUrl) // log the page.js file that is being requested
    return app.prepare().then(() => handle(req, res))
})

exports.getStreamUrl = functions.region('asia-northeast1').https.onCall(async (data, context) => {
    const clientId = 'bzhrcLdRzbS6QiVRq8EvMSoMM6p1KhL5'
    const response = await axios.get(`https://api-v2.soundcloud.com/tracks/${data.trackId}?client_id=${clientId}`)
    const transcoding = response.data.media.transcodings.filter(t => t.format.protocol === 'progressive')
    if (!transcoding) return res.json({ url: null })
    const streamResponse = await axios.get(`${transcoding[0].url}?client_id=${clientId}`)

    return { url: streamResponse.data.url }
})
