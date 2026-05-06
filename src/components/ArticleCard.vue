<template>
  <article class="article-card">
    <router-link :to="`/article/${essay.essayId}`" class="card-link">
      <div class="card-content">
        <h2 class="card-title">{{ essay.title }}</h2>
        <p v-if="essay.summary" class="card-summary">{{ essay.summary }}</p>
        <div class="card-meta">
          <span v-if="essay.categories?.length" class="meta-category">{{ essay.categories[0].name }}</span>
          <span class="meta-date">发布于 {{ formatDate(essay.createTime) }}</span>
        </div>
      </div>
      <div v-if="essay.coverImage" class="card-cover">
        <img :src="essay.coverImage" :alt="essay.title"/>
      </div>
    </router-link>
  </article>
</template>

<script setup lang="ts">
import {formatDate} from '@/utils/format'

defineProps<{ essay: Essay }>()
</script>

<style lang="scss" scoped>
.article-card {
  padding: 24px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 12px rgba(201, 169, 110, 0.1);
  }
}

.card-link {
  display: flex;
  gap: 24px;
  color: var(--text-color);
  text-decoration: none;

  &:hover {
    .card-title {
      color: var(--primary-color);
    }
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  color: var(--text-color);
  transition: color 0.2s;
}

.card-summary {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 13px;
}

.meta-category {
  color: var(--primary-color);
}

.card-cover {
  width: 180px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

@media (max-width: 768px) {
  .card-link {
    flex-direction: column-reverse;
  }

  .card-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
