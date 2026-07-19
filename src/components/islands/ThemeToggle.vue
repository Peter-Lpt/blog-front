<template>
  <button class="theme-toggle" :class="{ active: isDark }" @click="toggle" :aria-label="isDark ? '切换到浅色主题' : '切换到暗色主题'">
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
})

function toggle() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.theme-toggle {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: var(--color-text-muted);
  transition: color var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard), background var(--motion-base) var(--ease-standard), box-shadow var(--motion-base) var(--ease-emphasis), transform var(--motion-fast) var(--ease-standard);
}
.theme-toggle:hover, .theme-toggle.active {
  color: var(--color-text);
  border-color: var(--color-fog);
  background: var(--color-surface);
  box-shadow: 0 8px 20px rgb(16 24 32 / .06);
  transform: translateY(-1px);
}
.theme-toggle:active { transform: translateY(0) scale(.96); }
</style>
