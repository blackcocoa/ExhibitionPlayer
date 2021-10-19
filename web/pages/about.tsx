import * as React from 'react'
import { Button } from '@material-ui/core'
import { NextPage } from 'next'
import Link from 'next/link'
import App from '../components/App'
import Footer from '../components/Footer'
import { useTranslation } from '../i18n'

interface Props { }

const About: NextPage<Props> = () => {
    const lang = useTranslation()

    return (
        <App>
            <section>
                <h1>{lang.ABOUT.TITLE}</h1>
                {lang.ABOUT.BODY.map(txt => (<p>{txt}</p>))}
                <p>
                    <a href="#circle">{lang.ABOUT.GUIDE_CIRCLE}</a>
                </p>

                <p>
                    {lang.ABOUT.CONTACT_US} <br />
                    <a href="https://twitter.com/sakusabedragon/" target="_blank">
                        Twitter
                    </a>
                </p>
            </section>

            <section>
                <h2>{lang.ABOUT.VISITORS_SUBTITLE}</h2>

                <p>
                    {lang.ABOUT.VISITORS_BODY1}<br />

                    <Link href="/exhibition/m3-2021-spring">
                        <Button size="large" variant="outlined" style={{ margin: "20px auto" }}>
                            M3 2021春 サークルリスト
                        </Button>
                    </Link>
                </p>

                <p>{lang.ABOUT.VISITORS_BODY2.map(txt => (<>{txt}<br /></>))}</p>

                <p>
                    各音源の再生時間は20秒に設定されています。
                    <br />
                    画面右上のヘッダーメニューから設定を開くと再生時間を変更できます（5秒〜5分）。
                </p>
            </section>

            <section>
                <h2 id="circle">掲載情報の登録・修正（参加サークルの方へ）</h2>
                <p>
                    本サイトの情報はすべてTwitterから自動取得しているので、直接掲載情報を修正することはできません。
                    <br />
                    サークルのTwitterアカウントから以下の条件を満たすツイートをしていただければ24時間程度でサイトに反映されます。
                </p>
                <ul>
                    <li>- 「#M3 #M3春 #M3秋 #M3まとめ」のうち、どれかのタグを付ける（すべて付けても大丈夫です） </li>
                    <li>- 視聴用音源のリンクを本文に含める（YouTubeとSoundCloudに対応）</li>
                    <li>- ツイート自体に動画ファイルを添付（アップロード）しない</li>
                </ul>

                <p>
                    迷ったら、「#M3まとめ
                    https://www.youtube.com/watch?v=xxxxxxxxxxx」と書いてもらえれば確実です（xxxxxxxxxxxの部分はご自身の動画IDに書き換えてください）。
                </p>

                <h3>ご注意</h3>
                <p>
                    <b>※Twitterに埋め込み形式でアップロードした動画は抽出対象外です。</b>
                    <br />
                    これはTwitter側が動画の外部再生を許可していないためで、Twitterの仕様変更がない限りは技術的に対応できません。
                    <br />
                    ツイート埋め込み動画で告知をされる方は多いので残念なのですが、当面はYouTubeかSoundCloudに音源・動画をアップロードしてTwitterにリンクを貼る形式でお願いします。
                </p>

                <h3>どうやって音源を取ってきてるの？</h3>
                <p>
                    サークルのTwitterアカウントから最近のツイートを取得し、ツイート中のYouTubeまたはSoundCloudリンクを抽出しています。
                </p>
                <h3>サークルのアカウントを複数持ってるんだけど？</h3>
                <p>
                    本サイトのサークル情報はM3公式サイトのものをそのまま参照しているので、M3への応募時に入力したTwitterアカウントが更新対象になります。
                </p>
            </section>

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
                    border-bottom: 1px solid #333;
                    font-size: 16px;
                    padding-bottom: 8px;
                    margin-bottom: 20px;
                    text-align: left;
                }
                h3 {
                    margin-bottom: 10px;
                    text-align: left;
                }
                section {
                    max-width: 600px;
                    margin: 0 auto 60px;
                }
                ul {
                    margin-bottom: 30px;
                }
                ul {
                    background-color: #f3f3f3;
                    border: 1px solid #eaeaea;
                    border-radius: 2px;
                    box-sizing: border-box;
                    font-weight: 700;
                    margin-bottom: 30px;
                    padding: 30px 20px;
                    position: relative;
                    text-align: left;
                }
                li + li {
                    margin-top: 20px;
                }
                .center {
                    display: block;
                    margin: 10px auto;
                }
            `}</style>
            <Footer />
        </App>
    )
}

export default About
