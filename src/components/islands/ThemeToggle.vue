<template>
  <button class="theme-toggle" @click="toggle" :aria-label="isDark ? '切换到浅色主题' : '切换到暗色主题'">
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
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.theme-toggle:hover {
  color: var(--text-color);
  background: var(--glass-bg);
}
</style>
