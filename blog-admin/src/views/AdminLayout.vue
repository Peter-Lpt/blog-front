<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span class="logo-dot" aria-hidden="true" />
        <span class="logo-text">博客后台</span>
      </div>
      <el-menu :default-active="activeMenu" router class="side-menu">
        <el-menu-item index="/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/friend-links">
          <el-icon><Link /></el-icon>
          <span>友链管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-foot">Blog Admin</div>
    </el-aside>

    <el-container class="main-col">
      <el-header class="header">
        <div class="header-left">
          <span class="header-title">管理后台</span>
          <span class="header-sub">内容审核 · 友链维护</span>
        </div>
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <img :src="avatarSrc" alt="头像" class="user-avatar" @error="avatarError = true" />
            <span class="user-name">{{ authStore.user?.nickname || authStore.user?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="avatar">更换头像</el-dropdown-item>
              <el-dropdown-item divided command="front">查看前台博客</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <!-- 更换头像对话框 -->
      <el-dialog v-model="avatarDialogVisible" title="选择头像" width="440px" class="avatar-dialog">
        <p class="avatar-dialog-label">默认头像</p>
        <div class="avatar-grid">
          <img
            v-for="(preset, i) in presets"
            :key="preset"
            :src="preset"
            :alt="'预设头像 ' + (i + 1)"
            class="avatar-grid-item"
            :class="{ 'avatar-grid-item--active': authStore.user?.avatar === preset }"
            @click="pickPreset(preset)"
          />
        </div>
        <p class="avatar-dialog-label">自定义上传</p>
        <div class="avatar-upload-row">
          <input ref="fileInputRef" type="file" accept="image/*" class="avatar-file" @change="onFileChange" />
          <el-button :loading="uploading" @click="fileInputRef?.click()">选择图片并上传</el-button>
          <el-button v-if="uploading" type="primary" loading disabled>上传中…</el-button>
          <span v-if="avatarErrorMsg" class="avatar-error">{{ avatarErrorMsg }}</span>
        </div>
      </el-dialog>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Link, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { setPresetAvatar, uploadAvatarFile } from '@/api/user'
import { compressImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const avatarError = ref(false)
const avatarDialogVisible = ref(false)
const uploading = ref(false)
const avatarErrorMsg = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// 与前台一致的预设头像
const presets = [
  '/avatars/preset-1.svg',
  '/avatars/preset-2.svg',
  '/avatars/preset-3.svg',
  '/avatars/preset-4.svg',
  '/avatars/preset-5.svg',
  '/avatars/preset-6.svg',
  '/avatars/preset-7.svg',
  '/avatars/preset-8.svg',
]

// 头像：优先用户已上传的头像；加载失败或无头像时回退默认头像
const avatarSrc = computed(() => {
  if (avatarError.value) return defaultAvatar()
  const a = authStore.user?.avatar
  if (a) return a
  return defaultAvatar()
})

watch(() => authStore.user?.avatar, () => { avatarError.value = false })

// 默认头像：与前台一致的「用户名首字母 + 暖色渐变」SVG
function defaultAvatar(): string {
  const seed = authStore.user?.nickname || authStore.user?.username || 'U'
  const colors = ['#e49b52', '#76a9b8', '#6d9b78', '#c66a62', '#d29a4a', '#667eea']
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0
  const c = colors[Math.abs(h) % colors.length]
  const ch = seed.charAt(0).toUpperCase()
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 80 80\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"${c}\"/><stop offset=\"1\" stop-color=\"${c}cc\"/></linearGradient></defs><rect width=\"80\" height=\"80\" fill=\"url(#g)\"/><text x=\"40\" y=\"52\" text-anchor=\"middle\" font-size=\"34\" font-family=\"sans-serif\" fill=\"#fff\" font-weight=\"600\">${ch}</text></svg>`
    )
  )
}

// 选择预设头像
async function pickPreset(preset: string) {
  avatarErrorMsg.value = ''
  try {
    await setPresetAvatar(preset)
    await authStore.verifyToken()
    ElMessage.success('头像已更新')
    avatarDialogVisible.value = false
  } catch (e: any) {
    avatarErrorMsg.value = e?.message || '设置失败，请重试'
  }
}

// 上传自定义头像
async function onFileChange(e: Event) {
  const input = e.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  avatarErrorMsg.value = ''
  try {
    // 先压缩（目标 ≤300KB / 512px），再上传
    const compressed = await compressImage(file)
    await uploadAvatarFile(compressed.blob)
    URL.revokeObjectURL(compressed.url)
    await authStore.verifyToken()
    ElMessage.success('头像已更新')
    avatarDialogVisible.value = false
  } catch (err: any) {
    avatarErrorMsg.value = err?.message || '上传失败，请重试'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logout()
    router.push('/login')
  } else if (cmd === 'front') {
    // 生产：admin 部署在 /admin/ 下，'/' 即前台；dev：vite server 下 '/'
    // 指向 admin 自身，需显式指向前台 dev 地址
    window.open(import.meta.env.VITE_FRONT_BASE_URL || '/', '_blank')
  } else if (cmd === 'avatar') {
    avatarErrorMsg.value = ''
    avatarDialogVisible.value = true
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  background: var(--admin-bg);
}

/* ---------- 侧边栏：暖色纸感 ---------- */
.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--admin-sidebar-bg);
  border-right: 1px solid var(--admin-fog);
  color: var(--admin-text);
}
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 64px;
  flex: 0 0 64px;
  border-bottom: 1px solid var(--admin-fog);
}
.logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--admin-signal);
  box-shadow: 0 0 0 5px var(--admin-signal-soft);
}
.logo-text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--admin-text);
}
.side-menu {
  flex: 1;
  padding: 12px 10px;
  border-right: none;
  background: transparent;
}
.side-menu :deep(.el-menu-item) {
  height: 42px;
  margin-bottom: 4px;
  border-radius: 10px;
  color: var(--admin-text-muted);
  transition: background-color 0.18s ease, color 0.18s ease;
}
.side-menu :deep(.el-menu-item:hover) {
  background: var(--admin-signal-soft);
  color: var(--admin-text);
}
.side-menu :deep(.el-menu-item.is-active) {
  background: var(--admin-signal);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 6px 14px rgb(228 155 82 / 0.28);
}
.sidebar-foot {
  padding: 14px 0;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--admin-text-muted);
  opacity: 0.7;
  border-top: 1px solid var(--admin-fog);
}

/* ---------- 顶栏：白底 + 暖橙点缀 ---------- */
.main-col { display: flex; flex-direction: column; }
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: var(--admin-surface);
  border-bottom: 1px solid var(--admin-fog);
  box-shadow: 0 1px 4px rgb(16 24 32 / 0.04);
}
.header-left { display: flex; align-items: baseline; gap: 10px; }
.header-title { font-size: 16px; font-weight: 700; color: var(--admin-text); }
.header-sub { font-size: 12px; color: var(--admin-text-muted); }
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.18s ease;
  outline: none;
}
.user-info:hover { background: var(--admin-signal-soft); }
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--admin-surface);
  box-shadow: 0 0 0 1px var(--admin-fog), 0 4px 10px rgb(16 24 32 / 0.12);
}
.user-name { font-size: 14px; font-weight: 600; color: var(--admin-text); }

/* ---------- 内容区 ---------- */
.main {
  background: var(--admin-bg);
  padding: 24px;
  overflow: auto;
}
.main :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}
.main :deep(.toolbar) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: var(--admin-surface);
  border: 1px solid var(--admin-fog);
  border-radius: 12px;
}

/* 更换头像对话框 */
.avatar-dialog-label {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--admin-text-muted);
  letter-spacing: 0.06em;
}
.avatar-dialog-label:not(:first-of-type) { margin-top: 18px; }
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.avatar-grid-item {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.18s ease;
}
.avatar-grid-item:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgb(16 24 32 / 0.14); }
.avatar-grid-item--active {
  border-color: var(--admin-signal);
  box-shadow: 0 0 0 3px var(--admin-signal-soft);
}
.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-file { display: none; }
.avatar-error { color: var(--el-color-danger); font-size: 12px; }
</style>
