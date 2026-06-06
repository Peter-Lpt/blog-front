import service from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  nickname?: string
}

export interface LoginResult {
  token: string
  userId: number
  username: string
  nickname?: string
  avatar?: string
  role: string
}

export function userLogin(data: LoginParams): Promise<LoginResult> {
  return service.post('/user/login', data) as Promise<LoginResult>
}

export function userRegister(data: RegisterParams): Promise<LoginResult> {
  return service.post('/user/register', data) as Promise<LoginResult>
}
