<template>
  <div v-if="visible" class="login-overlay" @click.self="close">
    <div class="login-card">
      <button class="close-btn" @click="close" aria-label="关闭">×</button>

      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">登录</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">注册</button>
      </div>

      <form @submit.prevent="submit">
        <input
          v-model="form.username"
          placeholder="用户名"
          class="input"
          autocomplete="username"
          required
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="密码"
          class="input"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          required
        />
        <input
          v-if="mode === 'register'"
          v-model="form.nickname"
          placeholder="昵称（可选）"
          class="input"
        />
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '提交中...' : mode === 'login' ? '登录' : '注册' }}
        </button>
      </form>

      <div class="divider"><span>或</span></div>
      <button class="github-btn" @click="loginWithGithub">
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub 登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { SITE } from '@/lib/config';
import { login, register, onAuthChange } from '@/lib/auth';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

const mode = ref<'login' | 'register'>('login');
const form = reactive({ username: '', password: '', nickname: '' });
const loading = ref(false);
const errorMsg = ref('');

function close() {
  emit('close');
}

async function submit() {
  if (loading.value) return;
  loading.value = true;
  errorMsg.value = '';
  const result =
    mode.value === 'login'
      ? await login(form.username, form.password)
      : await register(form.username, form.password, form.nickname || undefined);
  loading.value = false;
  if (result.ok) {
    close();
    onAuthChangeCallback && onAuthChangeCallback();
  } else {
    errorMsg.value = result.message || '操作失败';
  }
}

function loginWithGithub() {
  // 跳后端 authorize 接口（登录后回到当前页）
  const back = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `${SITE.apiBaseUrl}/user/oauth/github/authorize?redirect=${back}`;
}

// 触发外部刷新登录态（通过 onAuthChange 事件）
let onAuthChangeCallback: (() => void) | null = null;
onMounted(() => {
  // no-op：登录成功后 emit 自动触发 UserMenu 刷新
});
</script>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadein 0.2s;
}
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
.login-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 28px;
  width: 360px;
  max-width: 92vw;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  line-height: 1;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.tabs button {
  flex: 1;
  padding: 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 15px;
  color: var(--text-secondary);
}
.tabs button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}
.input {
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-color);
  font-size: 14px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: var(--primary-color);
}
.error {
  color: #f56c6c;
  font-size: 13px;
  margin: 0 0 12px;
}
.submit-btn {
  width: 100%;
  padding: 10px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
}
.submit-btn:hover:not(:disabled) { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.divider {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  margin: 16px 0;
  position: relative;
}
.divider::before, .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: var(--border-color);
}
.divider::before { left: 0; }
.divider::after { right: 0; }
.github-btn {
  width: 100%;
  padding: 10px;
  background: #24292e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.github-btn:hover { opacity: 0.9; }
</style>
