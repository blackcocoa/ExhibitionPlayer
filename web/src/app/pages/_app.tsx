import React, { useReducer } from 'react'
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

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp
