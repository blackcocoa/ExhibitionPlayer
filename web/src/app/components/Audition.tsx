import React, { useContext, useState, FC } from 'react'
import ReactPlayer from 'react-player'
import { PlayArrow, Stop, FastForward, Info } from '@material-ui/icons'
import { Media, MediaService } from '../../../../shared/Media'
import { reducer, initialState, AppContext } from '../store'
import * as Scroll from 'react-scroll'

type Props = {}

const Audition: FC<Props> = () => {
    const [nextTimer, setNextTimer] = useState<number | undefined>(undefined)
    const [isPlaying, setIsPlaying] = useState<boolean>(true)
    const [progress, setProgress] = useState<number>(0)
    const [playerRef, setPlayerRef] = useState<any>(null)
    const { state, dispatch } = useContext(AppContext)
    const queue = state.playQueue

    const AnchorLink = Scroll.Link

    const onReady = () => {
        if (isPlaying) {
            clearTimeout(nextTimer)
            setNextTimer(
                window.setTimeout(() => {
                    dispatch({ type: 'queueNext' })
                }, state.auditionDuration * 1000)
            )
        }
    }
    const onProgress = (state: { played: number; loaded: number }) => {
        setProgress(state.played)
    }

    const onClickPlay = () => {
        if (queue.length) {
            if (isPlaying) {
                clearTimeout(nextTimer)
                setIsPlaying(false)
            } else {
                clearTimeout(nextTimer)
                setNextTimer(
                    window.setTimeout(() => {
                        dispatch({ type: 'queueNext' })
                    }, state.auditionDuration * 1000)
                )
                setIsPlaying(true)
            }
        }
    }

    const onClickFwd = () => {
        clearTimeout(nextTimer)
        dispatch({ type: 'queueNext' })
    }

    const onClickProgress = (e: any) => {
        playerRef.seekTo(e.clientX / document.documentElement.clientWidth)
    }

    const onError = (error: string) => {
        console.error(`Error: ${error}`)
        dispatch({ type: 'queueNext' })
    }
    let src: string,
        isSoundOnly: boolean = false,
        title: string = '',
        description: string = '',
        coverUrl: string = '',
        player

    if (!queue.length) return <></>

    switch (queue[0].type) {
        case MediaService.SoundCloud:
            src = queue[0].url
            isSoundOnly = true
            title = queue[0].title || ''
            description = queue[0].description || ''
            coverUrl = queue[0].coverUrl || ''
            break
        case MediaService.YouTube:
            src = queue[0].url
            title = queue[0].title || ''
            description = queue[0].description || ''
            isSoundOnly = false
            break
        default:
            src = ''
            isSoundOnly = true
            break
    }

    return (
        <div className="player" style={{ backgroundImage: `url(${coverUrl})` }}>
            <div className="content">
                {isSoundOnly ? (
                    <dl>
                        <dt>{title}</dt>
                        <br />
                        <dd>{description}</dd>
                    </dl>
                ) : (
                    <></>
                )}
                <ReactPlayer
                    ref={(ref) => setPlayerRef(ref)}
                    url={src}
                    playing={isPlaying}
                    controls={false}
                    progressInterval={1000}
                    width="100%"
                    height={160}
                    onReady={() => onReady()}
                    onProgress={onProgress}
                    onError={() => onError(src)}
                />
            </div>
            <div className="controller">
                <button className="play" onClick={onClickPlay}>
                    {isPlaying && queue.length ? <Stop /> : <PlayArrow />}
                </button>
                <div className="progress" onClick={onClickProgress}>
                    <div className="progress-played" style={{ width: `${100 * progress}%` }}></div>
                </div>
                <button className="fwd" onClick={onClickFwd}>
                    <FastForward />
                </button>
            </div>
            <div className="show-active">
                <AnchorLink to="active" className="active-circle">
                    <Info
                        style={{
                            fontSize: '22px',
                            verticalAlign: '-6px',
                        }}
                    />{' '}
                    {title}
                </AnchorLink>
            </div>
            <style jsx>{`
                dl {
                    height: 160px;
                    padding: 10px 14px;
                    text-align: left;
                }
                dt,
                dd {
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    display: inline-block;
                    padding: 4px 6px;
                }
                dt {
                    font-size: 1.16rem;
                    margin-bottom: 10px;
                }
                .player {
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    height: 230px;
                    background-color: black;
                    background-size: cover;
                }
                .content {
                    height: 160px;
                    overflow: hidden;
                }
                .controller {
                    height: 40px;
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 10px;
                }
                .play,
                .fwd {
                    background-color: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    text-align: center;
                    outline: none;
                    margin-right: 10px;
                    width: 32px;
                    height: 32px;
                }
                .play:hover,
                .fwd:hover {
                    color: #ccc;
                }
                .fwd {
                    margin-right: 0;
                    margin-left: 10px;
                }
                .progress {
                    background-color: #999;
                    height: 8px;
                    flex: 1 1 calc(100% - 80px);
                }
                .progress-played {
                    background-color: white;
                    height: 100%;
                    width: 0%;
                }
                .show-active {
                    background-color: #fafafa;
                    cursor: pointer;
                    font-weight: 700;
                    padding: 4px 20px;
                    text-align: left;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    word-break: break-all;
                    white-space: nowrap;
                }
            `}</style>
        </div>
    )
}

export default Audition
