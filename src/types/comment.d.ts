interface Comment {
    commentId: string
    essaySlug: string
    content: string
    parentId: string | null
    replyUserId: string | null
    nickname: string
    userId?: number
    avatar?: string
    email: string
    website: string
    status: number
    createTime: string
    children?: Comment[]
}

interface CommentForm {
    essaySlug: string
    content: string
    parentId?: string | null
    replyUserId?: string | null
}
