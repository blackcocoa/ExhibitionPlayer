import React, { useContext, useState, useEffect, FC, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import { reducer, initialState, AppContext } from '../store'

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
