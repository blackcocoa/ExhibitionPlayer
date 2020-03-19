import * as React from 'react'
import { NextPage, GetServerSideProps, GetStaticProps, GetStaticPaths } from 'next'
import { useState, useCallback, useContext, useEffect } from 'react'
import { Database } from '../../db/index'
import { CircleResource } from '../../db/circles'
import { ExhibitionResource } from '../../db/exhibitions'
import { Exhibition } from '../../../../../shared/Exhibition'
import { Circle } from '../../../../../shared/Circle'
import { AppContext } from '../../store'
import { Media, MediaService } from '../../../../../shared/Media'
import App from '../../components/App'
import { getStreamUrl } from '../../db/stream'
import { CircleCard } from '../../components/CircleCard'

interface Props {
    id: string
    name: string
    slug: string
}

const db = new Database()

const ExhibitionPage: NextPage<Props> = ({ id, name, slug }) => {
    const exhibition = new Exhibition(id, name, slug)
    const [circles, setCircles] = useState<Circle[]>([])
    const [page, setPage] = useState<number>(0)
    const { store, dispatch } = useContext(AppContext)

    const fetchCircles = async () => {
        const circleResource = new CircleResource(db.getInstance(), exhibition)
        const c = await circleResource.next()
        if (!c) {
            console.log('End')
            return
        }
        setCircles(c)
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

    const onClickNext = useCallback(async () => {
        await fetchCircles()
        setPage(page + 1)
    }, [page])

    return (
        <App>
            <h1>{exhibition.name}</h1>
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
            <button onClick={() => onClickNext()}>Next</button>

            <style jsx>{`
                h2 {
                    margin-bottom: 20px;
                }
                .Circles {
                    margin-bottom: 20px;
                }
            `}</style>
        </App>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const exhibitions = await new ExhibitionResource(db.getInstance()).fetch()
    const paths = exhibitions.map(exhibition => ({
        params: {
            slug: exhibition.slug,
        },
    }))
    return { paths: paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async context => {
    const slug = context?.params?.slug as string
    if (!slug) throw new Error('error fetching exhibition data for the page')

    const exhibition = await new ExhibitionResource(db.getInstance()).findBySlug(slug)
    return { props: { id: exhibition.id, name: exhibition.name, slug: exhibition.slug } }
}

export default ExhibitionPage
