<template>
  <button class="like-button" :class="{ liked, loading }" :disabled="loading" :aria-pressed="liked" @click="handleToggle">
    <span class="icon" aria-hidden="true">{{ liked ? '♥' : '♡' }}</span>
    <span class="copy"><strong>{{ liked ? '已加入喜欢' : '喜欢这篇文章' }}</strong><small>{{ Math.max(0, likeCount) }} 次读者反馈</small></span>
    <span class="arrow" aria-hidden="true">{{ loading ? '…' : '↗' }}</span>
  </button>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { apiRequest } from '@/lib/api';
import { getUserKey } from '@/utils/userKey';
const props = defineProps<{ essaySlug: string }>();
const liked = ref(false);
const likeCount = ref(0);
const loading = ref(false);
onMounted(async () => {
  const userKey = getUserKey();
  try {
    const data = await apiRequest<{ liked: boolean; likeCount?: number }>('/like/status?essaySlug=' + encodeURIComponent(props.essaySlug) + '&userKey=' + encodeURIComponent(userKey));
    if (data) { liked.value = data.liked; likeCount.value = data.likeCount || 0; localStorage.setItem('like_' + props.essaySlug, data.liked ? '1' : '0'); }
  } catch {
    const cached = localStorage.getItem('like_' + props.essaySlug);
    if (cached !== null) liked.value = cached === '1';
  }
});
async function handleToggle() {
  if (loading.value) return;
  loading.value = true;
  const userKey = getUserKey();
  try {
    const data = await apiRequest<{ liked: boolean; likeCount?: number }>('/like/toggle', { method: 'POST', body: JSON.stringify({ essaySlug: props.essaySlug, userKey }) });
    if (data) { liked.value = data.liked; likeCount.value = data.likeCount || 0; localStorage.setItem('like_' + props.essaySlug, data.liked ? '1' : '0'); }
  } finally { loading.value = false; }
}
</script>
<style scoped>
.like-button { width:100%; display:grid; grid-template-columns:46px minmax(0,1fr) 28px; align-items:center; gap:14px; padding:16px 18px; border:1px solid var(--color-fog); border-radius:var(--radius-md); background:var(--color-surface-raised); color:var(--color-text); cursor:pointer; text-align:left; transition:transform var(--motion-base) var(--ease-standard),border-color var(--motion-base),box-shadow var(--motion-base),background var(--motion-base); }
.like-button:hover:not(:disabled) { transform:translateY(-2px); border-color:var(--color-signal); box-shadow:var(--shadow-soft); }
.like-button.liked { border-color:rgb(228 155 82 / .5); background:var(--primary-color-light); }
.icon { display:grid; place-items:center; width:46px; height:46px; border-radius:50%; background:var(--color-ink); color:var(--color-on-ink); font-size:25px; line-height:1; transition:transform var(--motion-base) var(--ease-emphasis); }
.liked .icon { background:var(--color-signal); transform:scale(1.04); }
.copy { display:flex; flex-direction:column; gap:4px; min-width:0; }
.copy strong { font:600 var(--text-sm)/1.2 var(--font-ui); }
.copy small { color:var(--color-text-muted); font:var(--text-xs)/1.2 var(--font-ui); }
.arrow { color:var(--color-signal); font-size:1.15rem; text-align:center; }
.like-button:disabled { cursor:wait; opacity:.72; }
@media (max-width:680px) { .like-button { padding:14px; } .icon { width:40px; height:40px; } }
</style>
