import service from './request'

export function getTagList(params?: any) {
  return service.get('/tag/findList', { params })
}

export function getTagPage(params: PageParams) {
  return service.get('/tag/findPage', { params })
}

export function addTag(data: TagForm) {
  return service.post('/tag/add', data)
}

export function editTag(data: TagForm) {
  return service.post('/tag/edit', data)
}

export function deleteTag(tagId: string) {
  return service.post('/tag/delete', { tagId })
}
