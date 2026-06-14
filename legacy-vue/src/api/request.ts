import axios from 'axios'
import {ElMessage} from 'element-plus'

export const TOKEN_KEY = 'blog_token'
export const USER_KEY = 'blog_user'

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
            const errorMsg = message || res.data?.exceptionTip || '请求失败'
            ElMessage.error(errorMsg)
            return Promise.reject(new Error(errorMsg))
        }
        return data
    },
    (error) => {
        const status = error.response?.status
        const respData = error.response?.data
        const message = respData?.exceptionTip || respData?.message || error.message

        if (status === 401) {
            // token 失效，清除登录状态
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            // 同时清除旧的 admin key（兼容）
            localStorage.removeItem('blog_admin_token')
            localStorage.removeItem('blog_admin_user')

            // admin 页面：跳转到登录页
            if (window.location.pathname.startsWith('/admin')) {
                if (!window.location.pathname.includes('/admin/login')) {
                    ElMessage.error(message || '登录已过期，请重新登录')
                    window.location.href = '/admin/login'
                }
            }
            // 前台页面：不跳转，由组件处理（弹登录框）
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
