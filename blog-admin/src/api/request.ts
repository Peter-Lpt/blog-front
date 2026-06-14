import axios from 'axios'
import { ElMessage } from 'element-plus'

export const TOKEN_KEY = 'blog_admin_token'
export const USER_KEY = 'blog_admin_user'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

service.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (res) => {
    const { success, message, data } = res.data
    if (!success) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    return data
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      ElMessage.error('登录已过期')
      window.location.href = '/admin/login'
    } else if (status === 403) {
      ElMessage.error(error.response?.data?.message || '权限不足')
    } else {
      ElMessage.error(error.response?.data?.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default service
