<template>
  <el-dropdown trigger="click" @command="handleThemeChange">
    <el-button :icon="Monitor" circle class="theme-btn" />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :command="'system'" :class="{ 'is-active': currentTheme === 'system' }">
          <el-icon><Monitor /></el-icon> 跟随系统
        </el-dropdown-item>
        <el-dropdown-item :command="'default'" :class="{ 'is-active': currentTheme === 'default' }">
          <el-icon><Sunny /></el-icon> 淡蓝绿
        </el-dropdown-item>
        <el-dropdown-item :command="'pink'" :class="{ 'is-active': currentTheme === 'pink' }">
          <el-icon><MagicStick /></el-icon> 粉色
        </el-dropdown-item>
        <el-dropdown-item :command="'dark'" :class="{ 'is-active': currentTheme === 'dark' }">
          <el-icon><Moon /></el-icon> 暗色
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Monitor, Sunny, MagicStick, Moon } from '@element-plus/icons-vue'

type Theme = 'system' | 'default' | 'pink' | 'dark'

const currentTheme = ref<Theme>('system')
const STORAGE_KEY = 'blog-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  currentTheme.value = theme

  if (theme === 'system') {
    document.documentElement.setAttribute('data-theme', 'system')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }

  localStorage.setItem(STORAGE_KEY, theme)
}

function handleThemeChange(theme: Theme) {
  applyTheme(theme)
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved && ['system', 'default', 'pink', 'dark'].includes(saved)) {
    currentTheme.value = saved
  } else {
    currentTheme.value = 'system'
  }
  applyTheme(currentTheme.value)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme.value === 'system') {
      // 触发重新应用主题
      document.documentElement.setAttribute('data-theme', 'system')
    }
  })
})
</script>

<style lang="scss" scoped>
.theme-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 18px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;

  &.is-active {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}
</style>
