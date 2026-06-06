<template>
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup lang="ts">
import {computed, watch} from 'vue'
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
</script>

<style lang="scss">
@import '../styles/markdown.scss';
</style>

