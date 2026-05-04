<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">Qs Blog</router-link>
      <nav class="nav-center">
        <router-link to="/">所有文章</router-link>
        <router-link to="/friend-links">友情链接</router-link>
      </nav>
      <div class="nav-right">
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
            <el-icon><Search /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
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
    router.push({ path: '/', query: { keyword: searchKeyword.value.trim() } })
  }
  searchExpanded.value = false
}

function handleBlur() {
  setTimeout(() => {
    searchExpanded.value = false
  }, 200)
}
</script>

<style lang="scss" scoped>
.app-header {
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  text-decoration: none;
  flex-shrink: 0;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 32px;

  a {
    color: var(--text-secondary);
    font-size: 14px;
    text-decoration: none;
    transition: color 0.2s;
    padding: 4px 0;

    &:hover,
    &.router-link-exact-active {
      color: var(--text-color);
    }
  }
}

.nav-right {
  flex-shrink: 0;
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
    width: 200px;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--card-bg);
  }
}

.search-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
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
</style>
