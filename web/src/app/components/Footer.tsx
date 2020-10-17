import React, { useContext, useState, useEffect, FC, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AppBar, Toolbar, IconButton, Drawer, Divider, Button } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import { reducer, initialState, AppContext } from '../store'
import { BaseSlider } from '../components/BaseSlider'
import { AppConfig } from '../interfaces/AppConfig'

type Props = {}

const Footer: FC<Props> = () => {
    const { state, dispatch } = useContext(AppContext)
    const router = useRouter()
    const year = new Date().getFullYear()
    return (
        <>
            <footer>&copy; {year} 同人音楽小まとめ</footer>
            <style jsx>{`
                footer {
                    font-size: 0.77rem;
                    margin-top: 60px;
                }
            `}</style>
        </>
    )
}

export default Footer
