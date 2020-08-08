import { Circle } from '../../../../shared/Circle'
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
        <li className={props.active ? 'active' : ''}>
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
                {circle.media && (
                    <Button variant="contained" onClick={() => props.onClickQueue(props.index)}>
                        ここから再生
                    </Button>
                )}
            </div>
            <style jsx>{`
                li {
                    background-color: #444;
                    box-sizing: border-box;
                    border: 1px solid #666;
                    border-radius: 2px;
                    flex: 0 1 31%;
                    margin-bottom: 20px;
                    padding: 20px 20px 45px;
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
                    animation: activeman 3.2s linear infinite;
                }
                .twitter {
                    font-size: 28px;
                    position: absolute;
                    bottom: 4px;
                    right: 20px;
                }
                .booth-number {
                    position: absolute;
                    bottom: 13px;
                    left: 22px;
                    color: #ccc;
                    font-size: 0.93rem;
                }
                @media screen and (max-width: 767px) {
                    li {
                        flex-basis: 100%;
                    }
                }
                @keyframes activeman {
                    0% {
                        background-color: rgba(255, 255, 255, 0);
                    }
                    38% {
                        background-color: rgba(255, 255, 255, 0.12);
                    }
                    50% {
                        background-color: rgba(255, 255, 255, 0.2);
                    }
                    62% {
                        background-color: rgba(255, 255, 255, 0.12);
                    }
                    100% {
                        background-color: rgba(255, 255, 255, 0);
                    }
                }
            `}</style>
        </li>
    )
}
