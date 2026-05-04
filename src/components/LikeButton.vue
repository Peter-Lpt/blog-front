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
  border: 2px solid $border-color;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 15px;
  color: $text-secondary;
  transition: all 0.2s;

  &:hover {
    border-color: #f56c6c;
    color: #f56c6c;
  }

  &.liked {
    border-color: #f56c6c;
    color: #f56c6c;
    background: #fef0f0;
  }
}
</style>
