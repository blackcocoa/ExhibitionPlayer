import * as React from 'react'
import { NextPage } from 'next'
import { useState, useCallback, useContext } from 'react'
import { Database } from '../db/index'
import { CircleResource } from '../db/circles'
import { Exhibition } from '../../../../shared/Exhibition'
import { Circle } from '../../../../shared/Circle'
import { ExhibitionResource } from '../db/exhibitions'
import { AppContext } from '../store'
import { Media, MediaService } from '../../../../shared/Media'
import App from '../components/App'
import { getStreamUrl } from '../db/stream'

interface Props {
    exhibitions: Exhibition[]
}

const db = new Database()

const Index: NextPage<Props> = ({ exhibitions }) => {
    const [circles, setCircles] = useState<Circle[]>([])
    const { store, dispatch } = useContext(AppContext)

    const fetchCircles = async (exhibition: Exhibition) => {
        const circleResource = new CircleResource(db.getInstance(), exhibition)
        const circles = await circleResource.fetch()
        setCircles(circles)
    }
    const handleClick = (exhibition: Exhibition) => (event: any) => {
        fetchCircles(exhibition)
    }

    const onClickSetMedia = useCallback((media: Media) => {
        switch (media.type) {
            case MediaService.YouTube:
                dispatch({ type: 'mediaSet', payload: media })
                break
            case MediaService.SoundCloud:
                if (media.id)
                    getStreamUrl(media.id).then(result =>
                        dispatch({
                            type: 'mediaSet',
                            payload: { id: result.data.url, type: MediaService.SoundCloud },
                        })
                    )
                break
            default:
                break
        }
    }, [])

    const onClickQueueMedia = useCallback((media: Media) => {
        switch (media.type) {
            case MediaService.YouTube:
                dispatch({ type: 'mediaPush', payload: media })
                break
            case MediaService.SoundCloud:
                if (media.id)
                    getStreamUrl(media.id).then(result =>
                        dispatch({
                            type: 'mediaPush',
                            payload: { id: result.data.url, type: MediaService.SoundCloud },
                        })
                    )
                break
            default:
                break
        }
    }, [])

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

                    return (
                        <li className="Circles-item" key={index}>
                            <h3>{circle.name}</h3>
                            <div>
                                <p>
                                    {circle.description}
                                    <br />
                                    {twitter}
                                </p>
                                {media ? <button onClick={() => onClickSetMedia(media)}>SET</button> : <div></div>}
                                {media ? <button onClick={() => onClickQueueMedia(media)}>QUUE</button> : <div></div>}
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

    // Initialize Cloud Functions through Firebase
    return { exhibitions: exhibitions }
}

export default Index
