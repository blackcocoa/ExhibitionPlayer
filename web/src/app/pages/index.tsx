import * as React from 'react'
import { NextPage, GetStaticProps } from 'next'
import Router from 'next/router'
import { useState, useCallback, useContext } from 'react'
import { Database } from '../db/index'
import { CircleResource } from '../db/circles'
import { Exhibition } from '../../../../shared/Exhibition'
import { ExhibitionResource } from '../db/exhibitions'
import { AppContext } from '../store'
import App from '../components/App'

interface Props {
    exhibitions: Exhibition[]
}

const db = new Database()

const Index: NextPage<Props> = ({ exhibitions }) => {
    const { store, dispatch } = useContext(AppContext)

    const onClickExhibition = useCallback((exhibition: Exhibition) => {
        dispatch({ type: 'exhibitionSet', payload: exhibition })
        Router.push(`/exhibition/${exhibition.slug}`)
    }, [])

    return (
        <App>
            <h2>イベントを選択</h2>
            <ul>
                {exhibitions.map((exhibition, index) => {
                    return (
                        <li key={index}>
                            <button onClick={() => onClickExhibition(exhibition)}>{exhibition.name}</button>
                        </li>
                    )
                })}
            </ul>
            <style jsx>{`
                h2 {
                    margin-bottom: 20px;
                }
                .Circles {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
            `}</style>
        </App>
    )
}

export const getStaticProps: GetStaticProps = async context => {
    const exhibitionResource = new ExhibitionResource(db.getInstance())
    const exhibitions = await exhibitionResource.fetch()

    return { props: { exhibitions: exhibitions.map(e => e.serialize()) } }
}

export default Index
