interface Comment {
  commentId: string
  essayId: string
  content: string
  parentId: string | null
  replyUserId: string | null
  nickname: string
  email: string
  website: string
  status: number
  createTime: string
  children?: Comment[]
}

interface CommentForm {
  essayId: string
  content: string
  parentId?: string | null
  replyUserId?: string | null
  nickname: string
  email?: string
  website?: string
}
