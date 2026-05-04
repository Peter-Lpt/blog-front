<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-title">后台管理</div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
      >
        <el-menu-item index="/admin/essays">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon><PriceTag /></el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/friend-links">
          <el-icon><Link /></el-icon>
          <span>友链管理</span>
        </el-menu-item>
      </el-menu>
      <div class="admin-back">
        <router-link to="/">返回前台</router-link>
      </div>
    </aside>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Document, Folder, PriceTag, ChatDotRound, Link } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 220px;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.admin-title {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid #ffffff1a;
}

.admin-back {
  padding: 16px;
  border-top: 1px solid #ffffff1a;
  margin-top: auto;

  a {
    color: #ffffffa6;
    font-size: 14px;

    &:hover {
      color: #fff;
    }
  }
}

.admin-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow: auto;
}
</style>
