import Link from 'next/link'
import { NextPage } from 'next'
import { Media, MediaService } from '../../shared/Media'
import React, { useEffect } from 'react'
const Soundcloud = require('soundcloud-v2-api')

import '../styles/style.scss'

interface Props {
    id: string
    type: MediaService
}

export const Audition = ({ id, type }: Props) => {
    Soundcloud.init({
        clientId: process.env.SOUNDCLOUD_CLIENT_ID,
        cors: true,
    })

    let src, el
    useEffect(() => {
        setTimeout(() => {
            //@ts-ignore
            // response = await fetch(`https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${clientId}`);
            //@ts-ignore

            Soundcloud.get(`/tracks/${id}`).then(metadata => {
                const url = metadata.media.transcodings[0].url
                console.log(url)

                Soundcloud.stream(url, {}).then((stream: any) => {
                    stream.play()
                })
            })
        })
    })
    switch (type) {
        case MediaService.SoundCloud:
            src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
            el = <iframe id="player" width="100%" height="300" scrolling="no" allow="autoplay" src={src}></iframe>
            break
        case MediaService.YouTube:
            src = `https://www.youtube-nocookie.com/embed/${id}?controls=0`
            el = (
                <iframe
                    id="player"
                    width="560"
                    height="315"
                    src={src}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
            )
        default:
            el = <div></div>
    }
    return (
        <div className="Player">
            {el}
            <style jsx>{`
                .Player {
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    height: 300px;
                }
            `}</style>
        </div>
    )
}
