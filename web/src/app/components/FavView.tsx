import React, { useContext, useState, useEffect, FC, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import { PlayArrow, Stop, Close } from '@material-ui/icons'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { reducer, initialState, AppContext } from '../store'
import { AppConfig } from '../interfaces/AppConfig'

type Props = {}

const FavView: FC<Props> = () => {
    const { state, dispatch } = useContext(AppContext)
    const router = useRouter()

    useEffect(() => {
        window.addEventListener('configLoad', (e) => {
            const event = e as CustomEvent
            const config: AppConfig = event.detail
            // if (config.auditionDuration) setTimeout(() => setAuditionDuration(config.auditionDuration || 0), 300)
        })
    }, [])

    const playCircle = useCallback((circle) => {
        if (!circle.media) return

        dispatch({ type: 'mediaPlayNow', payload: circle.media })
    }, [])

    const deleteCircle = useCallback((circle) => {
        dispatch({ type: 'favRemove', payload: circle })
    }, [])

    const handleClose = useCallback(() => {
        dispatch({ type: 'favClose' })
    }, [])

    function shortenArea(name: string) {
        switch (name) {
            case '第一展示場':
                return '1展'
            case '第二展示場':
                return '2展'
            case 'Web展示場':
                return 'Web'
            default:
                return ''
        }
    }

    return (
        <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={state.isFavViewOpen}>
            <MuiDialogTitle>
                <b style={{ padding: '0 40px' }}>お気に入りサークル</b>
                <IconButton aria-label="close" onClick={handleClose} style={{ position: 'absolute', right: '10px', top: '10px', }}>
                    <Close />
                </IconButton>
            </MuiDialogTitle>
            <MuiDialogContent>
                <List>
                    {[...state.favCircles].map((circle, index) => (
                        <div key={circle.id}>
                            {index ? (<Divider />) : <></>}
                            <ListItem>
                                <ListItemAvatar>
                                    {circle.media ? (
                                        <IconButton size="small" onClick={() => playCircle(circle)} >
                                            <PlayArrow />
                                        </IconButton>
                                    ) : <></>}
                                </ListItemAvatar>
                                <ListItemText style={{ paddingRight: '20px' }}>{shortenArea(circle.booth?.area)} {circle.booth?.number} {circle.name}</ListItemText>
                                <ListItemSecondaryAction>
                                    <IconButton size="small" onClick={() => deleteCircle(circle)} >
                                        <Close />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </div>
                    ))}
                </List>
                {!state.favCircles.length ? (
                    <p>お気に入りサークルが無いか、ロード中です。<br />すでに作成したお気に入りリストがある場合は10秒ほど待ってみてください。</p>
                ) : <></>}
            </MuiDialogContent>
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
                li + li {
                    margin-top: 20px;
                }
                .Anchor-body {
                    display: inline-block;
                    padding: 10px;
                }
            `}</style>
        </Dialog>
    )
}

export default FavView
