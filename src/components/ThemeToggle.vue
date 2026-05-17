<template>
  <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色' : '切换到暗色'">
    <svg v-if="isDark" class="icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
    </svg>
    <svg v-else class="icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path
          d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

const isDark = ref(false)
const STORAGE_KEY = 'blog-theme'

function applyTheme(dark: boolean) {
  isDark.value = dark
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
}

function toggleTheme() {
  applyTheme(!isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark') {
    applyTheme(true)
  } else if (saved === 'light') {
    applyTheme(false)
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark)
  }
})
</script>

<style lang="scss" scoped>
.theme-toggle {
  position: fixed;
  top: 78px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #1a1a1a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);

  .icon {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .theme-toggle {
    top: auto;
    bottom: 24px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}
</style>
