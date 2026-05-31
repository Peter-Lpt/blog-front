import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const TOKEN_KEY = 'blog_admin_token'
const USER_KEY = 'blog_admin_user'

interface UserInfo {
  userId: number
  username: string
  nickname?: string
  avatar?: string
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username: string, password: string) {
    try {
      const data = await service.post('/user/login', { username, password }) as any
      token.value = data.token
      user.value = {
        userId: data.userId,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  function logout() {
    // 调用后端 logout 接口将 token 加入黑名单
    const currentToken = token.value
    if (currentToken) {
      service.post('/user/logout').catch(() => {})
    }
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    ElMessage.success('已退出登录')
  }

  async function verifyToken(): Promise<boolean> {
    if (!token.value) return false
    try {
      const data = await service.get('/user/verify') as any
      // 更新 role（以防 token 中的 role 与后端不一致）
      if (user.value && data.role) {
        user.value.role = data.role
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      }
      return true
    } catch {
      // token 无效，清除登录状态
      token.value = null
      user.value = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return false
    }
  }

  function getToken(): string | null {
    return token.value
  }

  return { token, user, isLoggedIn, isAdmin, login, logout, verifyToken, getToken }
})
