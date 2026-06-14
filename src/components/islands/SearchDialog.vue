<template>
  <div class="search-wrapper" :class="{ expanded }" ref="wrapperRef">
    <button class="search-trigger" @click="toggle" aria-label="搜索">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
    <div class="search-inline" v-show="expanded">
      <input
        ref="searchInput"
        type="text"
        class="search-input"
        placeholder="搜索文章..."
        v-model="query"
        @input="handleSearch"
        @keydown.escape="close"
      />
      <kbd class="search-kbd" @click="close">ESC</kbd>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';

const expanded = ref(false);
const query = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);

function toggle() {
  if (expanded.value) {
    close();
  } else {
    expanded.value = true;
    nextTick(() => searchInput.value?.focus());
  }
}

function close() {
  expanded.value = false;
  query.value = '';
  filterArticles('');
}

function handleSearch() {
  filterArticles(query.value);
}

/**
 * 简单的客户端文章过滤：按标题匹配显示/隐藏 .article-card
 */
function filterArticles(q: string) {
  const cards = document.querySelectorAll('.article-card');
  if (!cards.length) return;
  const keyword = q.trim().toLowerCase();
  cards.forEach((card) => {
    const title = card.querySelector('.card-title')?.textContent?.toLowerCase() || '';
    const summary = card.querySelector('.card-summary')?.textContent?.toLowerCase() || '';
    const match = !keyword || title.includes(keyword) || summary.includes(keyword);
    (card as HTMLElement).style.display = match ? '' : 'none';
  });
}

function handleClickOutside(e: MouseEvent) {
  if (expanded.value && wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    close();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggle();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<style scoped>
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.search-trigger:hover {
  background: var(--glass-bg);
  color: var(--text-color);
}

.search-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  animation: search-expand 0.2s ease;
}

@keyframes search-expand {
  from { opacity: 0; width: 0; }
  to { opacity: 1; }
}

.search-input {
  width: 200px;
  padding: 7px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-color);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.15);
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-kbd {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  background: var(--glass-bg);
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
}
</style>
