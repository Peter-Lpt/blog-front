<template>
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import markdownItTaskLists from 'markdown-it-task-lists'
import {full as markdownItEmoji} from 'markdown-it-emoji'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'
import 'highlight.js/styles/github.css'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str: string, lang: string) {
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
md.use(markdownItTocDoneRight)

const props = defineProps<{ content: string }>()

const rendered = computed(() => md.render(props.content || ''))
</script>

<style lang="scss">
@import '../styles/markdown.scss';
</style>
