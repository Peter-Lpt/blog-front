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
