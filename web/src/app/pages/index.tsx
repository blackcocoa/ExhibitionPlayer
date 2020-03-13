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
import { CircleCard } from '../components/CircleCard'

interface Props {
    exhibitions: Exhibition[]
}

const db = new Database()

const Index: NextPage<Props> = ({ exhibitions }) => {
    const [circles, setCircles] = useState<Circle[]>([])
    const { store, dispatch } = useContext(AppContext)

    const fetchCircles = async (exhibition: Exhibition) => {
        const circleResource = new CircleResource(db.getInstance(), exhibition)
        const c = await circleResource.fetch()
        setCircles(c)
    }
    const onClickCircle = (exhibition: Exhibition) => (event: any) => {
        fetchCircles(exhibition)
    }

    async function queueMedia(media: Media) {
        switch (media.type) {
            case MediaService.YouTube:
                dispatch({ type: 'mediaPush', payload: media })
                break
            case MediaService.SoundCloud:
                if (media.id)
                    await getStreamUrl(media.id).then(result =>
                        dispatch({
                            type: 'mediaPush',
                            payload: { id: result.data.id, url: result.data.url, type: MediaService.SoundCloud },
                        })
                    )
                break
            default:
                break
        }
    }

    const onClickQueue = useCallback(
        async (index: number) => {
            dispatch({ type: 'queueClear' })
            for (let circle of circles.slice(index)) {
                try {
                    if (circle.media) await queueMedia(circle.media)
                } catch (error) {
                    console.error('API error inresolving stream URL')
                }
            }
        },
        [circles]
    )

    return (
        <App>
            <h2>イベントを選択</h2>
            <ul>
                {exhibitions.map((exhibition, index) => {
                    return (
                        <li key={index}>
                            <button onClick={onClickCircle(exhibition)}>{exhibition.name}</button>
                        </li>
                    )
                })}
            </ul>

            <h2>サークル一覧</h2>
            <ul className="Circles">
                {circles.map((circle, index) => {
                    return (
                        <CircleCard
                            circle={circle}
                            onClickQueue={onClickQueue}
                            active={circle.media && store.playQueue.length && store.playQueue[0].id === circle.media.id}
                            index={index}
                            key={index}
                        />
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
