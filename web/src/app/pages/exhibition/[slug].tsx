import * as React from 'react'
import { NextPage, GetServerSideProps, GetStaticProps, GetStaticPaths } from 'next'
import { useState, useCallback, useContext, useEffect } from 'react'
import { Database } from '../../db/index'
import { CircleResource } from '../../db/circles'
import { ExhibitionResource } from '../../db/exhibitions'
import { Exhibition } from '../../../../../shared/Exhibition'
import { Circle } from '../../../../../shared/Circle'
import { reducer, initialState, AppContext } from '../../store'
import { Media, MediaService } from '../../../../../shared/Media'
import App from '../../components/App'
import { getStreamUrl } from '../../db/stream'
import { CircleCard } from '../../components/CircleCard'
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core'

interface Props {
    id: string
    name: string
    slug: string
}

const db = new Database()
const circleResource = new CircleResource(db.getInstance())

const ExhibitionPage: NextPage<Props> = ({ id, name, slug }) => {
    const [circles, setCircles] = useState<Circle[]>([])
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [area, setArea] = useState<string>('')
    const [orderBy, setOrderBy] = useState<string>('booth.number')
    const [order, setOrder] = useState<'desc' | 'asc'>('asc')
    const { state, dispatch } = useContext(AppContext)

    const exhibition = new Exhibition(id, name, slug)
    circleResource.setExhibition(exhibition)

    useEffect(() => {
        if (isPlaying && !isFetching && state.playQueue.length <= 2) getNextCircle()
    }, [isPlaying, isFetching, state])

    const getNextCircle = async () => {
        const nextCircles = await circleResource.next()
        if (!nextCircles.length) {
            console.log('End')
            return
        }
        if (isPlaying) {
            setIsFetching(true)
            for (let c of nextCircles) {
                try {
                    if (c.media) await queueMedia(c.media)
                } catch (error) {
                    console.error('API error inresolving stream URL')
                }
            }
            setIsFetching(false)
        }
        setCircles(circles.concat(nextCircles))
    }

    async function queueMedia(media: Media) {
        switch (media.type) {
            case MediaService.YouTube:
                dispatch({ type: 'mediaPush', payload: media })
                break
            case MediaService.SoundCloud:
                if (media.id) {
                    await getStreamUrl(media.id).then((result) =>
                        dispatch({
                            type: 'mediaPush',
                            payload: { id: result.data.id, url: result.data.url, type: MediaService.SoundCloud },
                        })
                    )
                }
                break
            default:
                break
        }
    }

    const onChangeArea = useCallback((event) => {
        setArea(event.target.value)
    }, [])
    const onChangeOrderBy = useCallback((event) => {
        setOrderBy(event.target.value)
    }, [])
    const onChangeOrder = useCallback((event) => {
        setOrder(event.target.value)
    }, [])

    const onClickQueue = useCallback(
        async (index: number) => {
            setIsPlaying(true)
            dispatch({ type: 'queueClear' })
            setIsFetching(true)
            for (let circle of circles.slice(index)) {
                try {
                    if (circle.media) await queueMedia(circle.media)
                } catch (error) {
                    console.error('API error inresolving stream URL')
                }
            }
            setIsFetching(false)
        },
        [circles, isFetching]
    )

    const onClickFetch = useCallback(async () => {
        circleResource.clearFilter()
        if (area) {
            circleResource.addFilter('booth.area', '==', area)
        } else {
            circleResource.orderBy('booth.area', 'asc')
        }
        circleResource.orderBy(orderBy, order)

        const c = await circleResource.fetch()
        if (!c.length) {
            console.log('End')
            return
        }
        setCircles(c)
    }, [area, order, orderBy])

    const onClickNext = useCallback(getNextCircle, [circles])

    return (
        <App>
            <h1>{exhibition.name}</h1>

            <FormControl component="fieldset">
                <FormLabel component="legend">展示場</FormLabel>
                <RadioGroup aria-label="area" name="area" value={area} onChange={onChangeArea}>
                    <FormControlLabel value="" control={<Radio />} label="すべて" />
                    <FormControlLabel value="第一展示場" control={<Radio />} label="第一展示場" />
                    <FormControlLabel value="第二展示場" control={<Radio />} label="第二展示場" />
                </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
                <FormLabel component="legend">並び順</FormLabel>
                <RadioGroup aria-label="area" name="orderBy" value={orderBy} onChange={onChangeOrderBy}>
                    <FormControlLabel value="booth.number" control={<Radio />} label="ブース番号" />
                    <FormControlLabel value="name" control={<Radio />} label="サークル名" />
                </RadioGroup>
                {/* <RadioGroup aria-label="area" name="order" value={order} onChange={onChangeOrder}>
                    <FormControlLabel value="asc" control={<Radio />} label="昇順" />
                    <FormControlLabel value="desc" control={<Radio />} label="降順" />
                </RadioGroup> */}
            </FormControl>

            <button onClick={() => onClickFetch()}>サークルとる</button>

            <h2>サークル一覧</h2>
            <ul className="Circles">
                {circles.map((circle, index) => {
                    return (
                        <CircleCard
                            circle={circle}
                            onClickQueue={onClickQueue}
                            active={circle.media && state.playQueue.length && state.playQueue[0].id === circle.media.id}
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
    const paths = exhibitions.map((exhibition) => ({
        params: {
            slug: exhibition.slug,
        },
    }))
    return { paths: paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (context) => {
    const slug = context?.params?.slug as string
    if (!slug) throw new Error('error fetching exhibition data for the page')

    const exhibition = await new ExhibitionResource(db.getInstance()).findBySlug(slug)
    return { props: { id: exhibition.id, name: exhibition.name, slug: exhibition.slug } }
}

export default ExhibitionPage
