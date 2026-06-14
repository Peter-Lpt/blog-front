import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { userLogin, userVerify, userLogout } from '@/api/user'
import { TOKEN_KEY, USER_KEY } from '@/api/request'

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

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  async function login(username: string, password: string) {
    try {
      const data: any = await userLogin({ username, password })
      token.value = data.token
      user.value = {
        userId: data.userId,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role,
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      ElMessage.success('登录成功')
      return true
    } catch (e: any) {
      ElMessage.error(e.message || '登录失败')
      return false
    }
  }

  async function verifyToken(): Promise<boolean> {
    if (!token.value) return false
    try {
      const data: any = await userVerify()
      if (user.value && data.role) {
        user.value.role = data.role
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      }
      return true
    } catch {
      logout(false)
      return false
    }
  }

  function logout(showMessage = true) {
    if (token.value) userLogout().catch(() => {})
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    if (showMessage) ElMessage.success('已退出登录')
  }

  return { token, user, isLoggedIn, isAdmin, setToken, login, verifyToken, logout }
})
