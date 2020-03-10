import Link from 'next/link'
import { NextPage } from 'next'
import { Media, MediaService } from '../../../../shared/Media'
import React, { useEffect, useState } from 'react'
import YouTube, { Options, PlayerVars } from 'react-youtube'
const Soundcloud = require('soundcloud-v2-api')

interface Props {
    id: string
    type: MediaService
}

function onLoadSoundCloud() {
    try {
        //@ts-ignore
        window.SC.Widget('player').play()
        console.log('SoundCloud Autoplay started')
    } catch (error) {
        console.error('SoundCloud is funny')
    }
}

export const Audition = ({ id, type }: Props) => {
    Soundcloud.init({
        clientId: process.env.SOUNDCLOUD_CLIENT_ID,
        cors: true,
    })

    // useEffect(() => {
    //     if (type === MediaService.SoundCloud) {
    //         const player = document.getElementById('player')
    //         if (player) {
    //             player.addEventListener('load', onLoadSoundCloud)
    //         }
    //     }
    //     return () => {
    //         const player = document.getElementById('player')
    //         if (player) player.removeEventListener('load', onLoadSoundCloud)
    //     }
    // })

    const onReady = () => {
        console.log('準備万端でござる')
    }
    let src, el

    switch (type) {
        case MediaService.SoundCloud:
            src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true`
            el = <iframe id="player" width="100%" height="180" scrolling="no" allow="autoplay" src={src}></iframe>
            break
        case MediaService.YouTube:
            src = `https://www.youtube-nocookie.com/embed/${id}?controls=1`
            let options: Options = {
                height: '180',
                width: '100%',
                playerVars: {
                    autoplay: 1,
                },
            }
            el = <YouTube videoId={id} opts={options} onReady={onReady} />
            break
        default:
            el = <div></div>
    }
    return (
        <div className="Player">
            {el}
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
