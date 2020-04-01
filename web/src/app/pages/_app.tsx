import React, { useReducer, useEffect } from 'react'
import Head from 'next/head'
import Audition from '../components/Audition'
import { AppContext, reducer, initialState } from '../store'
import { CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import '../styles/style.scss'

interface Props {
    Component: any
    pageProps: any
}

const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
})

function MyApp({ Component, pageProps }: Props) {
    const [store, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        console.log('init!')
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <AppContext.Provider value={{ store, dispatch }}>
                <CssBaseline />

                <Head>
                    <title>同人音楽小まとめ</title>
                    <meta name="viewport" content="width=480" key="viewport" />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                        key="roboto"
                    />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" key="icon" />
                </Head>
                <Component {...pageProps} />
                <Audition />
            </AppContext.Provider>
        </ThemeProvider>
    )
}

export default MyApp
