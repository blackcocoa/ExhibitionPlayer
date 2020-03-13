import React, { useContext, useState, FC } from 'react'
import ReactPlayer from 'react-player'
import { Media, MediaService } from '../../../../shared/Media'
import { AppContext } from '../store'

type Props = {}

const Audition: FC<Props> = () => {
    const [nextTimer, setNextTimer] = useState<number | null>(null)
    const { store, dispatch } = useContext(AppContext)
    const queue = store.playQueue
    const AUDITION_DURATION = 5000

    const onReady = () => {
        setNextTimer(
            window.setTimeout(() => {
                dispatch({ type: 'queueNext' })
            }, AUDITION_DURATION)
        )
    }

    const onError = (error: string) => {
        console.error(`Error: ${error}`)
        dispatch({ type: 'queueNext' })
    }
    let src: string, player

    if (queue.length) {
        switch (queue[0].type) {
            case MediaService.SoundCloud:
                src = queue[0].id
                break
            case MediaService.YouTube:
                src = `https://www.youtube.com/watch?v=${queue[0].id}`
                break
            default:
                return <div></div>
        }
        player = (
            <ReactPlayer
                id="player"
                url={src}
                controls={true}
                width="100%"
                height={180}
                onReady={() => onReady()}
                onError={() => onError(src)}
                playing
            />
        )
    } else {
        player = <div id="player"></div>
    }

    return (
        <div className="Player">
            {player}
            <style jsx>{`
                .Player {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    height: 180px;
                }
            `}</style>
        </div>
    )
}

export default Audition