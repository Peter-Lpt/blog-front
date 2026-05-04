<template>
  <button class="like-button" :class="{ liked }" @click="handleToggle">
    <el-icon :size="20"><Pointer /></el-icon>
    <span>{{ Math.max(0, likeCount) }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Pointer } from '@element-plus/icons-vue'
import { toggleLike } from '@/api/like'
import { getUserKey } from '@/utils/userKey'

const props = defineProps<{
  essayId: string
  likeCount: number
}>()

const emit = defineEmits<{
  'update:likeCount': [value: number]
}>()

const liked = ref(false)

onMounted(() => {
  const cacheKey = `like_${props.essayId}`
  const cached = localStorage.getItem(cacheKey)
  if (cached !== null) {
    liked.value = cached === '1'
  }
})

async function handleToggle() {
  const userKey = getUserKey()
  const data = await toggleLike(props.essayId, userKey) as unknown as { liked: boolean; likeCount: number }
  liked.value = data.liked
  emit('update:likeCount', data.likeCount)
  localStorage.setItem(`like_${props.essayId}`, data.liked ? '1' : '0')
}
</script>

<style lang="scss" scoped>
.like-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: var(--card-border);
  border-radius: 20px;
  background: var(--card-bg);
  cursor: pointer;
  font-size: 15px;
  color: var(--text-secondary);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: var(--card-hover-shadow);
  }

  &.liked {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}
</style>
