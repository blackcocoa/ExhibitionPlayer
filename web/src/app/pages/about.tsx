import * as React from 'react'
import App from '../components/App'
import { NextPage } from 'next'

interface Props {}

const About: NextPage<Props> = () => {
    return (
        <App>
            <p>About Page</p>
        </App>
    )
}

export default About
