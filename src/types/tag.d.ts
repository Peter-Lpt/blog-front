interface Tag {
    tagId: string
    name: string
    slug: string
    articleCount: number
    createTime: string
}

interface TagForm {
    tagId?: string
    name: string
    slug?: string
}
