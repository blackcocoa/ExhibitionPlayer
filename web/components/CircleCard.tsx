import { Circle } from '../shared/Circle'
import { FC } from 'react'
import TwitterIcon from '@material-ui/icons/Twitter'
import { Button } from '@material-ui/core'

type Props = {
    circle: Circle
    index: number
    active: boolean
    onClickQueue: Function
}

export const CircleCard: FC<Props> = (props) => {
    const circle = props.circle

    return (
        <li className={props.active ? 'active' : ''} id={props.active ? 'active' : ''}>
            <h3>{circle.name}</h3>

            <div>
                <p>{circle.description}</p>
                <i className="booth-number">
                    {circle.booth.area} {circle.booth.number}
                </i>
                {circle.twitterId && (
                    <i className="twitter">
                        <a href={`https://twitter.com/${circle.twitterId}`} target="_blank">
                            <TwitterIcon />
                        </a>
                    </i>
                )}
                <div className="play">
                    {circle.media ? (
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            onClick={() => props.onClickQueue(props.index)}
                        >
                            ここから再生
                        </Button>
                    ) : (
                        <i className="play-empty">視聴音源なし</i>
                    )}
                </div>
            </div>
            <style jsx>{`
                li {
                    background-color: #f3f3f3;
                    border: 1px solid #eaeaea;
                    border-radius: 2px;
                    box-sizing: border-box;
                    flex: 0 1 31%;
                    margin-bottom: 50px;
                    padding: 20px 20px 70px;
                    position: relative;
                    text-align: left;
                }
                h3 {
                    font-size: 1.08rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                    word-break: break-all;
                }

                p {
                    word-break: break-all;
                }
                .active {
                    animation: activeman 3.2s linear infinite;
                }
                .twitter {
                    font-size: 28px;
                    position: absolute;
                    bottom: 4px;
                    right: 20px;
                }
                .play {
                    position: absolute;
                    bottom: 48px;
                    left: 0;
                    width: 100%;
                    height: 40px;
                    text-align: center;
                }
                .play-empty {
                    color: #999;
                    font-size: 0.93rem;
                    line-height: 40px;
                }
                .booth-number {
                    position: absolute;
                    bottom: 13px;
                    left: 22px;
                    color: #888;
                    font-size: 0.93rem;
                }
                @media screen and (max-width: 767px) {
                    li {
                        flex-basis: 100%;
                    }
                }
                @keyframes activeman {
                    0% {
                        background-color: rgba(255, 238, 0, 0);
                        animation-timing-function: ease-in;
                    }
                    50% {
                        background-color: rgba(255, 238, 0, 0.5);
                        animation-timing-function: ease-out;
                    }
                    100% {
                        background-color: rgba(255, 238, 0, 0);
                    }
                }
            `}</style>
        </li>
    )
}
