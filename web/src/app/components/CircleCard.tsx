import { Circle } from '../../../../shared/Circle'
import { FC } from 'react'
import TwitterIcon from '@material-ui/icons/Twitter'

type Props = {
    circle: Circle
    index: number
    active: boolean
    onClickQueue: Function
}

export const CircleCard: FC<Props> = props => {
    const circle = props.circle

    return (
        <li className={props.active ? 'active' : ''}>
            <h3>{circle.name}</h3>
            <div>
                <p>{circle.description}</p>
                {circle.twitterId && (
                    <i className="twitter">
                        <TwitterIcon>
                            <a href={`https://twitter.com/${circle.twitterId}`} target="_blank">
                                Twitter
                            </a>
                        </TwitterIcon>
                    </i>
                )}
                {circle.media && <button onClick={() => props.onClickQueue(props.index)}>ここから再生</button>}
            </div>
            <style jsx>{`
                li {
                    box-sizing: border-box;
                    border: 1px solid #666;
                    border-radius: 2px;
                    margin-bottom: 20px;
                    padding: 20px;
                    position: relative;
                    text-align: left;
                }
                h3 {
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                p {
                    word-break: break-all;
                }
                .active {
                    animation: activeman 3.6s linear infinite;
                }
                .twitter {
                    font-size: 28px;
                    position: absolute;
                    bottom: 10px;
                    right: 20px;
                }
                @media screen and (max-width: 640px) {
                    li {
                        flex-basis: 100%;
                    }
                }
                @keyframes activeman {
                    0% {
                        background-color: rgba(255, 255, 255, 0);
                    }
                    42% {
                        background-color: rgba(255, 255, 255, 0.08);
                    }
                    50% {
                        background-color: rgba(255, 255, 255, 0.2);
                    }
                    58% {
                        background-color: rgba(255, 255, 255, 0.08);
                    }
                    100% {
                        background-color: rgba(255, 255, 255, 0);
                    }
                }
            `}</style>
        </li>
    )
}
