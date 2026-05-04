<template>
  <div class="sidebar">
    <div class="sidebar-section">
      <h3 class="section-title">分类</h3>
      <ul class="category-list">
        <li v-for="cat in configStore.categories" :key="cat.categoryId">
          <router-link
            :to="{ path: '/', query: { categoryId: cat.categoryId } }"
            :class="{ active: currentCategoryId === cat.categoryId }"
          >
            {{ cat.name }}
            <span class="count">{{ cat.articleCount }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="sidebar-section">
      <h3 class="section-title">标签</h3>
      <div class="tag-cloud">
        <router-link
          v-for="tag in configStore.tags"
          :key="tag.tagId"
          :to="{ path: '/', query: { tagId: tag.tagId } }"
        >
          <el-tag :type="currentTagId === tag.tagId ? 'primary' : 'info'" size="small">
            {{ tag.name }}
          </el-tag>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/config'

const route = useRoute()
const configStore = useConfigStore()

const currentCategoryId = computed(() => route.query.categoryId as string | undefined)
const currentTagId = computed(() => route.query.tagId as string | undefined)

onMounted(() => {
  configStore.loadAll()
})
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-section {
  background: $glass-bg;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border: $glass-border;
  border-radius: $glass-radius;
  padding: 16px;
  box-shadow: $glass-shadow;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid $border-color;
  color: $text-color;
}

.category-list {
  list-style: none;

  li a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    color: $text-color;
    font-size: 14px;
    border-bottom: 1px solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    &:hover,
    &.active {
      color: $primary-color;
    }
  }

  .count {
    color: $text-secondary;
    font-size: 12px;
  }
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  a {
    text-decoration: none;
  }
}
</style>
