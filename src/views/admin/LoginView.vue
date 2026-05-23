<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">PeterQs' Blog</h2>
      <p class="login-subtitle">后台登录</p>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref()
const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const success = await authStore.login(form.username, form.password)
    if (success) {
      router.push('/admin')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color, #f5f7fa);
}

.login-card {
  width: 380px;
  padding: 40px 36px;
  background: var(--glass-bg-strong, #fff);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  border: var(--glass-border, 1px solid rgba(0, 0, 0, 0.06));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.login-title {
  margin: 0 0 4px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color, #1d2129);
}

.login-subtitle {
  margin: 0 0 28px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary, #86909c);
}

.login-btn {
  width: 100%;
  height: 40px;
}
</style>
