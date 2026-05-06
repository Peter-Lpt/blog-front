import axios from 'axios'
import {ElMessage} from 'element-plus'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
})

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
        ElMessage.error(error.message || '网络异常')
        return Promise.reject(error)
    }
)

export default service
