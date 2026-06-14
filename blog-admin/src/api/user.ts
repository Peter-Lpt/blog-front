import service from './request'

export function userLogin(data: { username: string; password: string }) {
  return service.post('/user/login', data)
}

export function userVerify() {
  return service.get('/user/verify')
}

export function userLogout() {
  return service.post('/user/logout')
}
