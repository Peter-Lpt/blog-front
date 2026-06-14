interface Tag {
    tagId: string
    name: string
    routeName: string
    articleCount: number
    createTime: string
}

interface TagForm {
    tagId?: string
    name: string
    routeName?: string
}
