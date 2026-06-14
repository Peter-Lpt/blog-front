import service from './request'

export function getFriendLinkList() {
  return service.get('/friendlink/findList')
}

export function getFriendLinkPage(params: any) {
  return service.get('/friendlink/findPage', { params })
}

export function addFriendLink(data: any) {
  return service.post('/friendLink/add', data)
}

export function editFriendLink(data: any) {
  return service.post('/friendLink/edit', data)
}

export function deleteFriendLink(linkId: string) {
  return service.post('/friendLink/delete', { linkId })
}
