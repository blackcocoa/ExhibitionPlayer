import * as React from 'react'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { useState, useCallback, useContext, useEffect } from 'react'
import { FormControl, FormLabel, Checkbox, RadioGroup, FormControlLabel, Radio, Button } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import { Favorite } from '@material-ui/icons'
import { Database } from '../../db/index'
import { CircleResource } from '../../db/circles'
import { ExhibitionResource } from '../../db/exhibitions'
import { Exhibition } from '../../shared/Exhibition'
import { Circle } from '../../shared/Circle'
import { AppContext } from '../../store'
import App from '../../components/App'
import { CircleCard } from '../../components/CircleCard'
import FavView from '../../components/FavView'

interface Props {
    id: string
    name: string
    slug: string
}

const db = new Database()
const circleResource = new CircleResource(db.getInstance())

const ExhibitionPage: NextPage<Props> = ({ id, name, slug }) => {
    const [init, setInit] = useState<boolean>(false)
    const [circles, setCircles] = useState<Circle[]>([])
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [area, setArea] = useState<string>('リアル会場（第一＆第二展示場）')
    const [orderBy, setOrderBy] = useState<string>('booth.number')
    const [order, setOrder] = useState<'desc' | 'asc'>('asc')
    const [exhibition, setExhibition] = useState<Exhibition>(new Exhibition(id, name, slug))
    const { state, dispatch } = useContext(AppContext)

    circleResource.setExhibition(exhibition)

    useEffect(() => {
        dispatch({ type: 'exhibitionSet', payload: exhibition })
    }, [])

    useEffect(() => {
        if (!init) {
            setInit(true)
            dispatch({ type: 'queueClear' })
            onClickFetch()
        }
        if (isPlaying && !isFetching && state.playQueue.length <= 2) getNextCircle()
    }, [init, isPlaying, isFetching, state])

    useEffect(() => {
        const f = async () => {
            let str = localStorage.getItem('favCircles')
            if (str) {
                let circles: Circle[] = []
                for (let id of str.split(',')) {
                    let [exhibitionId, circleId] = id.split(':')
                    if (exhibitionId !== exhibition.id) continue
                    try {
                        const circle = await circleResource.fetchById(circleId, exhibitionId)
                        if (circle) circles.push(circle)
                    } catch (error) {
                        console.log(`${circleId} not found`)
                    }
                }
                dispatch({ type: 'favLoad', payload: circles })
            }
        }
        f()
    }, [])

    const getNextCircle = async () => {
        setIsFetching(true)
        const limit = parseInt(process.env.CIRCLE_DISPLAY_LIMIT!)
        const nextCircles = await circleResource.next()
        if (!nextCircles.length) {
            console.log('End')
            dispatch({ type: 'loadingEnd' })
            return
        }
        if (isPlaying) {
            for (let c of nextCircles) {
                if (!c.media) continue
                if (c.media) dispatch({ type: 'mediaPush', payload: c.media })
            }
        }
        const length = circles.length + nextCircles.length
        if (length > limit) {
            setCircles(circles.concat(nextCircles).slice(length - limit, length))
        } else {
            setCircles(circles.concat(nextCircles))
        }
        setIsFetching(false)
    }

    const onChangeArea = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setArea(event.target.value)
    }, [])

    const onChangeOrderBy = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setOrderBy(event.target.value)
    }, [])

    const onClickQueue = useCallback(
        async (index: number) => {
            dispatch({ type: 'loading' })
            setIsPlaying(true)
            dispatch({ type: 'queueClear' })
            setIsFetching(true)
            setCircles(await circleResource.fetchStreamUrls(circles))
            for (let circle of circles.slice(index)) {
                if (!circle.media) continue
                dispatch({ type: 'mediaPush', payload: circle.media })
            }
            setIsFetching(false)
            dispatch({ type: 'loadingEnd' })
        },
        [circles, isFetching]
    )

    const onClickFetch = useCallback(async () => {
        dispatch({ type: 'loading' })
        circleResource.clearFilter()
        if (area) {
            if (area === 'リアル会場（第一＆第二展示場）') {
                circleResource.addFilter('booth.area', '!=', 'Web会場')
                circleResource.orderBy('booth.area', 'asc')
            } else {
                circleResource.addFilter('booth.area', '==', area)
            }
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
        dispatch({ type: 'loadingEnd' })
    }, [area, order, orderBy])

    const onClickNext = useCallback(() => {
        dispatch({ type: 'loading' })
        getNextCircle()
        dispatch({ type: 'loadingEnd' })
    }, [circles])

    const handleClickFav = useCallback(() => {
        dispatch({ type: 'favOpen' })
    }, [])

    return (
        <App>
            <h1>{exhibition.name} サークルリスト</h1>

            <div className="search">
                <FormControl component="fieldset">
                    <FormLabel component="legend">展示場</FormLabel>
                    <RadioGroup aria-label="area" name="area" value={area} onChange={onChangeArea}>
                        <FormControlLabel
                            value="リアル会場（第一＆第二展示場）"
                            control={<Radio />}
                            label="リアル会場（第一＆第二展示場）"
                        />
                        <FormControlLabel value="第一展示場" control={<Radio />} label="第一展示場" />
                        <FormControlLabel value="第二展示場" control={<Radio />} label="第二展示場" />
                        {/* <FormControlLabel value="Web会場" control={<Radio />} label="Web会場" /> */}
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

                <div className="search-buttons">
                    <Button variant="contained" color="primary" disableElevation onClick={() => onClickFetch()}>
                        検索
                    </Button>
                </div>
            </div>

            <h2>サークル一覧</h2>
            <ul className="circles">
                {circles.map((circle, index) => {
                    return (
                        <CircleCard
                            circle={circle}
                            onClickQueue={onClickQueue}
                            active={
                                !!circle.media && !!state.playQueue.length && state.playQueue[0].id === circle.media.id
                            }
                            index={index}
                            key={index}
                        />
                    )
                })}
            </ul>

            <Button variant="outlined" disableElevation onClick={() => onClickNext()}>
                もっと見る
            </Button>

            <IconButton
                style={{
                    position: 'fixed',
                    bottom: state.playQueue.length ? '250px' : '20px',
                    right: '20px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 10px rgba(0,0,0,0.15)',
                    border: '1px solid #eee',
                }}
                color="secondary"
                aria-label="Favorites"
                onClick={() => handleClickFav()}
            >
                <Favorite />
            </IconButton>

            <FavView />

            <style jsx>{`
                h1 {
                    border-bottom: 1px solid white;
                    font-size: 2.2rem;
                    font-weight: 400;
                    padding-top: 40px;
                    padding-left: 8px;
                    margin-bottom: 40px;
                    text-align: left;
                }
                fieldset {
                    margin-left: 20px;
                }
                h2 {
                    margin-bottom: 30px;
                    text-align: left;
                }
                .circles {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .search {
                    background-color: #f3f3f3;
                    border: 1px solid #eaeaea;
                    padding: 30px 40px;
                    margin: 0 auto 40px;
                    text-align: left;
                    max-width: 560px;
                }
                .search-options {
                    margin-top: 20px;
                }
                .search-buttons {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
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
