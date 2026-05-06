interface Essay {
    essayId: string
    title: string
    summary: string
    content: string
    coverImage: string
    status: number
    viewCount: number
    likeCount: number
    commentCount: number
    sort: number
    createTime: string
    updateTime: string
    tags?: Tag[]
    categories?: Category[]
}

interface EssayForm {
    essayId?: string
    title: string
    summary?: string
    content?: string
    coverImage?: string
    status: number
    sort?: number
    categoryId?: string
    tagId?: string
}
