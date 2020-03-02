import Link from 'next/link'
import { NextPage } from 'next'
import React, { useState, useCallback, useContext } from 'react'
import { Database } from '../db/index'
import { CircleResource } from '../db/circles'
import { Exhibition } from '../../shared/Exhibition'
import { Circle } from '../../shared/Circle'
import { ExhibitionResource } from '../db/exhibitions'
import { GlobalHeader } from '../components/GlobalHeader'
import { Audition } from '../components/Audition'
import { Context } from '../store'
import '../styles/style.scss'

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
        <div>
            <GlobalHeader />
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
                                    <a href={`https://twitter.com/${circle.twitterId}`} target="_blank">
                                        Twitter
                                    </a>
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
                    flex: 0 1 30%;
                    padding: 20px;
                    text-align: left;
                }
                .Circles h3 {
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .Circles p {
                }
            `}</style>
        </div>
    )
}

Index.getInitialProps = async ({ req }) => {
    const exhibitionResource = new ExhibitionResource(db.getInstance())
    const exhibitions = await exhibitionResource.fetch()
    return { exhibitions: exhibitions }
}

export default Index
