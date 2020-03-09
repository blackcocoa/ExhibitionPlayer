import App from 'next/app'
import React, { useContext, useReducer, useEffect } from 'react'
import { Audition } from '../components/Audition'
import { Context, reducer, initialState } from '../store'
import '../../styles/style.scss'

interface Props {
    Component: any
    pageProps: any
}

function MyApp({ Component, pageProps }: Props) {
    const [store, dispatch] = useReducer(reducer, initialState)
    useEffect(() => {
        const scriptId = 'script-soundcloud-sdk'
        if (document.getElementById(scriptId)) return
        const script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://w.soundcloud.com/player/api.js'
        script.async = true
        document.body.appendChild(script)
    })
    return (
        <Context.Provider value={{ store, dispatch }}>
            <Component {...pageProps} />
            <Audition id={store.id} type={store.type} />
        </Context.Provider>
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
