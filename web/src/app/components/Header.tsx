import React, { useContext, useState, useEffect, FC, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AppBar, Toolbar, IconButton, Drawer, Divider } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import TextField from '@material-ui/core/TextField'
import { reducer, initialState, AppContext } from '../store'
import { BaseSlider } from '../components/BaseSlider'
import { AppConfig } from '../interfaces/AppConfig'

type Props = {}

const Header: FC<Props> = () => {
    const { state, dispatch } = useContext(AppContext)
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [auditionDuration, setAuditionDuration] = useState<number>(state.auditionDuration)
    const router = useRouter()
    const durationMarks = [
        {
            value: 5,
            label: '5秒',
        },
        {
            value: 600,
            label: '5分',
        },
    ]
    useEffect(() => {
        window.addEventListener('configLoad', (e) => {
            const event = e as CustomEvent
            const config: AppConfig = event.detail
            if (config.auditionDuration) setAuditionDuration(config.auditionDuration)
        })
    }, [])

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
        dispatch({ type: 'updateSetting', payload: { auditionDuration: value } })
    }, [])

    return (
        <AppBar position="fixed">
            <Toolbar variant="dense">
                <Link href="/">
                    <h1>
                        <a>同人音楽小まとめ</a>
                    </h1>
                </Link>
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
                                min={5}
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
