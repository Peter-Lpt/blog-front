<template>
  <div class="markdown-body" ref="bodyRef" v-html="rendered" @click="handleCopy"></div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import markdownItTaskLists from 'markdown-it-task-lists'
import {full as markdownItEmoji} from 'markdown-it-emoji'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItAnchor from 'markdown-it-anchor'

// Selectively register common languages
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import go from 'highlight.js/lib/languages/go'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml' // also covers html
import java from 'highlight.js/lib/languages/java'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import rust from 'highlight.js/lib/languages/rust'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('go', go)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)  // xml language handles html as well
hljs.registerLanguage('java', java)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('rust', rust)

// Theme: light github, dark gets overrides in markdown.scss
import 'highlight.js/styles/github.css'

export interface TocItem {
  id: string
  text: string
  level: number
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, {language: lang}).value}</code></pre>`
      } catch {
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

md.use(markdownItTaskLists)
md.use(markdownItEmoji)
md.use(markdownItFootnote)
md.use(markdownItAnchor, {
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '#',
  level: [1, 2, 3, 4, 5, 6],
})

const props = defineProps<{ content: string }>()

const emit = defineEmits<{
  toc: [items: TocItem[]]
}>()

const rendered = computed(() => md.render(props.content || ''))

// Extract headings from rendered HTML for TOC
function extractHeadings(html: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /<h([1-6])\s+id="([^"]*)"[^>]*>(.*?)<\/h\1>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    // Strip HTML tags and permalink symbol from heading text
    const text = match[3].replace(/<[^>]*>/g, '').replace(/^#+\s*/, '').replace(/#+\s*$/, '').trim()
    items.push({id, text, level})
  }
  return items
}

watch(rendered, (html) => {
  const toc = extractHeadings(html)
  emit('toc', toc)
}, {immediate: true})

// ---------- copy button ----------
const bodyRef = ref<HTMLElement>()

function injectCopyButtons() {
  if (!bodyRef.value) return
  bodyRef.value.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy-btn')) return
    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
    btn.title = 'Copy code'
    pre.appendChild(btn)
  })
}

function handleCopy(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('.code-copy-btn')
  if (!btn) return
  const pre = btn.closest('pre')
  if (!pre) return
  const code = pre.querySelector('code')
  if (!code) return
  navigator.clipboard.writeText(code.textContent || '').then(() => {
    btn.classList.add('copied')
    ;(btn as HTMLElement).innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    setTimeout(() => {
      btn.classList.remove('copied')
      ;(btn as HTMLElement).innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
    }, 1500)
  })
}

watch(rendered, () => nextTick(injectCopyButtons))
onMounted(() => nextTick(injectCopyButtons))

</script>

<style lang="scss">
@use '../styles/markdown.scss';

  pre {
    position: relative;

    .code-copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--card-bg);
      color: var(--text-secondary);
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, color 0.2s, border-color 0.2s;
      line-height: 0;
    }

    &:hover .code-copy-btn {
      opacity: 1;
    }

    .code-copy-btn:hover {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .code-copy-btn.copied {
      color: #67c23a;
      border-color: #67c23a;
    }
  }
</style>


