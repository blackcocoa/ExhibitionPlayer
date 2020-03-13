import React, { useContext, useState, FC } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

type Props = {}

const Header: FC<Props> = () => {
    const router = useRouter()

    return (
        <header>
            <h1>同人音楽小まとめ</h1>
            <ul>
                <li>
                    <Link href="/">
                        <a className={router.pathname === '/' ? 'is-active' : ''}>Home</a>
                    </Link>
                </li>
                <li>
                    <Link href="/about">
                        <a className={router.pathname === '/about' ? 'is-active' : ''}>About</a>
                    </Link>
                </li>
            </ul>
            <style jsx>{`
                header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 60px;
                    width: 
                    background-color: #666;
                }
                ul {
                }
            `}</style>
        </header>
    )
}

export default Header
