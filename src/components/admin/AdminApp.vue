<template>
  <el-container class="admin-app">
    <el-aside width="220px" class="sidebar">
      <div class="logo">博客后台</div>
      <el-menu :default-active="activeTab" @select="activeTab = $event">
        <el-menu-item index="comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="friend-links">
          <el-icon><Link /></el-icon>
          <span>友链管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">管理后台</div>
        <div class="header-right">
          <a href="/" class="back-link">← 返回前台</a>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ userName }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <CommentManage v-if="activeTab === 'comments'" />
        <FriendLinkManage v-if="activeTab === 'friend-links'" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChatDotRound, Link, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { SITE } from '@/lib/config'
import { getUser, isLoggedIn, isAdmin, logout as authLogout, verifyToken } from '@/lib/auth'
import CommentManage from './CommentManage.vue'
import FriendLinkManage from './FriendLinkManage.vue'

const activeTab = ref('comments')
const userName = computed(() => {
  const user = getUser()
  return user?.nickname || user?.username || '管理员'
})

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authLogout()
    ElMessage.success('已退出登录')
    window.location.href = '/admin/login'
  }
}

onMounted(async () => {
  if (!isLoggedIn()) {
    window.location.href = '/admin/login'
    return
  }
  const valid = await verifyToken().catch(() => false)
  if (!valid || !isAdmin()) {
    authLogout()
    window.location.href = '/admin/login'
  }
})
</script>

<style scoped>
.admin-app { height: 100vh; }
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
.header-right { display: flex; align-items: center; gap: 16px; }
.back-link {
  color: var(--text-secondary);
  font-size: 13px;
  text-decoration: none;
}
.back-link:hover { color: var(--primary-color); }
.user-info { cursor: pointer; display: flex; align-items: center; gap: 4px; }
.main { background: #f5f7fa; }
</style>
