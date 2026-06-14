import service from './request'

export function getCategoryList(params?: any) {
    return service.get('/category/findList', {params})
}

export function getCategoryPage(params: PageParams) {
    return service.get('/category/findPage', {params})
}

export function addCategory(data: CategoryForm) {
    return service.post('/category/add', data)
}

export function editCategory(data: CategoryForm) {
    return service.post('/category/edit', data)
}

export function deleteCategory(categoryId: string) {
    return service.post('/category/delete', {categoryId})
}
