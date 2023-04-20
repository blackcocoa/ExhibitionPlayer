import axios from 'axios'
import { JSDOM } from 'jsdom'
import { AbstractScraper } from './AbstractScraper'
import { Circle } from '../../../shared/Circle'
import { Log } from '../debug/Log'
import { YouTubeClient } from '../sns/YouTubeClient'

const youtubeClient = new YouTubeClient()

export default class M32023SpringScraper extends AbstractScraper {
    static LIST_URL: string = 'http://www.m3net.jp/attendance/circle2023sR.php'
    static YOUTUBE_SEARCH_WORD: string[] = [
        'M3-2023春',
        'M32023春',
        'M3 2023春',
        'M3-2023-春',
        'M3 2023 春',
        'M3春',
        '春M3',
    ]
    static PERIOD: [Date, Date] = [new Date('2023-4-01 00:00:00'), new Date('2023-4-30 23:59:59')]
    static ID: string = 'm3-2023-spring'

    constructor(exhibition) {
        super()
        this.exhibition = exhibition
    }

    private async parseRow(row: HTMLElement): Promise<Circle> {
        if (row.children.length < 2) return
        const nameLink = row.children[1].querySelector('.dropmenu2 > li > a')
        if (!nameLink) return

        const booth = row.children[0].textContent.replace(/\t|\n/g, '')
        return {
            id: null,
            booth: {
                area: this.getArea(booth),
                number: booth,
            },
            name: nameLink.textContent.replace(/\t/g, ''),
            description: row.children[2].textContent.replace(/\t/g, ''),
            twitterId: this.getTwitterId(<HTMLElement>row.children[1]),
            youtubeId: await this.getYoutubeId(<HTMLElement>row.children[1]),
        }
    }

    /**
     * @param booth string
     */
    private getArea(booth) {
        const firstLetter = booth[0]

        if (/^[a-zA-Z()]+$/.test(firstLetter)) {
            return '第一展示場'
        }
        if (['あ', 'い', 'う', 'え', 'お'].indexOf(firstLetter) >= 0) {
            return '第二展示場' //1F
        }
        if (['カ', 'キ', 'ク', 'ケ', 'コ', 'サ'].indexOf(firstLetter) >= 0) {
            return '第二展示場' //2F
        }
        if (['黒', '茶', '赤', '橙', '黄', '緑', '青', '紫', '灰', '白', '銀', '金'].indexOf(firstLetter) >= 0) {
            return 'Web会場'
        }

        return null
    }

    private getTwitterId(el: HTMLElement): string {
        const els = el.querySelectorAll('.dropmenu2 > li > ul > li a')
        if (!els?.length) return null

        const urls = Array.from(els, (el: HTMLAnchorElement) => {
            const searchResult = el.href.match(/https?:\/\/(?:mobile\.)?twitter\.com\/(.*)/im)
            if (!searchResult) return null
            return searchResult[1]
                .replace(/\t/g, '')
                .replace('/', '')
                .replace('?lang=ja', '')
                .replace('@', '')
                .replace(/[^\x00-\x7E]+/g, '')
                .split('?')[0]
        }).filter((link) => link)
        return urls.length ? urls[0] : null
    }

    private async getYoutubeId(el: HTMLElement): Promise<string> {
        const els = el.querySelectorAll('.dropmenu2 > li > ul > li a')
        if (!els?.length) return null

        let channelIds = Array.from(els, (el: HTMLAnchorElement) => {
            const searchResult = el.href.match(/https?:\/\/(?:www\.|m\.)?youtube\.com\/channel\/(.*)/im)
            if (!searchResult) return null
            return searchResult[1]
                .replace(/\t/g, '')
                .replace('/featured', '')
                .replace('/playlists', '')
                .replace('/about', '')
                .replace('/videos', '')
                .replace('?view_as=subscriber', '')
                .replace('?feature=emb_ch_name_ex', '')
                .replace('?sub_confirmation=1', '')
                .replace('/', '')
                .replace(/[^\x00-\x7E]+/g, '')
        }).filter((link) => link)

        if (!channelIds.length) {
            const usernames = Array.from(els, (el: HTMLAnchorElement) => {
                const searchResult = el.href.match(/https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:user|c)\/(.*)/im)
                if (!searchResult) return null
                return searchResult[1]
                    .replace(/\t/g, '')
                    .replace('/featured', '')
                    .replace('/about', '')
                    .replace('/videos', '')
                    .replace('?view_as=subscriber', '')
                    .replace('?sub_confirmation=1', '')
                    .replace('/', '')
                    .replace(/[^\x00-\x7E]+/g, '')
            }).filter((link) => link)
            const channelId = await youtubeClient.fetchChannelId(usernames[0])
            if (channelId) channelIds.push(channelId)
        }

        return channelIds.length ? channelIds[0] : null
    }

    async fetch(): Promise<Circle[]> {
        try {
            const response = await axios.get(M32023SpringScraper.LIST_URL)
            const document = new JSDOM(response.data).window.document
            const rows = document.querySelectorAll('.tblCircleList tbody tr')
            const circles: Circle[] = []

            for (let row of rows) {
                circles.push(await this.parseRow(row))
            }

            return circles.filter((circle) => circle && circle.name)
        } catch (error) {
            Log.print(error)
        }
    }
}
