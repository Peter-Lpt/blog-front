import axios from 'axios'
import {ElMessage} from 'element-plus'

const TOKEN_KEY = 'blog_admin_token'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
})

service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

service.interceptors.response.use(
    (res) => {
        const {success, message, data} = res.data
        if (!success) {
            ElMessage.error(message || '请求失败')
            return Promise.reject(new Error(message))
        }
        return data
    },
    (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || error.message

        if (status === 401) {
            // token 失效，清除登录状态并跳转登录页
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem('blog_admin_user')
            // 避免在登录页重复跳转
            if (!window.location.pathname.includes('/admin/login')) {
                ElMessage.error(message || '登录已过期，请重新登录')
                window.location.href = '/admin/login'
            }
        } else if (status === 403) {
            ElMessage.error(message || '权限不足')
        } else if (status === 429) {
            ElMessage.error(message || '请求过于频繁，请稍后再试')
        } else {
            ElMessage.error(message || '网络异常')
        }
        return Promise.reject(error)
    }
)

export default service
