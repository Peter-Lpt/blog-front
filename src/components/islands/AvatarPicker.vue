<template>
  <Teleport to="body" :disabled="!isClient">
    <div v-if="visible" class="ap-overlay" @click.self="close">
      <div class="ap-panel" role="dialog" aria-label="选择头像">
        <header class="ap-head">
          <h3 class="ap-title">选择头像</h3>
          <button class="ap-close" @click="close" aria-label="关闭">×</button>
        </header>

        <!-- 预设头像网格 -->
        <p class="ap-label">默认头像</p>
        <div class="ap-grid">
          <button
            v-for="(preset, idx) in presets"
            :key="preset"
            class="ap-item"
            :class="{ 'ap-item--active': isActive(preset) }"
            @click="pickPreset(preset)"
          >
            <img :src="preset" :alt="'预设头像 ' + (idx + 1)" loading="lazy" />
          </button>
        </div>

        <!-- 上传自定义头像 -->
        <p class="ap-label">自定义上传</p>
        <label class="ap-upload" :class="{ 'ap-upload--busy': uploading }">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>{{ uploading ? '上传中…' : '上传本地图片' }}</span>
          <span v-if="errorMsg" class="ap-upload-error">{{ errorMsg }}</span>
          <input type="file" accept="image/*" class="ap-file" @change="uploadFile" />
        </label>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { apiRequest } from '@/lib/api';
import { getUser, uploadAvatar, verifyToken } from '@/lib/auth';
import { setStoredSession } from '@/lib/session';
import { getToken } from '@/lib/auth';
import { compressImage } from '@/lib/image';

const presets = [
  '/avatars/preset-1.svg',
  '/avatars/preset-2.svg',
  '/avatars/preset-3.svg',
  '/avatars/preset-4.svg',
  '/avatars/preset-5.svg',
  '/avatars/preset-6.svg',
  '/avatars/preset-7.svg',
  '/avatars/preset-8.svg',
];

const isClient = ref(false);
onMounted(() => { isClient.value = true; });

const visible = ref(false);
const uploading = ref(false);
const errorMsg = ref('');

function open() { visible.value = true; errorMsg.value = ''; }
function close() { visible.value = false; }

onMounted(() => {
  document.addEventListener('open-avatar-picker', open);
});
onUnmounted(() => {
  document.removeEventListener('open-avatar-picker', open);
});

function isActive(preset: string): boolean {
  return getUser()?.avatar === preset;
}

// 选择预设头像：调用后端 preset 接口持久化，成功后广播刷新
async function pickPreset(preset: string) {
  const token = getToken();
  if (!token) return;
  errorMsg.value = '';
  try {
    await apiRequest('/user/avatar/preset', {
      method: 'POST',
      body: JSON.stringify({ avatar: preset }),
    });
    // 本地会话同步 + 广播（Header 刷新头像区域）
    const user = getUser();
    if (user) {
      user.avatar = preset;
      setStoredSession(token, user);
    }
    window.dispatchEvent(new CustomEvent('blog-auth-change'));
    close();
  } catch (e: any) {
    errorMsg.value = e?.message || '设置失败，请重试';
  }
}

// 上传自定义头像
async function uploadFile(e: Event) {
  const input = e.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  errorMsg.value = '';
  uploading.value = true;
  try {
    // 先压缩（目标 ≤300KB / 512px），再上传
    const compressed = await compressImage(file);
    const result = await uploadAvatar(compressed.blob);
    URL.revokeObjectURL(compressed.url);
    if (!result.ok || !result.avatarUrl) {
      errorMsg.value = '上传失败，请重试';
      return;
    }
    // 立即用后端返回的 URL 更新本地会话并广播（UI 即时刷新，无需等 verify）
    const token = getToken();
    const user = getUser();
    if (token && user) {
      user.avatar = result.avatarUrl;
      setStoredSession(token, user);
    }
    window.dispatchEvent(new CustomEvent('blog-auth-change'));
    // 后台再以 DB 为权威确认一次（幂等，保证刷新后一致）
    verifyToken().then(() => {}).catch(() => {});
    close();
  } catch (err: any) {
    errorMsg.value = err?.message || '上传失败，请重试';
  } finally {
    uploading.value = false;
    input.value = '';
  }
}
</script>

<style scoped>
.ap-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10001;
  animation: ap-fade 0.2s ease;
}
@keyframes ap-fade { from { opacity: 0; } to { opacity: 1; } }

.ap-panel {
  width: 380px;
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-fog);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ap-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes ap-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.ap-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.ap-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--color-text); }
.ap-close {
  width: 28px; height: 28px;
  background: transparent; border: none;
  font-size: 22px; line-height: 1; cursor: pointer;
  color: var(--color-text-muted); border-radius: 50%;
  transition: all 0.2s;
}
.ap-close:hover { background: var(--glass-bg); color: var(--color-text); }

.ap-label { margin: 14px 0 8px; font-size: 12px; font-weight: 600; color: var(--color-text-muted); letter-spacing: 0.06em; }
.ap-label:first-of-type { margin-top: 0; }

.ap-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.ap-item {
  position: relative;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.18s ease;
}
.ap-item img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}
.ap-item:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgb(16 24 32 / 0.14); }
.ap-item--active { border-color: var(--color-signal); box-shadow: 0 0 0 3px var(--color-signal-soft); }
.ap-item--active::after {
  content: '✓';
  position: absolute;
  right: 4px; bottom: 4px;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-signal); color: #fff;
  border-radius: 50%;
  font-size: 11px; font-weight: 700;
}

.ap-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: 1.5px dashed var(--color-fog-strong);
  border-radius: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.ap-upload:hover { border-color: var(--color-signal); color: var(--color-signal); background: var(--color-signal-soft); }
.ap-upload--busy { opacity: 0.6; pointer-events: none; }
.ap-file { display: none; }
.ap-upload-error { margin-left: auto; color: var(--color-danger); font-size: 12px; }
</style>
