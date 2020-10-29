import axios from 'axios'
import { JSDOM } from 'jsdom'
import { AbstractScraper } from './AbstractScraper'
import { Circle } from '../../../shared/Circle'
import { Log } from '../debug/Log'

export class M32020AutumnScraper extends AbstractScraper {
    static LIST_URL: string = 'http://www.m3net.jp/attendance/circle2020f.php'

    constructor(exhibition) {
        super()
        this.exhibition = exhibition
    }

    private parseRow(row: HTMLElement): Circle {
        if (row.children.length < 2) return
        const nameLink = row.children[1].querySelector('.dropmenu2 > li > a')
        if (!nameLink) return

        const booth = row.children[0].textContent.replace(/\t|\n/g, '')

        return {
            booth: {
                area: this.getArea(booth),
                number: booth,
            },
            name: nameLink.textContent.replace(/\t/g, ''),
            description: row.children[2].textContent.replace(/\t/g, ''),
            twitterId: this.getTwitterId(<HTMLElement>row.children[1]),
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
        if (['あ', 'い', 'う', 'え', 'お', 'か'].indexOf(firstLetter) >= 0) {
            return '第二展示場' //1F
        }
        if (['キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス'].indexOf(firstLetter) >= 0) {
            return '第二展示場' //2F
        }
        if (['黒', '茶', '赤', '橙', '黄', '緑', '青', '紫', '灰', '白', '銀', '金'].indexOf(firstLetter) >= 0) {
            return 'Web会場'
        }
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
                .replace(/[^\x00-\x7E]+/g, '')
        }).filter((link) => link)
        return urls.length ? urls[0] : null
    }

    async fetch(): Promise<Circle[]> {
        try {
            const response = await axios.get(M32020AutumnScraper.LIST_URL)
            const document = new JSDOM(response.data).window.document
            const rows = document.querySelectorAll('.tblCircleList tbody tr')
            return Array.prototype.map.call(rows, (r) => this.parseRow(r)).filter((circle) => circle && circle.name)
        } catch (error) {
            Log.print(error)
        }
    }
}
