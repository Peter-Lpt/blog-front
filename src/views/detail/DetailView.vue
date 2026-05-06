<template>
  <div v-if="essay" class="detail-view">
    <h1 class="detail-title">{{ essay.title }}</h1>
    <div class="detail-meta">
      <span><el-icon><Calendar/></el-icon> {{ formatDate(essay.createTime) }}</span>
      <span><el-icon><View/></el-icon> {{ essay.viewCount || 0 }} 阅读</span>
      <span v-if="essay.categories?.length">
        <el-icon><Folder/></el-icon>
        <template v-for="cat in essay.categories" :key="cat.categoryId">
          <router-link :to="{ path: '/', query: { categoryId: cat.categoryId } }">{{ cat.name }}</router-link>
        </template>
      </span>
      <span v-if="essay.tags?.length">
        <el-icon><PriceTag/></el-icon>
        <template v-for="tag in essay.tags" :key="tag.tagId">
          <router-link :to="{ path: '/', query: { tagId: tag.tagId } }">{{ tag.name }}</router-link>
        </template>
      </span>
    </div>
    <div class="detail-cover" v-if="essay.coverImage">
      <img :src="essay.coverImage" :alt="essay.title"/>
    </div>
    <div class="detail-content">
      <MarkdownRender :content="essay.content"/>
    </div>
    <div class="detail-actions">
      <LikeButton :essay-id="essay.essayId" v-model:like-count="essay.likeCount"/>
    </div>
    <!-- 评论功能已屏蔽，后续恢复时取消注释即可 -->
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {Calendar, Folder, PriceTag, View} from '@element-plus/icons-vue'
import {getEssayDetail} from '@/api/essay'
import MarkdownRender from '@/components/MarkdownRender.vue'
import LikeButton from '@/components/LikeButton.vue'
import {formatDate} from '@/utils/format'

const route = useRoute()
const essay = ref<Essay | null>(null)

onMounted(async () => {
  const essayId = route.params.essayId as string
  const data = await getEssayDetail(essayId) as unknown as Essay
  essay.value = data
})
</script>

<style lang="scss" scoped>
.detail-view {
  max-width: 800px;
  margin: 0 auto;
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
</style>
