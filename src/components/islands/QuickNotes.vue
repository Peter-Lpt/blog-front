<script setup lang="ts">
/**
 * 随笔速记盒岛（QUICK-NOTES-AND-AI-HUB-DESIGN §3）
 * - 门控：blog_user.role === 'admin' 才加载数据；否则显示登录引导
 * - 数据：/api/notes CRUD（Bearer token），后端落盘到临时文档目录
 * - 交互：#标签 @待办 !研究 快捷语法、筛选 chips、键盘 j/k/x/t/r/a/d、导出
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface Note {
  id: string;
  text: string;
  tags: string[] | null;
  status: 'inbox' | 'todo' | 'done' | 'archived' | 'discarded' | 'research';
  createdAt: number;
  updatedAt: number;
  doneAt?: number | null;
  dueDate?: number | null;
  source?: string;
  pinned?: boolean;
}

const apiBase = (import.meta as any).env?.PUBLIC_API_BASE_URL || '/api';
const STALE_MS = 14 * 24 * 3600 * 1000;

const user = ref<any>(null);
const token = ref<string>('');
const notes = ref<Note[]>([]);
const loading = ref(false);
const error = ref('');
const draft = ref('');
const filter = ref<'all' | Note['status']>('all');
const selectedIdx = ref(-1);
const showDiscarded = ref(false);
const lastAction = ref<{ id: string; from: Note['status'] } | null>(null);

const isAdmin = computed(() => user.value?.role === 'admin');

const FILTERS: Array<{ key: 'all' | Note['status']; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'todo', label: '待办' },
  { key: 'research', label: '研究候选' },
  { key: 'inbox', label: '收件箱' },
  { key: 'done', label: '已完成' },
  { key: 'archived', label: '归档' },
  { key: 'discarded', label: '丢弃' },
];

const visibleNotes = computed(() => {
  return notes.value.filter((n) => {
    if (!showDiscarded.value && n.status === 'discarded') return false;
    if (filter.value === 'all') return true;
    return n.status === filter.value;
  });
});

const counts = computed(() => {
  const c: Record<string, number> = { all: notes.value.length };
  for (const n of notes.value) c[n.status] = (c[n.status] || 0) + 1;
  return c;
});

// ── API ──

function headers(): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` };
}

async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, { ...init, headers: headers() });
  } catch {
    throw new Error('无法连接后端服务，请确认后端已启动');
  }
  if (res.status === 404) {
    throw new Error('后端服务不可用：静态预览下速记盒需要启动 Java 后端（dev 模式经代理自动转发）');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new Error(body?.message || `请求失败(${res.status})`);
  return body.data as T;
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    notes.value = await api<Note[]>('/notes/list');
  } catch (e: any) {
    error.value = e.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

/** 解析快捷语法：#标签 @前缀→待办 !前缀→研究 */
function parseDraft(): Partial<Note> & { text: string } {
  let text = draft.value.trim();
  const tags: string[] = [];
  text = text.replace(/#([^\s#@!]+)/g, (_, t) => { tags.push(t); return ''; });
  let status: Note['status'] = 'inbox';
  if (/^!/.test(text)) { status = 'research'; text = text.replace(/^!\s*/, ''); }
  else if (/^@/.test(text)) { status = 'todo'; text = text.replace(/^@\s*/, ''); }
  return { text: text.trim(), tags, status };
}

async function add() {
  const parsed = parseDraft();
  if (!parsed.text) return;
  try {
    await api('/notes/add', { method: 'POST', body: JSON.stringify(parsed) });
    draft.value = '';
    await load();
  } catch (e: any) { error.value = e.message; }
}

async function setStatus(note: Note, status: Note['status']) {
  lastAction.value = { id: note.id, from: note.status };
  try {
    await api('/notes/update', { method: 'POST', body: JSON.stringify({ id: note.id, status }) });
    note.status = status;
  } catch (e: any) { error.value = e.message; }
}

async function togglePin(note: Note) {
  try {
    await api('/notes/update', { method: 'POST', body: JSON.stringify({ id: note.id, pinned: !note.pinned }) });
    note.pinned = !note.pinned;
  } catch (e: any) { error.value = e.message; }
}

async function undoLast() {
  if (!lastAction.value) return;
  const target = notes.value.find((n) => n.id === lastAction.value!.id);
  const restore = lastAction.value.from;
  lastAction.value = null;
  if (target) await setStatus(target, restore);
}

// ── 键盘 ──

function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  const typing = tag === 'INPUT' || tag === 'TEXTAREA';
  // 全站快捷键：Ctrl/Cmd+Shift+N 聚焦输入（仅 admin）
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
    if (!isAdmin.value) return;
    e.preventDefault();
    document.getElementById('qn-input')?.focus();
    return;
  }
  if (typing) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); add(); }
    return;
  }
  if (!isAdmin.value) return;
  const list = visibleNotes.value;
  if (e.key === 'j') { e.preventDefault(); selectedIdx.value = Math.min(selectedIdx.value + 1, list.length - 1); }
  else if (e.key === 'k') { e.preventDefault(); selectedIdx.value = Math.max(selectedIdx.value - 1, 0); }
  else if (e.key === 'x' && list[selectedIdx.value]) setStatus(list[selectedIdx.value], 'done');
  else if (e.key === 't' && list[selectedIdx.value]) setStatus(list[selectedIdx.value], 'todo');
  else if (e.key === 'r' && list[selectedIdx.value]) setStatus(list[selectedIdx.value], 'research');
  else if (e.key === 'a' && list[selectedIdx.value]) setStatus(list[selectedIdx.value], 'archived');
  else if (e.key === 'd' && list[selectedIdx.value]) setStatus(list[selectedIdx.value], 'discarded');
  else if (e.key === 'u') undoLast();
}

onMounted(() => {
  try { user.value = JSON.parse(localStorage.getItem('blog_user') || 'null'); } catch {}
  token.value = localStorage.getItem('blog_token') || '';
  if (isAdmin.value) load();
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// ── 工具 ──

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)} 天前`;
  return new Date(ts).toLocaleDateString();
}
const isStale = (n: Note) =>
  (n.status === 'inbox' || n.status === 'todo') && Date.now() - n.updatedAt > STALE_MS;

async function exportData(format: 'json' | 'md') {
  try {
    const data = await api<any>(`/notes/export?format=${format}`);
    const content = format === 'md' ? String(data) : JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quick-notes-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e: any) { error.value = e.message; }
}
</script>

<template>
  <div class="qn">
    <!-- 未登录 / 非 admin：引导 -->
    <div v-if="!isAdmin" class="qn-gate">
      <p class="qn-gate-icon">⚡</p>
      <h2 class="qn-gate-title">随笔速记盒</h2>
      <p class="qn-gate-desc">私有工作台，仅管理员可用。</p>
      <p v-if="user" class="qn-gate-hint">当前账号「{{ user.nickname || user.username }}」无管理员权限。</p>
      <p v-else class="qn-gate-hint">请先点击右上角登录，再回到本页。</p>
    </div>

    <!-- admin 主界面 -->
    <template v-else>
      <div class="qn-input-card">
        <textarea
          id="qn-input"
          v-model="draft"
          class="qn-input"
          rows="2"
          placeholder="记点什么…（#标签 · @开头=待办 · !开头=研究候选 · Ctrl+Enter 发送）"
          @keydown.enter.exact.ctrl.prevent="add"
        ></textarea>
        <button class="qn-send" :disabled="!draft.trim()" @click="add">发送 ⏎</button>
      </div>

      <div class="qn-toolbar">
        <button
          v-for="f in FILTERS"
          :key="f.key"
          class="chip qn-chip"
          :class="{ 'is-active': filter === f.key }"
          type="button"
          @click="filter = f.key"
        >{{ f.label }}<span v-if="counts[f.key]" class="chip-count">{{ counts[f.key] }}</span></button>
        <label class="qn-show-discarded"><input type="checkbox" v-model="showDiscarded" /> 显示已丢弃</label>
        <span class="qn-export">
          <button class="chip qn-chip" type="button" @click="exportData('json')">⬇ JSON</button>
          <button class="chip qn-chip" type="button" @click="exportData('md')">⬇ MD</button>
        </span>
      </div>

      <p v-if="error" class="qn-error">{{ error }}</p>
      <p v-if="loading" class="qn-loading">加载中…</p>

      <transition-group name="qnlist" tag="div" class="qn-list">
        <article
          v-for="(n, i) in visibleNotes"
          :key="n.id"
          class="qn-card"
          :class="[`st-${n.status}`, { 'is-selected': i === selectedIdx, 'is-stale': isStale(n) }]"
          @click="selectedIdx = i"
        >
          <div class="qn-card-main">
            <p class="qn-text">{{ n.text }}</p>
            <div class="qn-meta">
              <span class="qn-time">{{ relTime(n.updatedAt) }}</span>
              <span v-if="isStale(n)" class="qn-stale-badge">⚠ 陈旧</span>
              <span v-for="t in n.tags || []" :key="t" class="qn-tag">#{{ t }}</span>
            </div>
          </div>
          <div class="qn-actions">
            <button v-if="n.status !== 'done'" class="qa qa-done" title="完成 (x)" @click.stop="setStatus(n, 'done')">✓</button>
            <button v-if="n.status !== 'todo'" class="qa qa-todo" title="转待办 (t)" @click.stop="setStatus(n, 'todo')">→待办</button>
            <button v-if="n.status !== 'research'" class="qa qa-research" title="研究候选 (r)" @click.stop="setStatus(n, 'research')">⭐研究</button>
            <button v-if="n.status !== 'archived'" class="qa qa-archive" title="归档 (a)" @click.stop="setStatus(n, 'archived')">📦</button>
            <button v-if="n.status !== 'discarded'" class="qa qa-discard" title="丢弃 (d)" @click.stop="setStatus(n, 'discarded')">🗑</button>
            <button class="qa qa-pin" :title="n.pinned ? '取消置顶' : '置顶'" @click.stop="togglePin(n)">{{ n.pinned ? '📌' : '📍' }}</button>
          </div>
        </article>
      </transition-group>

      <p v-if="!loading && visibleNotes.length === 0" class="qn-empty">这里空空的。随手记一条吧。</p>

      <p class="qn-kbd-help">⌨ j/k 选择 · x 完成 · t 待办 · r 研究 · a 归档 · d 丢弃 · u 撤销上次处置</p>
    </template>
  </div>
</template>

<style scoped>
.qn { max-width: 720px; margin: 0 auto; padding-bottom: 60px; }

/* 登录门禁 */
.qn-gate { text-align: center; padding: 70px 20px; }
.qn-gate-icon { font-size: 42px; margin: 0 0 10px; }
.qn-gate-title { font-size: 22px; margin: 0 0 8px; }
.qn-gate-desc { color: var(--color-text-muted, #777); margin: 0 0 6px; }
.qn-gate-hint { font-size: 13px; color: var(--color-text-faint, #999); }

/* 输入卡 */
.qn-input-card {
  display: flex; gap: 10px; align-items: flex-end;
  background: var(--color-surface, #fff);
  border: var(--card-border, 1px solid rgba(128,128,128,.25));
  border-radius: var(--radius-lg, 14px);
  padding: 12px; margin-bottom: 16px;
}
.qn-input {
  flex: 1; resize: vertical; min-height: 44px; border: none; outline: none;
  background: transparent; color: inherit; font: inherit; line-height: 1.5;
}
.qn-send {
  border: none; border-radius: 999px; padding: 9px 18px; cursor: pointer;
  background: var(--color-signal, #4f7cff); color: #fff; font-weight: 600; font-size: 13px;
}
.qn-send:disabled { opacity: .45; cursor: default; }

/* 工具条 */
.qn-toolbar { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.qn-chip { padding: 6px 12px; cursor: pointer; font-size: 12px; }
.chip-count { margin-left: 4px; opacity: .65; }
.is-active { border-color: var(--color-signal, #4f7cff); color: var(--color-signal, #4f7cff); }
.qn-show-discarded { font-size: 12px; color: var(--color-text-faint, #999); display: inline-flex; gap: 4px; align-items: center; }
.qn-export { margin-left: auto; display: inline-flex; gap: 6px; }

.qn-error { color: #d05656; font-size: 13px; }
.qn-loading { color: var(--color-text-faint, #999); font-size: 13px; }
.qn-empty { color: var(--color-text-faint, #999); text-align: center; padding: 40px 0; }

/* 卡片流 */
.qn-list { display: flex; flex-direction: column; gap: 10px; }
.qn-card {
  display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;
  background: var(--color-surface, #fff);
  border: var(--card-border, 1px solid rgba(128,128,128,.25));
  border-radius: var(--radius-lg, 14px);
  padding: 13px 16px;
  transition: transform .15s, box-shadow .15s;
}
.qn-card:hover, .qn-card.is-selected { border-color: var(--color-signal, #4f7cff); box-shadow: 0 3px 14px rgba(80,120,255,.08); }
.qn-card.is-selected { transform: translateX(3px); }
.qn-card.is-stale .qn-text { opacity: .75; }
.qn-card.st-done .qn-text { text-decoration: line-through; opacity: .55; }
.qn-card.st-discarded { opacity: .5; }
.qn-card.st-research { border-left: 3px solid var(--color-warning, #e0a83c); }

.qn-text { margin: 0 0 7px; white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.55; }
.qn-meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.qn-time { font-size: 11px; color: var(--color-text-faint, #aaa); }
.qn-tag { font-size: 11px; color: var(--color-signal, #4f7cff); }
.qn-stale-badge { font-size: 11px; color: var(--color-warning, #e0a83c); }

/* 处置动作 */
.qn-actions { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; max-width: 46%; }
.qa {
  border: none; cursor: pointer; font-size: 11px;
  padding: 4px 9px; border-radius: 999px;
  background: var(--glass-bg, rgba(128,128,128,.1)); color: var(--color-text-muted, #666);
  transition: background .15s, color .15s, transform .1s;
}
.qa:hover { transform: translateY(-1px); }
.qa-done:hover { background: #3fb27f22; color: #3fb27f; }
.qa-todo:hover { background: #4f7cff22; color: #4f7cff; }
.qa-research:hover { background: #e0a83c22; color: #e0a83c; }
.qa-archive:hover { background: #8892aa22; color: #667; }
.qa-discard:hover { background: #d0565622; color: #d05656; }
.qa-pin:hover { color: var(--color-signal, #4f7cff); }

.qnlist-enter-active, .qnlist-leave-active { transition: all .25s ease; }
.qnlist-enter-from, .qnlist-leave-to { opacity: 0; transform: translateY(6px); }

.qn-kbd-help { margin-top: 26px; font-size: 11px; color: var(--color-text-faint, #bbb); text-align: center; }
@media (max-width: 560px) {
  .qn-actions { max-width: none; width: 100%; justify-content: flex-start; }
  .qn-card { flex-direction: column; }
}
</style>
