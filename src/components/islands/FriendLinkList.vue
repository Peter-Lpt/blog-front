<template>
  <div class="links-wrap">
    <div v-if="loading" class="empty">加载中…</div>

    <div v-else-if="errorMsg" class="empty">{{ errorMsg }}</div>

    <div v-else-if="links.length === 0" class="empty">
      <p class="empty-title">还没有友链</p>
      <p class="empty-desc">欢迎交换友链，一起交流学习～ 申请经管理员审核后即可展示。</p>
    </div>

    <div v-else class="link-grid">
      <a
        v-for="item in links"
        :key="item.linkId"
        :href="safeUrl(item.url)"
        target="_blank"
        rel="noopener noreferrer"
        class="link-card"
      >
        <span v-if="item.logo" class="link-logo">
          <img :src="item.logo" :alt="item.name" loading="lazy" />
        </span>
        <span v-else class="link-logo letter">{{ (item.name || '?')[0].toUpperCase() }}</span>
        <div class="link-info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.description">{{ item.description }}</p>
          <p v-else class="muted">{{ host(item.url) }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiRequest } from '@/lib/api'

interface FriendLink {
  linkId: number
  name: string
  url: string
  logo?: string
  description?: string
  email?: string
  sort?: number
}

const links = ref<FriendLink[]>([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    links.value = await apiRequest<FriendLink[]>('/friendLink/findList')
  } catch {
    errorMsg.value = '友链加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

function safeUrl(url: string): string {
  if (!url) return '#'
  const safe = String(url).trim()
  if (safe.startsWith('//')) return 'https:' + safe
  if (/^https?:\/\//i.test(safe)) return safe
  return 'https://' + safe
}

function host(url: string): string {
  try {
    return new URL(safeUrl(url)).host.replace(/^www\./, '')
  } catch {
    return url || ''
  }
}
</script>

<style scoped>
.links-wrap { display: flex; flex-direction: column; min-height: 120px; }
.empty {
  text-align: center;
  padding: 56px 20px;
  color: var(--color-text-muted);
}
.empty-title { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--color-text); }
.empty-desc { margin: 0; font-size: 14px; }
.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid rgb(16 24 32 / 0.08);
  border-radius: var(--radius-lg);
  color: inherit;
  text-decoration: none;
  transition: box-shadow var(--motion-base) var(--ease-standard),
    border-color var(--motion-base) var(--ease-standard),
    transform 160ms var(--ease-standard);
}
.link-card:hover {
  box-shadow: var(--shadow-soft);
  border-color: var(--color-signal);
  transform: translateY(-2px);
}
.link-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-signal-soft);
}
.link-logo img { width: 100%; height: 100%; object-fit: cover; }
.link-logo.letter { color: var(--color-signal); font-weight: 700; font-size: 18px; }
.link-info { min-width: 0; }
.link-info h3 { margin: 0 0 4px; font-size: 15px; color: var(--color-text); transition: color var(--motion-fast) var(--ease-standard); }
.link-card:hover .link-info h3 { color: var(--color-signal); }
.link-info p { margin: 0; font-size: 13px; color: var(--color-text-muted); line-height: 1.5; }
.link-info p.muted { opacity: 0.85; }
</style>