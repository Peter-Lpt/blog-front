<script setup lang="ts">
/**
 * 沙箱 HTML 挂载岛（QUICK-NOTES-AND-AI-HUB-DESIGN §5）
 * - 指向 public/artifacts 下的产出物入口页，整页运行在无 same-origin 的沙箱里
 * - 不加 allow-same-origin / allow-top-navigation：挂载件无法触碰主站 DOM/Cookie/Storage
 */
import { ref } from 'vue';

const props = defineProps<{
  /** 产出物入口页地址，如 /artifacts/heavy-hole-gargantua/index.html */
  src: string;
  title?: string;
  height?: string;
}>();

const frame = ref<HTMLIFrameElement | null>(null);
const key = ref(0);

function reload() {
  key.value++; // 强制重建 iframe 实现重载
}
</script>

<template>
  <div class="artifact-mount">
    <div class="artifact-bar">
      <span class="artifact-title">🧪 沙箱挂载 · {{ props.title || '产出物实时预览' }}</span>
      <span class="artifact-actions">
        <button type="button" class="art-btn" @click="reload" aria-label="重新加载挂载件">⟳ 重载</button>
        <a class="art-btn" :href="props.src" target="_blank" rel="noopener noreferrer">新窗口打开 ↗</a>
      </span>
    </div>
    <div class="artifact-frame-wrap" :style="{ height: props.height || '520px' }">
      <iframe
        :key="key"
        ref="frame"
        :src="props.src"
        sandbox="allow-scripts"
        loading="lazy"
        class="artifact-frame"
        :title="props.title || 'artifact preview'"
      ></iframe>
    </div>
    <p class="artifact-note">已隔离运行：脚本可执行，但无法访问本站 DOM / Cookie / Storage。</p>
  </div>
</template>

<style scoped>
.artifact-mount {
  margin: 22px 0;
  border: var(--card-border, 1px solid rgba(128,128,128,.25));
  border-radius: var(--radius-lg, 14px);
  overflow: hidden;
  background: var(--color-surface, #fff);
}
.artifact-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 14px;
  border-bottom: 1px solid var(--color-fog, rgba(128,128,128,.18));
  font-size: 13px;
}
.artifact-title { font-weight: 600; color: var(--color-text-muted, #666); }
.artifact-actions { display: inline-flex; gap: 8px; }
.art-btn {
  font-size: 12px;
  padding: 3px 11px;
  border-radius: 999px;
  border: 1px solid var(--color-fog, rgba(128,128,128,.25));
  background: transparent;
  color: var(--color-text-muted, #666);
  cursor: pointer;
  text-decoration: none;
  transition: color .15s, border-color .15s;
}
.art-btn:hover { color: var(--color-signal, #4f7cff); border-color: var(--color-signal, #4f7cff); }
.artifact-frame-wrap { width: 100%; }
.artifact-frame { width: 100%; height: 100%; border: none; display: block; background: #000; }
.artifact-note { margin: 0; padding: 7px 14px; font-size: 11px; color: var(--color-text-faint, #999); border-top: 1px solid var(--color-fog, rgba(128,128,128,.15)); }
</style>
