<template>
  <div class="login-page">
    <div class="login-card">
      <header class="card-head">
        <span class="brand-dot" aria-hidden="true" />
        <h2>博客后台管理</h2>
        <p class="subtitle">欢迎回来，管理员</p>
      </header>

      <form class="form" @submit.prevent="handleLogin">
        <label class="field">
          <span class="field-label">用户名</span>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
            autocomplete="username"
            size="large"
            @keyup.enter="handleLogin"
          />
        </label>
        <label class="field">
          <span class="field-label">密码</span>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            autocomplete="current-password"
            size="large"
            @keyup.enter="handleLogin"
          />
        </label>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <el-button type="primary" size="large" :loading="loading" class="submit" @click="handleLogin">
          登 录
        </el-button>

        <div class="divider"><span>第三方登录</span></div>

        <el-button size="large" class="github-btn" @click="loginWithGithub">
          <svg class="gh-icon" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>使用 GitHub 登录</span>
        </el-button>
      </form>

      <router-link to="/" class="back-home" @click.prevent="goFront">返回前台博客 →</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  // 处理 OAuth 回调错误
  if (route.query.oauth_error) {
    errorMsg.value = route.query.oauth_error as string
  }
})

async function handleLogin() {
  if (!form.username || !form.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  const ok = await authStore.login(form.username, form.password)
  loading.value = false
  if (ok) {
    // 非管理员拒绝进入后台
    if (!authStore.isAdmin) {
      errorMsg.value = '该账号不是管理员，无权进入后台'
      authStore.logout(false)
      return
    }
    router.push('/')
  }
}

function loginWithGithub() {
  // 统一走 /api 同源前缀（与前端一致），登录成功回跳到后台登录页解析 oauth_token
  const redirect = encodeURIComponent('/admin/login')
  window.location.href = `/api/user/oauth/github/authorize?redirect=${redirect}`
}

function goFront() {
  window.location.href = '/'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 85% 8%, rgba(228, 155, 82, 0.16), transparent 22rem),
    radial-gradient(circle at 12% 45%, rgba(118, 169, 184, 0.12), transparent 20rem),
    #f3f0e8;
  font-family: Inter, "Noto Sans SC", system-ui, sans-serif;
}
.login-card {
  width: 400px;
  max-width: 100%;
  padding: 36px 34px 26px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #d8dee3;
  box-shadow: 0 8px 20px rgba(16, 24, 32, 0.06), 0 22px 70px rgba(16, 24, 32, 0.14);
}
.card-head {
  text-align: center;
  margin-bottom: 24px;
}
.brand-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-bottom: 12px;
  background: #e49b52;
  box-shadow: 0 0 0 6px rgba(228, 155, 82, 0.14);
}
.card-head h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #18232b;
}
.subtitle {
  margin: 0;
  font-size: 13px;
  color: #5d6b73;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #18232b;
}
.field :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d8dee3 inset;
}
.field :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #e49b52 inset, 0 0 0 3px rgba(201, 169, 110, 0.15);
}
.error {
  margin: 0;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #c0392b;
  background: rgba(198, 106, 98, 0.08);
}
.submit {
  width: 100%;
  margin-top: 4px;
  border-radius: 10px;
  background: #e49b52;
  border-color: #e49b52;
  font-weight: 600;
}
.submit:hover {
  background: #d98d3f;
  border-color: #d98d3f;
}
.divider {
  text-align: center;
  font-size: 12px;
  color: #5d6b73;
  margin: 8px 0 2px;
  position: relative;
}
.divider span {
  background: #fff;
  padding: 0 12px;
  position: relative;
  z-index: 1;
}
.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #d8dee3;
}
.github-btn {
  width: 100%;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #24292e;
}
.github-btn:hover {
  border-color: #e49b52;
  color: #e49b52;
}
.gh-icon {
  flex-shrink: 0;
}
.back-home {
  display: block;
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #5d6b73;
  text-decoration: none;
}
.back-home:hover {
  color: #e49b52;
}
</style>