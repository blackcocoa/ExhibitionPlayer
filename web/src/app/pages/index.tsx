import * as React from 'react'
import App from '../components/App'
import Link from 'next/link'
import { NextPage } from 'next'
import { useState, useCallback, useContext } from 'react'
import { Database } from '../db/index'
import { CircleResource } from '../db/circles'
import { Exhibition } from '../../../../shared/Exhibition'
import { Circle } from '../../../../shared/Circle'
import { ExhibitionResource } from '../db/exhibitions'
import { Context } from '../store'

interface Props {
    exhibitions: Exhibition[]
}

const db = new Database()

const Index: NextPage<Props> = ({ exhibitions }) => {
    const [circles, setCircles] = useState<Circle[]>([])
    const fetchCircles = async (exhibition: Exhibition) => {
        const circleResource = new CircleResource(db.getInstance(), exhibition)
        const circles = await circleResource.fetch()
        setCircles(circles)
    }
    const handleClick = (exhibition: Exhibition) => (event: any) => {
        fetchCircles(exhibition)
    }

    const { store, dispatch } = useContext(Context)

    return (
        <App>
            <h2>イベントを選択</h2>
            <ul>
                {exhibitions.map((exhibition, index) => {
                    return (
                        <li key={index}>
                            <button onClick={handleClick(exhibition)}>{exhibition.name}</button>
                        </li>
                    )
                })}
            </ul>

            <h2>サークル一覧</h2>
            <ul className="Circles">
                {circles.map((circle, index) => {
                    const media = circle.media || undefined
                    const twitter = circle.twitterId ? (
                        <a href={`https://twitter.com/${circle.twitterId}`} target="_blank">
                            Twitter
                        </a>
                    ) : null
                    const audition = media ? (
                        <button onClick={() => dispatch({ type: 'setMedia', value: media })}>SET</button>
                    ) : (
                        <div></div>
                    )

                    return (
                        <li className="Circles-item" key={index}>
                            <h3>{circle.name}</h3>
                            <div>
                                <p>
                                    {circle.description}
                                    <br />
                                    {twitter}
                                </p>
                                {audition}
                            </div>
                        </li>
                    )
                })}
            </ul>
            <style jsx>{`
                h2 {
                    margin-bottom: 20px;
                }
                .Circles {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .Circles-item {
                    box-sizing: border-box;
                    border: 1px solid #666;
                    border-radius: 2px;
                    margin-bottom: 20px;
                    flex: 0 1 31%;
                    padding: 20px;
                    text-align: left;
                }
                .Circles h3 {
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .Circles p {
                    word-break: break-all;
                }
                @media screen and (max-width: 640px) {
                    main {
                        padding-left: 10px;
                        padding-right: 10px;
                    }
                    .Circles-item {
                        flex-basis: 100%;
                    }
                }
            `}</style>
        </App>
    )
}

Index.getInitialProps = async ({ req }) => {
    const exhibitionResource = new ExhibitionResource(db.getInstance())
    const exhibitions = await exhibitionResource.fetch()
    return { exhibitions: exhibitions }
}

export default Index
