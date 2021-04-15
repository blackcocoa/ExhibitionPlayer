import * as React from 'react'
import { NextPage, GetStaticProps } from 'next'
import Router from 'next/router'
import { useState, useCallback, useContext } from 'react'
import { Database } from '../../db/index'
import { Exhibition } from '../../../../../shared/Exhibition'
import { ExhibitionResource } from '../../db/exhibitions'
import { reducer, initialState, AppContext } from '../../store'
import App from '../../components/App'
import Link from 'next/link'
import { Button } from '@material-ui/core'
import Footer from '../../components/Footer'

interface Props {
    exhibitions: Exhibition[]
}

const db = new Database()

const ExhibitionIndex: NextPage<Props> = ({ exhibitions }) => {
    const { state, dispatch } = useContext(AppContext)
    const onClickExhibition = useCallback((exhibition: Exhibition) => {
        dispatch({ type: 'exhibitionSet', payload: exhibition })
        Router.push('/exhibition/[slug]', `/exhibition/${exhibition.slug}`)
    }, [])

    return (
        <App>
            <h1>
                同人音楽小まとめ
                <br />
                <i>即売会参加サークルをサクっと横断視聴</i>
            </h1>

            <section>
                <h2>掲載中のイベント</h2>
                <ul>
                    {exhibitions.map((exhibition, index) => {
                        return (
                            <li key={index}>
                                <Button size="large" variant="outlined" onClick={() => onClickExhibition(exhibition)}>
                                    {exhibition.name}
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </section>

            <section>
                <h2>横断視聴についてのご注意</h2>
                <p><b>自動再生（一定時間で次のトラックに進む機能）はブラウザが前面にないと正常に動作しません。</b><br />
                サイトを開いているブラウザが最小化などでバックグラウンドに移行したり、別のタブを開いたりするとうまく動かない場合がありますのでご注意ください。<br />
                次のトラックに進めなかった場合はプレイヤー右下の▶︎▶︎ボタンを押してください。</p>
            </section>

            <Footer />

            <style jsx>{`
                h1 {
                    font-size: 22px;
                    margin-bottom: 40px;
                    text-align: center;
                }
                h1 i {
                    font-size: 14px;
                }
                h2 {
                    border-bottom: 1px solid white;
                    font-size: 16px;
                    padding-bottom: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                h3 {
                    margin-bottom: 10px;
                    text-align: left;
                }
                section {
                    max-width: 600px;
                    margin: 0 auto 60px;
                }
                li {
                    text-align: center;
                }
                li + li {
                    margin-top: 20px;
                }
                li button {
                    width: 200px;
                }
                b {
                    color: #e00;
                }
            `}</style>
        </App>
    )
}

export const getStaticProps: GetStaticProps = async (context) => {
    const exhibitionResource = new ExhibitionResource(db.getInstance())
    const exhibitions = await exhibitionResource.fetch()

    return { props: { exhibitions: exhibitions.map((e) => e.serialize()) } }
}

export default ExhibitionIndex
