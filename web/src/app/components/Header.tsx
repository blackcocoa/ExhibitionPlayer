import React, { useContext, useState, FC } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

type Props = {}

const Header: FC<Props> = () => {
    const router = useRouter()

    return (
        <header>
            <Link href="/">
                <a className={router.pathname === '/' ? 'is-active' : ''}>Home</a>
            </Link>{' '}
            <Link href="/about">
                <a className={router.pathname === '/about' ? 'is-active' : ''}>About</a>
            </Link>
        </header>
    )
}

export default Header
