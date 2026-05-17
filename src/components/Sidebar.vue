<template>
  <div class="sidebar">
    <!-- 个人信息卡片 -->
    <div class="sidebar-profile">
      <div class="profile-avatar">
        <img src="/avatar.png" alt="PeterQs" />
      </div>
      <h2 class="profile-name">PeterQs</h2>
      <p class="profile-bio">代码与生活的记录者</p>
      <a href="https://github.com/Peter-Lpt" target="_blank" rel="noopener noreferrer" class="github-link" title="GitHub">
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>GitHub</span>
      </a>
    </div>

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
  gap: 24px;
}

.sidebar-profile {
  padding: 32px 24px;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  text-align: center;
  transition: all 0.3s;

  &:hover {
    box-shadow: var(--card-hover-shadow);
  }
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 16px;
  border: 3px solid var(--primary-color);
  box-shadow: 0 4px 16px rgba(201, 169, 110, 0.25);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 8px;
}

.profile-bio {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    color: var(--text-color);
    background: rgba(201, 169, 110, 0.1);
    border-color: var(--primary-color);
  }
}

.sidebar-section {
  padding: 28px;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  transition: all 0.3s;

  &:hover {
    box-shadow: var(--card-hover-shadow);
  }
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(180deg, var(--primary-color), transparent);
    border-radius: 2px;
  }
}

.category-list {
  list-style: none;

  li {
    margin-bottom: 4px;
  }

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    color: var(--text-color);
    font-size: 14px;
    text-decoration: none;
    transition: all 0.2s;
    border-radius: 8px;

    &:hover,
    &.active {
      color: var(--primary-color);
      background: rgba(201, 169, 110, 0.08);
    }
  }
}

.cat-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-color), rgba(201, 169, 110, 0.7));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.cat-name {
  flex: 1;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  a {
    padding: 8px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: 20px;
    transition: all 0.2s;
    border: 1px solid var(--border-color);
    background: var(--glass-bg);

    &:hover,
    &.active {
      color: var(--primary-color);
      background: rgba(201, 169, 110, 0.1);
      border-color: var(--primary-color);
    }
  }
}

@media (max-width: 768px) {
  .sidebar-section {
    padding: 20px;
  }

  .cat-icon {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
}
</style>
