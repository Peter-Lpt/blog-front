<template>
  <el-dialog v-model="authStore.showLoginDialog" :title="isRegisterMode ? '注册' : '登录'" width="400px" @close="resetForm">
    <el-form :model="form" label-position="top" @submit.prevent="handleSubmit">
      <el-form-item label="用户名">
        <el-input v-model="form.username" placeholder="请输入用户名" maxlength="20"/>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" maxlength="50" show-password/>
      </el-form-item>
      <el-form-item v-if="isRegisterMode" label="昵称（选填）">
        <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isRegisterMode = !isRegisterMode">
          {{ isRegisterMode ? '已有账号？去登录' : '没有账号？去注册' }}
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isRegisterMode ? '注册' : '登录' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth'

const authStore = useAuthStore()
const isRegisterMode = ref(false)
const loading = ref(false)
const form = ref({username: '', password: '', nickname: ''})

function resetForm() {
  form.value = {username: '', password: '', nickname: ''}
  isRegisterMode.value = false
  loading.value = false
}

async function handleSubmit() {
  if (!form.value.username || !form.value.password) return
  loading.value = true
  try {
    let success = false
    if (isRegisterMode.value) {
      success = await authStore.register(form.value.username, form.value.password, form.value.nickname || undefined)
    } else {
      success = await authStore.login(form.value.username, form.value.password)
    }
    if (success) {
      authStore.showLoginDialog = false
      resetForm()
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
