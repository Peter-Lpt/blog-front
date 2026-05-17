<template>
  <article class="article-card">
    <router-link :to="`/article/${essay.essayId}`" class="card-link">
      <div class="card-content">
        <h2 class="card-title">{{ essay.title }}</h2>
        <p v-if="essay.summary" class="card-summary">{{ essay.summary }}</p>
        <div class="card-tags" v-if="essay.tags?.length">
          <span v-for="tag in essay.tags.slice(0, 3)" :key="tag.tagId" class="tag-item">
            {{ tag.name }}
          </span>
        </div>
        <div class="card-meta">
          <span v-if="essay.categories?.length" class="meta-category">
            <span class="meta-dot"></span>
            {{ essay.categories[0].name }}
          </span>
          <span class="meta-date">{{ formatDate(essay.createTime) }}</span>
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
  padding: 32px;
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
    background: linear-gradient(90deg, var(--primary-color), rgba(201, 169, 110, 0.3));
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--card-hover-shadow);
    transform: translateY(-4px);

    &::before {
      opacity: 1;
    }
  }
}

.card-link {
  display: flex;
  gap: 32px;
  color: var(--text-color);
  text-decoration: none;

  &:hover {
    .card-title {
      color: var(--primary-color);
    }

    .card-cover img {
      transform: scale(1.05);
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
  margin-bottom: 12px;
  line-height: 1.4;
  color: var(--text-color);
  transition: color 0.2s;
  letter-spacing: -0.01em;
}

.card-summary {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;

  .tag-item {
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--glass-bg);
    padding: 4px 12px;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    transition: all 0.2s;

    &:hover {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
  }
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.meta-category {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color);
  font-weight: 500;

  .meta-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary-color);
  }
}

.card-cover {
  width: 220px;
  height: 160px;
  flex-shrink: 0;
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (max-width: 768px) {
  .article-card {
    padding: 24px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-summary {
    font-size: 14px;
    -webkit-line-clamp: 2;
  }

  .card-link {
    flex-direction: column-reverse;
  }

  .card-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
