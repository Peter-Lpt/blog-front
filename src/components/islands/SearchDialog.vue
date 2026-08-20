<template>
  <!-- 全局搜索弹窗：经 Teleport 挂到 body，由 header 触发按钮通过 open-search 事件唤起 -->
  <Teleport to="body" :disabled="!isClient">
    <div v-if="open" class="search-overlay" @click.self="close">
      <div
        class="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="全局搜索"
        ref="panelRef"
      >
        <div class="search-input-row">
          <svg class="lead-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="搜索文章标题、摘要或标签…"
            class="search-input"
            @input="onInput"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="goActive"
            @keydown.escape.prevent="close"
          />
          <kbd class="esc-hint">ESC</kbd>
        </div>

        <div class="search-body">
          <div v-if="!query" class="search-state">
            <p>输入关键词开始搜索，或按空格浏览全部文章。</p>
            <p class="hint">支持 <kbd>/</kbd> 或 <kbd>Ctrl+K</kbd> 快捷唤起。</p>
          </div>
          <div v-else-if="loading" class="search-state">正在检索…</div>
          <div v-else-if="indexError" class="search-state">
            <p>搜索索引暂不可用。</p>
            <p class="hint">{{ indexError }}</p>
          </div>
          <div v-else-if="results.length === 0" class="search-state search-empty">
            <p>没有找到与「{{ query }}」匹配的文章。</p>
          </div>
          <ul v-else class="search-results">
            <li v-for="(item, i) in results" :key="item.url">
              <a
                :href="item.url"
                :ref="(el) => setRowRef(i, el)"
                class="search-result"
                :class="{ active: i === activeIndex }"
                :data-active="i === activeIndex"
                @mouseenter="activeIndex = i"
              >
                <span class="result-title">{{ item.title }}</span>
                <span class="result-meta">
                  <span class="result-cat">{{ item.category }}</span>
                  <span class="result-date">{{ item.date }}</span>
                  <span v-if="item.tags.length" class="result-tags">{{ item.tags.slice(0, 2).map(t => '#' + t).join(' ') }}</span>
                </span>
                <span v-if="item.summary" class="result-summary">{{ item.summary }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

interface SearchItem {
  title: string;
  url: string;
  category: string;
  date: string;
  tags: string[];
  summary: string;
}

const open = ref(false);
const query = ref('');
const loading = ref(false);
const indexError = ref('');
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const rowRefs = ref<Array<HTMLElement | null>>([]);
const triggerEl = ref<HTMLElement | null>(null);

// SSR 安全守卫：SSR 阶段禁用 Teleport（与 LoginDialog/AvatarPicker 一致），
// 避免 SSR 输出 teleport 占位注释导致 Vue 水合时破坏周边 DOM（曾致 header 丢失）
const isClient = ref(false);
const setClient = () => { isClient.value = true; };

let indexPromise: Promise<SearchItem[]> | null = null;
let index: SearchItem[] = [];

function loadIndex(): Promise<SearchItem[]> {
  if (!indexPromise) {
    loading.value = true;
    indexPromise = fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data: SearchItem[]) => {
        index = Array.isArray(data) ? data : [];
        return index;
      })
      .catch((err: Error) => {
        indexPromise = null;
        indexError.value = err?.message || '无法加载索引';
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  }
  return indexPromise;
}

const results = computed<SearchItem[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .slice(0, 12);
});

function rememberTrigger() {
  triggerEl.value = document.getElementById('search-open-btn') as HTMLElement | null;
}

function openDialog() {
  open.value = true;
  activeIndex.value = 0;
  query.value = '';
  loadIndex();
  nextTick(() => inputEl.value?.focus());
}

function close() {
  open.value = false;
  query.value = '';
  activeIndex.value = 0;
  // 恢复触发按钮焦点
  const t = triggerEl.value as HTMLElement | null;
  if (t) t.focus({ preventScroll: true });
}

function onInput() {
  activeIndex.value = 0;
}

function move(dir: number) {
  const n = results.value.length;
  if (!n) return;
  activeIndex.value = (activeIndex.value + dir + n) % n;
  nextTick(() => {
    rowRefs.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' });
  });
}

function setRowRef(i: number, el: unknown) {
  rowRefs.value[i] = el as HTMLElement | null;
}

function goActive() {
  const item = results.value[activeIndex.value];
  if (item) window.location.href = item.url;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !isTypingTarget(e.target)) {
    e.preventDefault();
    openDialog();
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openDialog();
  } else if (e.key === 'Escape' && open.value) {
    close();
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

onMounted(() => {
  setClient();
  document.addEventListener('open-search', openDialog);
  document.addEventListener('keydown', handleKeydown);
  rememberTrigger();
});

onUnmounted(() => {
  document.removeEventListener('open-search', openDialog);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: min(12vh, 120px) 20px 20px;
  background: rgb(16 24 32 / .46);
  backdrop-filter: blur(3px);
  animation: fade-in var(--motion-fast) var(--ease-standard);
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.search-panel {
  width: 100%;
  max-width: 600px;
  max-height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-fog);
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
  animation: rise-in var(--motion-base) var(--ease-emphasis);
}
@keyframes rise-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

.search-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-fog);
}
.lead-icon { flex: 0 0 auto; color: var(--color-text-faint); }
.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font: 1.02rem var(--font-ui);
  outline: none;
}
.search-input::placeholder { color: var(--color-text-muted); opacity: .7; }
.esc-hint {
  flex: 0 0 auto;
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid var(--color-fog);
  border-radius: 4px;
  color: var(--color-text-muted);
  background: var(--color-surface-raised);
  font-family: inherit;
}

.search-body { flex: 1; overflow-y: auto; }
.search-state { padding: 40px 20px; text-align: center; color: var(--color-text-muted); font-size: .92rem; }
.search-state p { margin: 6px 0; }
.search-state .hint { color: var(--color-text-faint); font-size: .8rem; }
.search-state kbd { padding: 1px 5px; border: 1px solid var(--color-fog); border-radius: 4px; background: var(--color-surface-raised); }
.search-empty p:first-child { font-weight: 600; color: var(--color-text); }

.search-results { list-style: none; margin: 0; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
.search-result {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  color: var(--color-text);
  text-decoration: none;
  transition: background var(--motion-fast);
}
.search-result:hover, .search-result.active, .search-result[data-active="true"] {
  background: var(--color-signal-soft);
}
.result-title { font: 600 1rem/1.3 var(--font-ui); color: var(--color-ink); }
:root[data-theme="dark"] .result-title { color: var(--color-text); }
.result-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; color: var(--color-text-faint); font: var(--text-xs) var(--font-ui); }
.result-cat { color: var(--color-signal); font-weight: 600; }
.result-summary {
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width:680px) {
  .search-overlay { padding: 8vh 12px 16px; }
  .search-panel { max-height: 74vh; }
}
</style>
