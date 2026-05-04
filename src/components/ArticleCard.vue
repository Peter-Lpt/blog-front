<template>
  <div class="article-card">
    <router-link :to="`/article/${essay.essayId}`" class="card-link">
      <div v-if="essay.coverImage" class="card-cover">
        <img :src="essay.coverImage" :alt="essay.title" />
      </div>
      <div class="card-body">
        <h2 class="card-title">{{ essay.title }}</h2>
        <p v-if="essay.summary" class="card-summary">{{ essay.summary }}</p>
        <div class="card-meta">
          <span><el-icon><Calendar /></el-icon> {{ formatDate(essay.createTime) }}</span>
          <span><el-icon><View /></el-icon> {{ essay.viewCount || 0 }}</span>
          <span><el-icon><Pointer /></el-icon> {{ Math.max(0, essay.likeCount || 0) }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Calendar, View, Pointer } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

defineProps<{ essay: Essay }>()
</script>

<style lang="scss" scoped>
.article-card {
  background: $glass-bg;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border: $glass-border;
  border-radius: $glass-radius;
  overflow: hidden;
  box-shadow: $glass-shadow;
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
}

.card-link {
  display: flex;
  color: $text-color;
}

.card-cover {
  width: 240px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-body {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-summary {
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 16px;
  color: $text-secondary;
  font-size: 13px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .card-cover {
    width: 100%;
    height: 160px;
  }
  .card-link {
    flex-direction: column;
  }
}
</style>
