<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-title">后台管理</div>
      <el-menu
          :default-active="route.path"
          router
          background-color="transparent"
      >
        <el-menu-item index="/admin/essays">
          <el-icon>
            <Document/>
          </el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon>
            <Folder/>
          </el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon>
            <PriceTag/>
          </el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/comments">
          <el-icon>
            <ChatDotRound/>
          </el-icon>
          <span>评论审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/friend-links">
          <el-icon>
            <Link/>
          </el-icon>
          <span>友链管理</span>
        </el-menu-item>
      </el-menu>
      <div class="admin-back">
        <router-link to="/">
          <el-icon>
            <Back/>
          </el-icon>
          返回前台
        </router-link>
      </div>
    </aside>
    <main class="admin-content">
      <router-view/>
    </main>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router'
import {Back, ChatDotRound, Document, Folder, Link, PriceTag} from '@element-plus/icons-vue'

const route = useRoute()
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

  :deep(.el-menu) {
    --el-menu-text-color: var(--text-color);
    --el-menu-active-color: var(--primary-color);

    .el-menu-item {
      color: var(--text-color);

      &:hover {
        background: var(--glass-bg);
      }

      &.is-active {
        background: var(--primary-color);
        color: #fff !important;
      }
    }
  }
}

.admin-title {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.admin-back {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;

  a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: 14px;
    transition: color 0.2s;

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
</style>
