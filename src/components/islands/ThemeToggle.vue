<template>
  <button class="theme-toggle" :class="{ active: isDark }" @click="toggle" :aria-label="isDark ? '切换到浅色主题' : '切换到暗色主题'">
    <Transition name="icon-swap" mode="out-in">
      <svg v-if="isDark" key="sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg v-else key="moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
})

function apply(next: boolean) {
  isDark.value = next
  document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  localStorage.setItem('theme', next ? 'dark' : 'light')
}

function toggle(e: MouseEvent) {
  const next = !isDark.value
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // 圆形扩散换肤：从点击处展开（View Transitions 渐进增强）
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> }
  }
  if (!reduce && typeof doc.startViewTransition === 'function') {
    const x = e.clientX || window.innerWidth - 40
    const y = e.clientY || 32
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const root = document.documentElement
    root.classList.add('theme-morph')
    const transition = doc.startViewTransition(() => apply(next))
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' }
      )
    }).finally(() => {
      setTimeout(() => root.classList.remove('theme-morph'), 60)
    })
  } else {
    apply(next)
  }
}
</script>

<style scoped>
.theme-toggle {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  overflow: visible;
  transition: color var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard), background var(--motion-base) var(--ease-standard), box-shadow var(--motion-base) var(--ease-emphasis), transform var(--motion-fast) var(--ease-standard);
}
.theme-toggle:hover, .theme-toggle.active {
  color: var(--color-text);
  border-color: var(--color-fog);
  background: var(--color-surface);
  box-shadow: 0 7px 16px rgb(16 24 32 / .06);
  transform: translateY(-1px);
}
.theme-toggle:active { transform: translateY(0) scale(.96); }
.icon-swap-enter-active, .icon-swap-leave-active { transition: opacity 160ms ease, transform 200ms var(--ease-emphasis); }
.icon-swap-enter-from { opacity: 0; transform: rotate(-70deg) scale(.6); }
.icon-swap-leave-to { opacity: 0; transform: rotate(70deg) scale(.6); }
</style>
