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
              <el-dropdown-item command="front">查看前台博客</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChatDotRound, Link, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const avatarError = ref(false)

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
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}cc"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><text x="40" y="52" text-anchor="middle" font-size="34" font-family="sans-serif" fill="#fff" font-weight="600">${ch}</text></svg>`
    )
  )
}

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logout()
    router.push('/login')
  } else if (cmd === 'front') {
    // 生产：admin 部署在 /admin/ 下，'/' 即前台；dev：vite server 下 '/'
    // 指向 admin 自身，需显式指向前台 dev 地址
    window.open(import.meta.env.VITE_FRONT_BASE_URL || '/', '_blank')
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
</style>
