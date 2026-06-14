import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { userLogin as apiLogin, userRegister as apiRegister } from '@/api/user'
import { TOKEN_KEY, USER_KEY } from '@/api/request'
import service from '@/api/request'

interface UserInfo {
  userId: number
  username: string
  nickname?: string
  avatar?: string
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 初始化时兼容旧的 localStorage key
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY) || localStorage.getItem('blog_admin_token'))
  const user = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem(USER_KEY) || localStorage.getItem('blog_admin_user') || 'null')
  )

  // 初始化时同步旧 key 到新 key
  if (token.value && !localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, token.value)
  }
  if (user.value && !localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 全局登录弹窗状态
  const showLoginDialog = ref(false)

  async function login(username: string, password: string) {
    try {
      const data = await apiLogin({ username, password })
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

  async function register(username: string, password: string, nickname?: string) {
    try {
      const data = await apiRegister({ username, password, nickname })
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
      ElMessage.success('注册成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败')
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
    // 同时清除旧的 admin key
    localStorage.removeItem('blog_admin_token')
    localStorage.removeItem('blog_admin_user')
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
      localStorage.removeItem('blog_admin_token')
      localStorage.removeItem('blog_admin_user')
      return false
    }
  }

  function getToken(): string | null {
    return token.value
  }

  return { token, user, isLoggedIn, isAdmin, showLoginDialog, login, register, logout, verifyToken, getToken }
})
