module.exports = {
    cssModules: true,
    // distDir: '../../dist/functions/next',
    env: {
        FIREBASE_PROJECT_ID: 'soundscraper-d0273',
        FIREBASE_APP_ID: '1:749064670057:web:de74f3411864b9695f4bf8',
        SOUNDCLOUD_CLIENT_ID: '0B4jtZF6rFh5TG0eiQ1nuJfbsGk9FZFg',
        DEFAULT_AUDITION_DURATION: 20,
        CIRCLE_DISPLAY_LIMIT: 198,
        CIRCLE_FETCH_LIMIT: 12,
    },
    i18n: {
        locales: ['en', 'ja'],
        defaultLocale: 'ja',
    },
    future: {
        webpack5: true,
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
}
