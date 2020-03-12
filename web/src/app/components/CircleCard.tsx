import { Circle } from '../../../../shared/Circle'
import { FC } from 'react'

type Props = {
    circle: Circle
    onClickSetMedia: Function
    onClickQueueMedia: Function
}

export const CircleCard: FC<Props> = props => {
    const circle = props.circle
    const media = circle.media || undefined
    const twitter = circle.twitterId ? (
        <a href={`https://twitter.com/${circle.twitterId}`} target="_blank">
            Twitter
        </a>
    ) : null

    return (
        <li>
            <h3>{circle.name}</h3>
            <div>
                <p>
                    {circle.description}
                    <br />
                    {twitter}
                </p>
                {media ? <button onClick={() => props.onClickSetMedia(media)}>SET</button> : <div></div>}
                {media ? <button onClick={() => props.onClickQueueMedia(media)}>QUUE</button> : <div></div>}
            </div>
            <style jsx>{`
                li {
                    box-sizing: border-box;
                    border: 1px solid #666;
                    border-radius: 2px;
                    margin-bottom: 20px;
                    flex: 0 1 31%;
                    padding: 20px;
                    text-align: left;
                }
                h3 {
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                p {
                    word-break: break-all;
                }
                @media screen and (max-width: 640px) {
                    li {
                        flex-basis: 100%;
                    }
                }
            `}</style>
        </li>
    )
}
