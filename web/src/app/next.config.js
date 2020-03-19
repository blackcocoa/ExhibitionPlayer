const withSass = require('@zeit/next-sass')

module.exports = withSass({
    cssModules: true,
    distDir: '../../dist/functions/next',
    env: {
        FIREBASE_PROJECT_ID: 'soundscraper-d0273',
        FIREBASE_APP_ID: '1:749064670057:web:de74f3411864b9695f4bf8',
        FIREBASE_API_KEY: 'AIzaSyDav5vffiV6v9JovbeBp7LOpPbNggkJvv0',
        SOUNDCLOUD_CLIENT_ID: 'bzhrcLdRzbS6QiVRq8EvMSoMM6p1KhL5',
        DEFAULT_AUDITION_DURATION: 5,
        CIRCLE_FETCH_LIMIT: 5,
    },
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.ts$/,
            use: [
                options.defaultLoaders.babel,
                {
                    loader: 'ts-loader',
                },
            ],
        })

        return config
    },
})
