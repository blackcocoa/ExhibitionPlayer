import React, { useReducer } from 'react'
import Audition from '../components/Audition'
import { AppContext, reducer, initialState } from '../store'
import '../styles/style.scss'

interface Props {
    Component: any
    pageProps: any
}

function MyApp({ Component, pageProps }: Props) {
    const [store, dispatch] = useReducer(reducer, initialState)

    return (
        <AppContext.Provider value={{ store, dispatch }}>
            <Component {...pageProps} />
            <Audition />
        </AppContext.Provider>
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
