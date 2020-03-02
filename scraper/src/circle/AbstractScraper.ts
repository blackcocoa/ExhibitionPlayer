import { Exhibition } from '../../../shared/Exhibition'

export abstract class AbstractScraper {
    exhibition: Exhibition

    fetch(): Promise<any> {
        return
    }
}
