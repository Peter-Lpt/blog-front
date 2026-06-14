<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">PeterQs' Blog</router-link>
      <div class="nav-group">
        <nav class="nav-center">
          <router-link to="/">所有文章</router-link>
          <router-link to="/friend-links">友情链接</router-link>
        </nav>
        <div class="search-wrapper" :class="{ expanded: searchExpanded }">
          <input
              v-if="searchExpanded"
              ref="searchInputRef"
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文章..."
              @keyup.enter="handleSearch"
              @blur="handleBlur"
          />
          <button class="search-btn" @click="toggleSearch">
            <el-icon>
              <Search/>
            </el-icon>
          </button>
        </div>
        <div class="user-area">
          <template v-if="authStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="30" v-if="authStore.user?.avatar">
                  <img :src="authStore.user.avatar" alt="avatar"/>
                </el-avatar>
                <el-avatar :size="30" v-else>{{ (authStore.user?.nickname || authStore.user?.username || '').charAt(0) }}</el-avatar>
                <span class="user-name">{{ authStore.user?.nickname || authStore.user?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <button class="login-btn" @click="authStore.showLoginDialog = true" title="登录">
              <el-icon :size="18"><User /></el-icon>
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {nextTick, ref} from 'vue'
import {useRouter} from 'vue-router'
import {Search, User} from '@element-plus/icons-vue'
import {useAuthStore} from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const searchExpanded = ref(false)
const searchKeyword = ref('')
const searchInputRef = ref<HTMLInputElement>()

async function toggleSearch() {
  if (searchExpanded.value) {
    handleSearch()
  } else {
    searchExpanded.value = true
    await nextTick()
    searchInputRef.value?.focus()
  }
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({path: '/', query: {keyword: searchKeyword.value.trim()}})
  }
  searchExpanded.value = false
}

function handleBlur() {
  setTimeout(() => {
    searchExpanded.value = false
  }, 200)
}

function handleUserCommand(command: string) {
  if (command === 'logout') {
    authStore.logout()
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
  letter-spacing: -0.02em;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-center {
  display: flex;
  gap: 28px;

  a {
    color: var(--text-secondary);
    font-size: 15px;
    text-decoration: none;
    transition: color 0.2s;
    padding: 6px 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-color);
      transition: width 0.3s;
    }

    &:hover,
    &.router-link-exact-active {
      color: var(--text-color);

      &::after {
        width: 100%;
      }
    }
  }
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 0;
    padding: 0;
    border: none;
    outline: none;
    font-size: 14px;
    color: var(--text-color);
    background: transparent;
    transition: all 0.3s ease;
  }

  &.expanded input {
    width: 240px;
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--card-bg);

    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.15);
    }

    &::placeholder {
      color: var(--text-secondary);
    }
  }
}

.search-btn,
.login-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    color: var(--text-color);
    background: var(--glass-bg);
  }
}

.user-area {
  margin-left: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: var(--glass-bg);
  }
}

.user-name {
  font-size: 14px;
  color: var(--text-color);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 20px;
    height: 64px;
  }

  .nav-group {
    gap: 6px;
  }

  .nav-center {
    gap: 16px;

    a {
      font-size: 14px;
    }
  }

  .search-wrapper.expanded input {
    width: 160px;
  }

  .logo {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .nav-center {
    gap: 12px;
  }

  .search-wrapper.expanded input {
    width: 120px;
  }
}
</style>
