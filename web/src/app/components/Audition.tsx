import React, { useContext, useState } from 'react'
import ReactPlayer from 'react-player'
import { Media, MediaService } from '../../../../shared/Media'
import { AppContext } from '../store'

const Audition = () => {
    const [nextTimer, setNextTimer] = useState<NodeJS.Timeout | null>(null)
    const { store, dispatch } = useContext(AppContext)
    const queue = store.playQueue
    const AUDITION_DURATION = 3000
    const onReady = () => {
        console.log('準備万端でござる')
        setNextTimer(
            setTimeout(() => {
                dispatch({ type: 'trackNext' })
            }, AUDITION_DURATION)
        )
    }
    let src, player

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
