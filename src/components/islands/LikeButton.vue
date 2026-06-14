<template>
  <button class="like-button" :class="{ liked }" @click="handleToggle">
    <span class="icon">{{ liked ? '❤️' : '🤍' }}</span>
    <span>{{ Math.max(0, likeCount) }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { SITE } from '@/lib/config';
import { getUserKey } from '@/utils/userKey';

const props = defineProps<{ essaySlug: string }>();

const liked = ref(false);
const likeCount = ref(0);
const loading = ref(false);

onMounted(() => {
  const cacheKey = `like_${props.essaySlug}`;
  const cachedLiked = localStorage.getItem(cacheKey);
  if (cachedLiked !== null) {
    liked.value = cachedLiked === '1';
  }
  // 拉取当前点赞数
  fetchCount();
});

async function fetchCount() {
  try {
    // 无专用 count 接口，复用 toggle 不可行；这里仅依赖本地状态
    // 后续可加 /like/count?essaySlug=xxx 接口（见 ROADMAP 浏览量持久化）
  } catch {
    // ignore
  }
}

async function handleToggle() {
  if (loading.value) return;
  loading.value = true;
  const userKey = getUserKey();
  try {
    const res = await fetch(`${SITE.apiBaseUrl}/like/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essaySlug: props.essaySlug, userKey }),
    });
    const data = await res.json();
    if (data.success) {
      liked.value = data.data.liked;
      likeCount.value = data.data.likeCount;
      localStorage.setItem(`like_${props.essaySlug}`, data.data.liked ? '1' : '0');
    }
  } catch (e) {
    // 网络错误时静默
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: var(--card-border);
  border-radius: 24px;
  background: var(--card-bg);
  cursor: pointer;
  font-size: 15px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}
.like-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: var(--card-hover-shadow);
}
.like-button.liked {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.icon {
  font-size: 18px;
}
</style>
