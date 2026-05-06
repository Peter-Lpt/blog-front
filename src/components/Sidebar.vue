<template>
  <div class="sidebar">
    <div class="sidebar-section">
      <h3 class="section-title">分门别类</h3>
      <ul class="category-list">
        <li v-for="cat in configStore.categories" :key="cat.categoryId">
          <router-link
              :to="{ path: '/', query: { categoryId: cat.categoryId } }"
              :class="{ active: currentCategoryId === cat.categoryId }"
          >
            <span class="cat-icon">{{ cat.name[0] }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="sidebar-section">
      <h3 class="section-title">标签云</h3>
      <div class="tag-cloud">
        <router-link
            v-for="tag in configStore.tags"
            :key="tag.tagId"
            :to="{ path: '/', query: { tagId: tag.tagId } }"
            :class="{ active: currentTagId === tag.tagId }"
        >
          {{ tag.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {useConfigStore} from '@/stores/config'

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
  gap: 32px;
}

.sidebar-section {
  padding: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.category-list {
  list-style: none;

  li {
    margin-bottom: 4px;
  }

  a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    color: var(--text-color);
    font-size: 14px;
    text-decoration: none;
    transition: color 0.2s;

    &:hover,
    &.active {
      color: var(--primary-color);
    }
  }
}

.cat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.cat-name {
  flex: 1;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  a {
    padding: 4px 12px;
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover,
    &.active {
      color: var(--primary-color);
      background: rgba(201, 169, 110, 0.1);
    }
  }
}
</style>
