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

interface Category {
  categoryId: string
  name: string
  slug: string
  description: string
  icon: string
  sort: number
  articleCount: number
  createTime: string
}

interface CategoryForm {
  categoryId?: string
  name: string
  slug?: string
  description?: string
  icon?: string
  sort?: number
}

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
