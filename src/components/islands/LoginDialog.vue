<template>
  <Teleport to="body" :disabled="!isClient">
    <div v-if="visible" class="login-overlay" @click.self="close">
      <div class="login-card">
      <button class="ld-close" @click="close" aria-label="关闭">×</button>

      <div class="ld-header">
        <h2 class="ld-title">{{ mode === 'login' ? '登录' : '注册' }}</h2>
        <p class="ld-subtitle">{{ mode === 'login' ? '欢迎回来' : '创建你的账号' }}</p>
      </div>

      <form class="ld-form" @submit.prevent="submit">
        <label class="ld-field">
          <span class="ld-label">用户名</span>
          <input
            v-model="form.username"
            type="text"
            class="ld-input"
            placeholder="请输入用户名"
            autocomplete="username"
            required
          />
        </label>

        <label class="ld-field">
          <span class="ld-label">密码</span>
          <input
            v-model="form.password"
            type="password"
            class="ld-input"
            placeholder="请输入密码"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            required
          />
        </label>

        <label class="ld-field" v-if="mode === 'register'">
          <span class="ld-label">昵称（选填）</span>
          <input
            v-model="form.nickname"
            type="text"
            class="ld-input"
            placeholder="请输入昵称"
          />
        </label>

        <p v-if="errorMsg" class="ld-error">{{ errorMsg }}</p>

        <button type="submit" class="ld-submit" :disabled="loading">
          {{ loading ? '提交中...' : mode === 'login' ? '登 录' : '注 册' }}
        </button>
      </form>

      <div class="ld-divider"><span>第三方登录</span></div>

      <button class="ld-github" @click="loginWithGithub">
        <svg class="ld-github-icon" viewBox="0 0 16 16" width="20" height="20" aria-hidden="true">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>使用 GitHub 登录</span>
      </button>

      <p class="ld-switch">
        <span v-if="mode === 'login'">
          没有账号？
          <a href="javascript:void(0)" @click="mode = 'register'">去注册</a>
        </span>
        <span v-else>
          已有账号？
          <a href="javascript:void(0)" @click="mode = 'login'">去登录</a>
        </span>
      </p>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { SITE } from '@/lib/config';
import { login, register } from '@/lib/auth';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

// SSR 安全守卫：SSR 时 disabled=true（内容内联渲染），客户端 mount 后启用 Teleport
// 因为 visible 初始为 false，SSR 和客户端初始输出一致（都是 v-if=false 空注释），
// 不会产生 hydration mismatch，mount 后 isClient=true 时 Teleport 才真正生效
const isClient = ref(false);
onMounted(() => { isClient.value = true; });

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
  } else {
    errorMsg.value = result.message || '操作失败';
  }
}

function loginWithGithub() {
  const back = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `${SITE.apiBaseUrl}/user/oauth/github/authorize?redirect=${back}`;
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  z-index: 10000;
  animation: ld-fade 0.2s ease;
}
@keyframes ld-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.login-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  width: 380px;
  max-width: 100%;
  /* 注册模式（多一个昵称字段）可能较高，限制并允许内部滚动 */
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ld-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

}
@keyframes ld-pop {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.ld-close {
  position: absolute;
  top: 16px;
  right: 20px;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.2s;
}
.ld-close:hover {
  background: var(--glass-bg);
  color: var(--text-color);
}

.ld-header {
  text-align: center;
  margin-bottom: 24px;
}
.ld-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--text-color);
}
.ld-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.ld-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ld-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ld-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color);
}
.ld-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--glass-bg);
  color: var(--text-color);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
.ld-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}
.ld-input:hover {
  border-color: var(--primary-color);
}
.ld-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.15);
}

.ld-error {
  color: #f56c6c;
  font-size: 13px;
  margin: 0;
  text-align: center;
  background: rgba(245, 108, 108, 0.08);
  padding: 8px;
  border-radius: 8px;
}

.ld-submit {
  width: 100%;
  padding: 11px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  margin-top: 4px;
  transition: all 0.2s;
}
.ld-submit:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);
}
.ld-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ld-divider {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin: 20px 0 14px;
  position: relative;
}
.ld-divider span {
  background: var(--card-bg);
  padding: 0 12px;
  position: relative;
  z-index: 1;
}
.ld-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.ld-github {
  width: 100%;
  padding: 10px;
  background: #24292e;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}
.ld-github:hover {
  background: #2f3640;
  transform: translateY(-1px);
}
.ld-github-icon {
  flex-shrink: 0;
}

.ld-switch {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 16px 0 0;
}
.ld-switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}
.ld-switch a:hover {
  text-decoration: underline;
}
</style>
