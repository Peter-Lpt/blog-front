<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo">博客后台</div>
      <el-menu :default-active="activeMenu" router>
        <el-menu-item index="/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/friend-links">
          <el-icon><Link /></el-icon>
          <span>友链管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">管理后台</div>
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            {{ authStore.user?.nickname || authStore.user?.username }}
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChatDotRound, Link, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logout()
    router.push('/login')
  } else if (cmd === 'front') {
    window.open('/', '_blank')
  }
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.sidebar {
  background: #001529;
  color: #fff;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar :deep(.el-menu) {
  background: transparent;
  border-right: none;
}
.sidebar :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.7);
}
.sidebar :deep(.el-menu-item.is-active),
.sidebar :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.header-left { font-weight: 600; }
.user-info { cursor: pointer; display: flex; align-items: center; gap: 4px; }
.main { background: #f5f7fa; }
</style>
