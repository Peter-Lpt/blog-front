interface Category {
    categoryId: string
    name: string
    routeName: string
    description: string
    icon: string
    sort: number
    articleCount: number
    createTime: string
}

interface CategoryForm {
    categoryId?: string
    name: string
    routeName?: string
    description?: string
    icon?: string
    sort?: number
}
