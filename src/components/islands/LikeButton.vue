<template>
  <button class="like-button" :class="{ liked }" @click="handleToggle">
    <span class="icon">{{ liked ? '❤️' : '🤍' }}</span>
    <span>{{ Math.max(0, likeCount) }}</span>
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
    const data = await apiRequest<{ liked: boolean; likeCount?: number }>(
      `/like/status?essaySlug=${encodeURIComponent(props.essaySlug)}&userKey=${encodeURIComponent(userKey)}`
    );
    if (data) {
      liked.value = data.liked;
      likeCount.value = data.likeCount || 0;
      // 同步 localStorage（与后端为准）
      localStorage.setItem(`like_${props.essaySlug}`, data.data.liked ? '1' : '0');
    }
  } catch {
    // 网络异常时降级到 localStorage 缓存
    const cached = localStorage.getItem(`like_${props.essaySlug}`);
    if (cached !== null) liked.value = cached === '1';
  }
});

async function handleToggle() {
  if (loading.value) return;
  loading.value = true;
  const userKey = getUserKey();
  try {
    const data = await apiRequest<{ liked: boolean; likeCount?: number }>('/like/toggle', {
      method: 'POST',
      body: JSON.stringify({ essaySlug: props.essaySlug, userKey }),
    });
    if (data) {
      liked.value = data.liked;
      likeCount.value = data.likeCount || 0;
      localStorage.setItem(`like_${props.essaySlug}`, data.liked ? '1' : '0');
    }
  } catch {
    // ignore
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
  font-family: inherit;
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
