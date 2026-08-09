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

// 设置预设默认头像（body: { avatar: '/avatars/preset-N.svg' }）
export function setPresetAvatar(avatar: string) {
  return service.post('/user/avatar/preset', { avatar })
}

// 上传自定义头像（multipart；支持压缩后的 Blob）
export function uploadAvatarFile(file: Blob | File) {
  const fd = new FormData()
  const isFile = file instanceof File
  const name = isFile ? file.name : `avatar-${Date.now()}.jpg`
  fd.append('file', file, name)
  return service.post('/user/avatar', fd)
}
