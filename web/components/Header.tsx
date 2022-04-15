import React, { useContext, useState, useEffect, FC, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
    AppBar,
    Toolbar,
    IconButton,
    Checkbox,
    Drawer,
    Divider,
    Button,
    FormControlLabel,
    Slider,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import CloseIcon from '@material-ui/icons/Close'
import { reducer, initialState, AppContext } from '../store'
import { BaseSlider } from '../components/BaseSlider'
import { AppConfig } from '../interfaces/AppConfig'

type Props = {}

const Header: FC<Props> = () => {
    const { state, dispatch } = useContext(AppContext)
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [isExcludeUnrelated, setIsExcludeUnrelated] = useState<boolean>(state ? state.isExcludeUnrelated : false)
    const [auditionDuration, setAuditionDuration] = useState<number>(state ? state.auditionDuration : 600)
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
            if (config.auditionDuration) setTimeout(() => setAuditionDuration(config.auditionDuration || 0), 300)
            if (config.isExcludeUnrelated)
                setTimeout(() => setIsExcludeUnrelated(config.isExcludeUnrelated || false), 300)
        })
    }, [])
    const openDrawer = useCallback(() => {
        setIsDrawerOpen(true)
    }, [])

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false)
    }, [])

    const handleClickFav = useCallback(() => {
        setIsDrawerOpen(false)
        dispatch({ type: 'favOpen' })
    }, [])

    const onChangeAuditionDuration = (event: ChangeEvent<{}>, value: number | number[]) => {
        setAuditionDuration(value as number)
    }

    const onChangeCommitedAuditionDuration = useCallback((event: React.ChangeEvent<{}>, value: number | number[]) => {
        dispatch({ type: 'updateSetting', payload: { auditionDuration: value } })
    }, [])

    const onChangeExcludeUnrelated = (value: boolean) => {
        setIsExcludeUnrelated(value)
        dispatch({ type: 'updateSetting', payload: { isExcludeUnrelated: value } })
    }

    return (
        <AppBar position="fixed" color="default">
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
                <div className="drawer">
                    <b className="drawer-title">同人音楽小まとめ</b>

                    <section>
                        <ul>
                            <li>
                                {router.pathname === '/' ? (
                                    <i className="Anchor-body">トップページ</i>
                                ) : (
                                    <Link href="/">
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            className="Anchor-body"
                                            style={{ minWidth: '240px' }}
                                        >
                                            トップページ
                                        </Button>
                                    </Link>
                                )}
                            </li>
                            <li>
                                {router.pathname === '/about' ? (
                                    <i className="Anchor-body">このサイトの使いかた</i>
                                ) : (
                                    <Link href="/about">
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            className="Anchor-body"
                                            style={{ minWidth: '240px' }}
                                        >
                                            このサイトの使いかた
                                        </Button>
                                    </Link>
                                )}
                            </li>

                            <li>
                                {router.pathname === '/exhibition' ? (
                                    <i className="Anchor-body">即売会一覧</i>
                                ) : (
                                    <Link href="/exhibition">
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            className="Anchor-body"
                                            style={{ minWidth: '240px' }}
                                        >
                                            即売会一覧
                                        </Button>
                                    </Link>
                                )}
                            </li>

                            {router.pathname === '/exhibition/[slug]' ? (
                                <li>
                                    <Button
                                        size="large"
                                        variant="outlined"
                                        className="Anchor-body"
                                        style={{ minWidth: '240px' }}
                                        onClick={handleClickFav}
                                    >
                                        お気に入り一覧
                                    </Button>
                                </li>
                            ) : (
                                <></>
                            )}
                        </ul>
                    </section>
                    <Divider />
                    <section>
                        <b className="drawer-subtitle">設定</b>

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

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isExcludeUnrelated}
                                    onChange={(event) => onChangeExcludeUnrelated(event.target.checked)}
                                    name="excludeUnrelated"
                                />
                            }
                            label="即売会と関係なさそうな音源をスキップする"
                        />
                    </section>
                    <Button
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => setIsDrawerOpen(false)}
                        style={{ minWidth: '200px' }}
                    >
                        閉じる
                    </Button>
                    <IconButton
                        onClick={() => setIsDrawerOpen(false)}
                        style={{ position: 'absolute', top: '10px', right: '15px' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            </Drawer>

            <style jsx>{`
                h1 {
                    cursor: pointer;
                    flex-grow: 1;
                    text-align: left;
                }
                dl {
                    max-width: 420px;
                    margin: 0 auto 20px;
                }
                section {
                    padding: 40px 0;
                }
                li {
                    text-align: center;
                }
                li button {
                    min-width: 240px;
                }
                li + li {
                    margin-top: 20px;
                }
                .Anchor-body {
                    display: inline-block;
                    padding: 10px;
                }
                .drawer {
                    padding: 30px 20px 60px;
                }
                .drawer-title {
                    display: block;
                    font-size: 18px;
                }
                .drawer-subtitle {
                    display: block;
                    font-size: 16px;
                    margin-bottom: 50px;
                }
            `}</style>
        </AppBar>
    )
}

export default Header
