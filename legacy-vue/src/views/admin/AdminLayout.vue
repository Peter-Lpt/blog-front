<template>
  <div class="admin-layout">
    <!-- 移动端遮罩 -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"/>

    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed, open: sidebarOpen }">
      <div class="admin-title">
        <span v-if="!sidebarCollapsed">后台管理</span>
        <span v-else>QM</span>
      </div>
      <el-menu
          :default-active="route.path"
          :collapse="sidebarCollapsed"
          router
          background-color="transparent"
      >
        <el-menu-item index="/admin/essays">
          <el-icon><Document/></el-icon>
          <template #title>文章管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Folder/></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon><PriceTag/></el-icon>
          <template #title>标签管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound/></el-icon>
          <template #title>评论审核</template>
        </el-menu-item>
        <el-menu-item index="/admin/friend-links">
          <el-icon><Link/></el-icon>
          <template #title>友链管理</template>
        </el-menu-item>
      </el-menu>
      <div class="admin-actions">
        <div class="admin-back">
          <router-link to="/">
            <el-icon><Back/></el-icon>
            <span v-if="!sidebarCollapsed">返回前台</span>
          </router-link>
        </div>
        <div class="admin-logout">
          <a href="javascript:;" @click="handleLogout">
            <el-icon><SwitchButton/></el-icon>
            <span v-if="!sidebarCollapsed">退出登录</span>
          </a>
        </div>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <el-icon class="sidebar-toggle" @click="toggleSidebar">
            <Fold v-if="!sidebarCollapsed && !isMobile"/>
            <Expand v-else-if="sidebarCollapsed && !isMobile"/>
            <Operation v-else/>
          </el-icon>
          <span class="admin-user">{{ authStore.user?.nickname || authStore.user?.username }}</span>
        </div>
      </header>
      <main class="admin-content">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Back, ChatDotRound, Document, Expand, Folder, Fold, Link, Operation, PriceTag, SwitchButton} from '@element-plus/icons-vue'
import {useAuthStore} from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const sidebarOpen = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarCollapsed.value = false
    sidebarOpen.value = false
  }
}

function toggleSidebar() {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/admin/login')
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 220px;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  border-right: var(--glass-border);
  transition: width 0.3s ease;
  flex-shrink: 0;

  &.collapsed {
    width: 64px;

    .admin-title {
      font-size: 16px;
    }

    :deep(.el-menu) {
      .el-menu-item {
        justify-content: center;
        padding: 0 !important;

        span {
          display: none;
        }
      }
    }
  }

  :deep(.el-menu) {
    --el-menu-text-color: var(--text-color);
    --el-menu-active-color: var(--primary-color);
    border-right: none;

    .el-menu-item {
      color: var(--text-color);
      height: 48px;
      line-height: 48px;

      &:hover {
        background: var(--glass-bg);
      }

      &.is-active {
        background: var(--primary-color);
        color: #fff !important;
      }
    }

    // 折叠时 tooltip
    .el-menu--collapse {
      width: 64px;
    }
  }
}

.admin-title {
  height: 56px;
  line-height: 56px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.admin-user {
  font-size: 14px;
  color: var(--text-secondary);
}

.admin-actions {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
}

.admin-back,
.admin-logout {
  padding: 12px 16px;

  a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: 14px;
    transition: color 0.2s;
    cursor: pointer;

    &:hover {
      color: var(--primary-color);
    }
  }
}

.admin-content {
  flex: 1;
  padding: 20px;
  background: transparent;
  overflow: auto;
}

// 移动端遮罩
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

// 移动端适配
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }

  .admin-content {
    padding: 12px;
  }
}
</style>
