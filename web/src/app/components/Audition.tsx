import React, { useContext, useState, FC } from 'react'
import ReactPlayer from 'react-player'
import { Media, MediaService } from '../../../../shared/Media'
import { reducer, initialState, AppContext } from '../store'

type Props = {}

const Audition: FC<Props> = () => {
    const [nextTimer, setNextTimer] = useState<number | null>(null)
    const { state, dispatch } = useContext(AppContext)
    const queue = state.playQueue

    const onReady = () => {
        setNextTimer(
            window.setTimeout(() => {
                dispatch({ type: 'queueNext' })
            }, state.auditionDuration * 1000)
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
                src = queue[0].url
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
                    top: 48px;
                    width: 100%;
                    height: 180px;
                }
            `}</style>
        </div>
    )
}

export default Audition
