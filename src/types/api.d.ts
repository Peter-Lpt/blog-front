interface PageResult<T> {
    pageNo: number
    pageSize: number
    pageTotal: number
    total: number
    records: T[]
}

interface PageParams {
    pageNo: number
    pageSize: number
    keyword?: string
    categoryId?: string
    tagId?: string
    date?: string
    status?: number
}
