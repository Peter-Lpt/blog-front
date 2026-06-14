<template>
  <div v-if="essay" class="detail-wrapper">
    <article class="detail-view">
      <h1 class="detail-title">{{ essay.title }}</h1>
      <div class="detail-meta">
        <span><el-icon><Calendar/></el-icon> {{ formatDate(essay.createTime) }}</span>
        <span><el-icon><View/></el-icon> {{ essay.viewCount || 0 }} 阅读</span>
        <span v-if="essay.categories?.length">
          <el-icon><Folder/></el-icon>
          <template v-for="cat in essay.categories" :key="cat.categoryId">
            <router-link :to="{ path: '/category/' + cat.routeName }">{{ cat.name }}</router-link>
          </template>
        </span>
        <span v-if="essay.tags?.length">
          <el-icon><PriceTag/></el-icon>
          <template v-for="tag in essay.tags" :key="tag.tagId">
            <router-link :to="{ path: '/tag/' + tag.routeName }">{{ tag.name }}</router-link>
          </template>
        </span>
      </div>
      <div class="detail-cover" v-if="essay.coverImage">
        <img :src="essay.coverImage" :alt="essay.title"/>
      </div>
      <div class="detail-content">
        <MarkdownRender :content="essay.content" @toc="handleToc"/>
      </div>
      <div class="detail-actions">
        <LikeButton :essay-slug="essay.essayId" v-model:like-count="essay.likeCount"/>
      </div>
      <CommentSection :essay-slug="essay.essayId"/>
    </article>
    <aside v-if="tocItems.length > 0" class="toc-sidebar">
      <div class="toc-title">目录</div>
      <nav class="toc-nav">
        <a
          v-for="item in tocItems"
          :key="item.id"
          :href="'#' + item.id"
          class="toc-item"
          :class="[`level-${item.level}`, { active: activeId === item.id }]"
          @click.prevent="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </a>
      </nav>
    </aside>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {Calendar, Folder, PriceTag, View} from '@element-plus/icons-vue'
import {getEssayDetail} from '@/api/essay'
import MarkdownRender from '@/components/MarkdownRender.vue'
import type {TocItem} from '@/components/MarkdownRender.vue'
import LikeButton from '@/components/LikeButton.vue'
import CommentSection from '@/components/CommentSection.vue'
import {formatDate} from '@/utils/format'

const route = useRoute()
const essay = ref<Essay | null>(null)
const tocItems = ref<TocItem[]>([])
const activeId = ref('')

function handleToc(items: TocItem[]) {
  tocItems.value = items
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({behavior: 'smooth', block: 'start'})
    activeId.value = id
  }
}

// Observe headings for active state
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    {rootMargin: '-80px 0px -80% 0px'}
  )
  tocItems.value.forEach((item) => {
    const el = document.getElementById(item.id)
    if (el) observer!.observe(el)
  })
}

onMounted(async () => {
  const essayId = route.params.essayId as string
  const data = await getEssayDetail(essayId) as unknown as Essay
  essay.value = data
  // Wait for render then setup observer
  setTimeout(setupObserver, 100)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
.detail-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.detail-view {
  flex: 1;
  min-width: 0;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 32px;
}

.detail-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  a {
    color: var(--primary-color);
  }
}

.detail-cover {
  margin-bottom: 24px;

  img {
    width: 100%;
    border-radius: 8px;
  }
}

.detail-content {
  margin-bottom: 30px;
}

.detail-actions {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 30px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

// TOC Sidebar
.toc-sidebar {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 96px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 20px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
}

.toc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--primary-color);
    background: rgba(201, 169, 110, 0.08);
  }

  &.active {
    color: var(--primary-color);
    background: rgba(201, 169, 110, 0.12);
    font-weight: 500;
  }

  &.level-1 {
    padding-left: 8px;
  }

  &.level-2 {
    padding-left: 20px;
  }

  &.level-3 {
    padding-left: 32px;
  }

  &.level-4,
  &.level-5,
  &.level-6 {
    padding-left: 44px;
    font-size: 12px;
  }
}

@media (max-width: 1100px) {
  .toc-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .detail-view {
    padding: 20px 16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .detail-title {
    font-size: 22px;
  }
}
</style>
