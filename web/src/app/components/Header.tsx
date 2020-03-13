import React, { useContext, useState, FC, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AppBar, Toolbar, IconButton, Drawer, Divider } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import TextField from '@material-ui/core/TextField'
import { AppContext } from '../store'
import { BaseSlider } from '../components/BaseSlider'

type Props = {}

const Header: FC<Props> = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [auditionDuration, setAuditionDuration] = useState<number>(
        (process.env.DEFAULT_AUDITION_DURATION as unknown) as number
    )
    const { store, dispatch } = useContext(AppContext)
    const router = useRouter()
    const durationMarks = [
        {
            value: 0,
            label: '3秒',
        },
        {
            value: 600,
            label: '5分',
        },
    ]

    const openDrawer = useCallback(() => {
        setIsDrawerOpen(true)
    }, [])

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false)
    }, [])

    const onChangeAuditionDuration = (event: ChangeEvent<{}>, value: number | number[]) => {
        setAuditionDuration(value as number)
    }

    const onChangeCommitedAuditionDuration = useCallback((event, value) => {
        dispatch({ type: 'updateSetting', payload: { auditionDuration: 1000 * value } })
    }, [])

    return (
        <AppBar position="fixed">
            <Toolbar variant="dense">
                <h1>同人音楽小まとめ</h1>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => openDrawer()}>
                    <MenuIcon />
                </IconButton>
            </Toolbar>
            <Drawer anchor="top" open={isDrawerOpen} onClose={() => closeDrawer()}>
                <div className="Drawer">
                    <b className="Drawer-title">同人音楽小まとめ</b>

                    <dl>
                        <dt>1曲ごとの再生時間（秒）</dt>
                        <dd>
                            <BaseSlider
                                value={auditionDuration}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="on"
                                step={1}
                                marks={durationMarks}
                                min={3}
                                max={600}
                                onChange={onChangeAuditionDuration}
                                onChangeCommitted={onChangeCommitedAuditionDuration}
                            />
                        </dd>
                    </dl>
                    <ul>
                        <li>
                            {router.pathname === '/' ? (
                                <i className="Anchor-body">Home</i>
                            ) : (
                                <Link href="/">
                                    <a className="Anchor-body">Home</a>
                                </Link>
                            )}
                        </li>
                        <li>
                            {router.pathname === '/about' ? (
                                <i className="Anchor-body">About</i>
                            ) : (
                                <Link href="/about">
                                    <a className="Anchor-body">About</a>
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </Drawer>

            <style jsx>{`
                h1 {
                    flex-grow: 1;
                    text-align: left;
                }
                dl {
                    max-width: 420px;
                    margin: 0 auto 20px;
                }
                .Anchor-body {
                    display: inline-block;
                    padding: 10px;
                }
                .Drawer {
                    padding: 60px 20px;
                }
                .Drawer-title {
                    display: block;
                    font-size: 18px;
                    margin-bottom: 60px;
                }
            `}</style>
        </AppBar>
    )
}

export default Header
