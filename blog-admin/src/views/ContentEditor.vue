<template>
  <div class="content-editor" v-loading="loading">
    <div class="editor-toolbar">
      <el-button @click="back">← 返回目录</el-button>
      <el-tag v-if="status" :type="statusType(status)" size="small">{{ status }}</el-tag>
      <div class="spacer" />
      <el-button @click="runValidate">校验</el-button>
      <el-button type="primary" @click="save(false)">保存</el-button>
      <el-button type="danger" plain @click="remove" v-if="filePath">删除</el-button>
      <el-button type="success" @click="onTriggerBuild">本地构建</el-button>
    </div>

    <el-alert
      v-if="!backendReady"
      type="warning"
      :closable="false"
      title="后端内容接口尚未接入"
      description="已按 /api/admin/content/* 契约完成前端。后端 BE-005/006/007 就绪后此处即可联调，当前操作会返回网络错误。"
      style="margin-bottom: 12px"
    />

    <el-alert
      v-if="validation && !validation.valid"
      type="error"
      :closable="false"
      :title="`校验未通过（${validation.issues.length} 项）`"
    >
      <ul class="issues">
        <li v-for="(it, i) in validation.issues" :key="i">{{ it.field }}：{{ it.message }}</li>
      </ul>
    </el-alert>
    <el-alert v-else-if="validation && validation.valid" type="success" :closable="false" title="校验通过" />

    <div class="editor-body">
      <div class="form-col">
        <el-form :model="form" label-width="80px" size="default">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="文章标题" />
          </el-form-item>
          <el-form-item label="摘要">
            <el-input v-model="form.description" type="textarea" :rows="2" placeholder="一句话摘要" />
          </el-form-item>
          <el-form-item label="slug">
            <el-input v-model="form.slug" placeholder="稳定唯一标识" />
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker v-model="form.pubDate" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="form.category" placeholder="主分类（覆盖目录分类）" />
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="回车添加标签" style="width: 100%">
              <el-option v-for="t in form.tags" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="草稿">
            <el-switch v-model="form.draft" />
          </el-form-item>
        </el-form>
      </div>

      <div class="md-col">
        <div class="col-title">Markdown 正文</div>
        <el-input v-model="body" type="textarea" :rows="20" placeholder="正文内容（Markdown）" class="md-input" />
      </div>

      <div class="preview-col">
        <div class="col-title">预览</div>
        <div class="markdown-preview" v-html="renderedPreview" />
      </div>
    </div>

    <div class="commit-row">
      <el-input v-model="commitMessage" placeholder="commit message，例如：content: add welcome" style="max-width: 420px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getContentFile,
  validateContent,
  createContentFile,
  updateContentFile,
  deleteContentFile,
  triggerBuild,
} from '@/api/content'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const backendReady = ref(true)
const filePath = ref((route.query.path as string) || '')
const body = ref('')
const commitMessage = ref('')
const status = ref<string>('')
const validation = ref<any>(null)

const form = reactive({
  title: '',
  description: '',
  slug: '',
  pubDate: '',
  category: '',
  tags: [] as string[],
  draft: false,
})

function statusType(s: string): 'success' | 'warning' | 'info' | 'danger' {
  return s === 'PREVIEWABLE' || s === 'COMMITTED'
    ? 'success'
    : s === 'FAILED'
      ? 'danger'
      : s === 'BUILDING' || s === 'VALIDATING'
        ? 'warning'
        : 'info'
}

/** 轻量 Markdown 预览（标题/列表/加粗/代码/段落），仅前端展示，不依赖后端 */
const renderedPreview = computed(() => {
  const text = `# ${form.title || '标题预览'}\n\n${body.value}`
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>')
})

function parseFrontmatter(raw: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return
  const fm = m[1]
  body.value = m[2] || ''
  const get = (k: string) => {
    const mm = fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))
    return mm ? mm[1].trim().replace(/^["']|["']$/g, '') : ''
  }
  form.title = get('title')
  form.description = get('description')
  form.slug = get('slug')
  form.pubDate = get('pubDate')
  form.category = get('category')
  const tags = get('tags')
  form.tags = tags ? tags.replace(/^\[|\]$/g, '').split(',').map((t: string) => t.trim()).filter(Boolean) : []
  form.draft = get('draft') === 'true'
}

function buildMarkdown(): string {
  const lines = ['---']
  lines.push(`title: ${form.title}`)
  if (form.description) lines.push(`description: ${form.description}`)
  if (form.pubDate) lines.push(`pubDate: ${form.pubDate}`)
  if (form.slug) lines.push(`slug: ${form.slug}`)
  if (form.category) lines.push(`category: ${form.category}`)
  if (form.tags.length) lines.push(`tags: [${form.tags.join(', ')}]`)
  lines.push(`draft: ${form.draft}`)
  lines.push('---', '', body.value)
  return lines.join('\n')
}

async function load() {
  if (!filePath.value) return
  loading.value = true
  try {
    const data = await getContentFile(filePath.value)
    parseFrontmatter(data.content)
    status.value = data.status || ''
    if (!commitMessage.value) commitMessage.value = `content: update ${form.slug || filePath.value}`
  } catch {
    backendReady.value = false
  } finally {
    loading.value = false
  }
}

async function runValidate() {
  validation.value = null
  try {
    const res = await validateContent({ path: filePath.value, content: buildMarkdown() })
    validation.value = res
  } catch {
    backendReady.value = false
    ElMessage.warning('后端校验接口未就绪')
  }
}

async function save(isDraft: boolean) {
  if (!form.title) {
    ElMessage.error('标题不能为空')
    return
  }
  const content = buildMarkdown()
  const path = filePath.value || `blog/${form.category || '未分类'}/${form.pubDate || ''}-${form.slug || 'untitled'}.md`
  const message = commitMessage.value || `content: ${isDraft ? 'draft' : 'update'} ${form.slug || path}`
  try {
    if (filePath.value) {
      const data = await updateContentFile({ path, content, message })
      status.value = data.status || ''
    } else {
      const data = await createContentFile({ path, content, message })
      filePath.value = data.path
      status.value = data.status || ''
    }
    ElMessage.success('已保存')
  } catch {
    backendReady.value = false
    ElMessage.error('保存失败：后端接口未就绪')
  }
}

async function remove() {
  if (!filePath.value) return
  await ElMessageBox.confirm('确认删除该文件？此操作会生成 Git commit', '删除确认', { type: 'warning' })
  try {
    await deleteContentFile(filePath.value)
    ElMessage.success('已删除')
    router.push('/content')
  } catch {
    backendReady.value = false
    ElMessage.error('删除失败：后端接口未就绪')
  }
}

async function onTriggerBuild() {
  try {
    const data = await triggerBuild()
    status.value = data.status
    ElMessage.success(`构建状态：${data.status}`)
  } catch {
    backendReady.value = false
    ElMessage.error('构建失败：后端接口未就绪')
  }
}

function back() {
  router.push('/content')
}

onMounted(load)
</script>

<style scoped>
.content-editor { padding: 16px; }
.editor-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
.editor-body { display: grid; grid-template-columns: 280px 1fr 1fr; gap: 16px; align-items: start; }
.form-col { border: 1px solid var(--el-border-color); border-radius: 8px; padding: 12px; }
.md-col, .preview-col { border: 1px solid var(--el-border-color); border-radius: 8px; padding: 12px; min-height: 420px; }
.col-title { font-weight: 600; margin-bottom: 8px; color: var(--el-text-color-secondary); }
.md-input :deep(.el-textarea__inner) { font-family: monospace; }
.markdown-preview { line-height: 1.7; }
.issues { margin: 4px 0 0; padding-left: 18px; }
.commit-row { margin-top: 12px; display: flex; gap: 8px; }
@media (max-width: 1100px) {
  .editor-body { grid-template-columns: 1fr; }
}
</style>
