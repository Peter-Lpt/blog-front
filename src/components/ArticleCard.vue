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
  padding: 28px;
  border: var(--card-border);
  border-radius: var(--card-radius);
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--card-hover-shadow);
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
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
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.4;
  color: var(--text-color);
  transition: color 0.2s;
  letter-spacing: -0.01em;
}

.card-summary {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
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
  width: 200px;
  height: 140px;
  flex-shrink: 0;
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
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
