<template>
  <div class="login-page">
    <div class="login-card">
      <h2>博客后台管理</h2>
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
          登录
        </el-button>
      </el-form>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login, isLoggedIn, isAdmin, verifyToken } from '@/lib/auth'

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  if (isLoggedIn()) {
    const valid = await verifyToken().catch(() => false)
    if (valid && isAdmin()) {
      window.location.href = '/admin/'
    }
  }
})

async function handleLogin() {
  if (!form.username || !form.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  const result = await login(form.username, form.password)
  loading.value = false
  if (result.ok) {
    ElMessage.success('登录成功')
    window.location.href = '/admin/'
  } else {
    errorMsg.value = result.message || '登录失败'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 360px;
}
.login-card h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}
.error {
  color: #f56c6c;
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
}
</style>
