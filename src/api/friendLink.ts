import service from './request'

export function getFriendLinkList(params?: any) {
  return service.get('/friendLink/findList', { params })
}

export function getFriendLinkPage(params: PageParams) {
  return service.get('/friendLink/findPage', { params })
}

export function addFriendLink(data: FriendLinkForm) {
  return service.post('/friendLink/add', data)
}

export function applyFriendLink(data: FriendLinkForm) {
  return service.post('/friendLink/apply', data)
}

export function editFriendLink(data: FriendLinkForm) {
  return service.post('/friendLink/edit', data)
}

export function deleteFriendLink(linkId: string) {
  return service.post('/friendLink/delete', { linkId })
}
