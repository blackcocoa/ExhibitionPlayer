import axios from 'axios'
import { JSDOM } from 'jsdom'
import { AbstractScraper } from './AbstractScraper'
import { Circle } from '../../../shared/Circle'

export class M32020SpringScraper extends AbstractScraper {
    static LIST_URL: string = 'http://www.m3net.jp/attendance/circle2020s.php'

    constructor(exhibition) {
        super()
        this.exhibition = exhibition
    }

    private parseRow(row: HTMLElement): Circle {
        if (row.children.length < 2) return
        const nameLink = row.children[1].querySelector('.dropmenu2 > li > a')
        if (!nameLink) return

        const booth = row.children[0].textContent.replace(/\t/g, '')
        return {
            booth: {
                area: booth.match('第一展示場') ? '第一展示場' : '第二展示場',
                number: booth.replace('第一展示場', '').replace('第二展示場', ''),
            },
            name: nameLink.textContent.replace(/\t/g, ''),
            description: row.children[2].textContent.replace(/\t/g, ''),
            twitterId: this.getTwitterId(<HTMLElement>row.children[1]),
        }
    }

    private getTwitterId(el: HTMLElement): string {
        const els = el.querySelectorAll('.dropmenu2 > li > ul > li a')
        if (!els?.length) return null

        const urls = Array.from(els, el => {
            const searchResult = el.textContent.match(/https?:\/\/(?:mobile\.)?twitter\.com\/(.*)/im)
            if (!searchResult) return null
            return searchResult[1].replace(/\t/g, '')
        }).filter(link => link)

        return urls.length ? urls[0] : null
    }

    async fetch(): Promise<Circle[]> {
        try {
            const response = await axios.get(M32020SpringScraper.LIST_URL)
            const document = new JSDOM(response.data).window.document
            const rows = document.querySelectorAll('.tblCircleList tbody tr')
            return Array.prototype.map.call(rows, r => this.parseRow(r)).filter(circle => circle && circle.name)
        } catch (error) {
            console.error(error)
        }
    }
}
