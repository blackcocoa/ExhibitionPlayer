import React, { useReducer, useEffect, Dispatch } from 'react'
import Head from 'next/head'
import Audition from '../components/Audition'
import { reducer } from '../store'
import { CssBaseline, CircularProgress } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import '../styles/style.scss'
import { AppConfig } from '../interfaces/AppConfig'
import { IContextProps, AppContext, initialState } from '../store'

interface Props {
    Component: any
    pageProps: any
}

export const theme = createMuiTheme({
    palette: {
        type: 'light',
    },
})

function MyApp({ Component, pageProps }: Props) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const value: IContextProps = { state, dispatch }

    useEffect(() => {
        let payload: AppConfig = {}
        let auditionDuration = localStorage.getItem('auditionDuration')
        if (auditionDuration) {
            payload.auditionDuration = parseInt(auditionDuration)
        }
        let isExcludeUnrelated = localStorage.getItem('isExcludeUnrelated')
        if (isExcludeUnrelated !== null) {
            payload.isExcludeUnrelated = !!isExcludeUnrelated
        }
        dispatch({ type: 'configLoad', payload: payload })
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <AppContext.Provider value={value}>
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
                {state.isLoading ? (
                    <>
                        <div className="loadmask">
                            <CircularProgress color="secondary" />
                        </div>
                        <style jsx>{`
                            .loadmask {
                                position: fixed;
                                background-color: rgba(0, 0, 0, 0.5);
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                top: 0;
                                left: 0;
                                width: 100vw;
                                height: 100vh;
                                z-index: 3000;
                            }
                        `}</style>
                    </>
                ) : (
                    <></>
                )}
            </AppContext.Provider>
        </ThemeProvider>
    )
}

export default MyApp
