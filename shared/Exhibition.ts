export class Exhibition {
    id: string
    name: string
    slug: string
    constructor(id: string, name: string, slug: string) {
        this.id = id
        this.name = name
        this.slug = slug
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            slug: this.name,
        }
    }
}
