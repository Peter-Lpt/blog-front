<template>
  <div class="content-editor" v-loading="loading">
    <div class="editor-toolbar">
      <el-button @click="back">← 返回目录</el-button>
      <el-tag v-if="status" :type="statusType(status)" size="small">{{ status }}</el-tag>
      <div class="spacer" />
      <el-button @click="runValidate">校验</el-button>
      <el-button type="primary" @click="save(false)">保存</el-button>
      <el-button type="warning" plain @click="save(true)">保存草稿</el-button>
      <el-button type="danger" plain @click="remove" v-if="filePath">删除</el-button>
      <el-button type="success" @click="onTriggerBuild">本地构建</el-button>
    </div>

    <el-alert
      v-if="!backendReady"
      type="warning"
      :closable="false"
      title="无法连接内容管理接口"
      description="请确认本地后端已启动，并检查当前账号是否具有 content:read/content:write 权限。"
      style="margin-bottom: 12px"
    />

    <el-alert
      v-if="validation && !validation.valid"
      type="error"
      :closable="false"
      :title="`校验未通过（${validation.errors.length} 项）`"
    >
      <ul class="issues">
        <li v-for="(error, i) in validation.errors" :key="i">{{ error }}</li>
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

    <el-collapse v-if="buildOutput" class="build-output">
      <el-collapse-item title="查看构建输出" name="output">
        <pre>{{ buildOutput }}</pre>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { dump, load as loadYaml } from 'js-yaml'
import {
  getContentFile,
  validateContent,
  createContentFile,
  updateContentFile,
  deleteContentFile,
  triggerBuild,
  type ContentStatus,
  type ValidationResult,
} from '@/api/content'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const backendReady = ref(true)
const filePath = ref((route.query.path as string) || '')
const body = ref('')
const commitMessage = ref('')
const status = ref<ContentStatus | ''>('')
const validation = ref<ValidationResult | null>(null)
const buildOutput = ref('')

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

const renderedPreview = computed(() => {
  const text = `# ${form.title || '标题预览'}\n\n${body.value}`
  return DOMPurify.sanitize(marked.parse(text) as string)
})

function parseFrontmatter(raw: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) throw new Error('Markdown 缺少合法 frontmatter')
  const frontMatter = (loadYaml(m[1]) || {}) as Record<string, unknown>
  body.value = m[2] || ''
  form.title = String(frontMatter.title || '')
  form.description = String(frontMatter.description || '')
  form.slug = String(frontMatter.slug || '')
  form.pubDate = normalizeDate(frontMatter.pubDate)
  form.category = String(frontMatter.category || '')
  form.tags = Array.isArray(frontMatter.tags) ? frontMatter.tags.map(String) : []
  form.draft = frontMatter.draft === true
}

function buildMarkdown(): string {
  const frontMatter = {
    title: form.title,
    description: form.description,
    pubDate: form.pubDate,
    slug: form.slug,
    category: form.category,
    tags: form.tags,
    draft: form.draft,
  }
  return `---\n${dump(frontMatter, { lineWidth: 100, noRefs: true }).trim()}\n---\n\n${body.value}`
}

function normalizeDate(value: unknown): string {
  if (!value) return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  return String(value).slice(0, 10)
}

async function load() {
  if (!filePath.value) return
  loading.value = true
  try {
    const data = await getContentFile(filePath.value)
    parseFrontmatter(data.content)
    status.value = 'COMMITTED'
    backendReady.value = true
    if (!commitMessage.value) commitMessage.value = `content: update ${form.slug || filePath.value}`
  } catch {
    backendReady.value = false
  } finally {
    loading.value = false
  }
}

async function runValidate() {
  validation.value = null
  status.value = 'VALIDATING'
  try {
    const res = await validateContent({ path: filePath.value, content: buildMarkdown() })
    validation.value = res
    status.value = res.valid ? 'VALIDATING' : 'FAILED'
    backendReady.value = true
  } catch {
    backendReady.value = false
    ElMessage.warning('后端校验接口未就绪')
  }
}

async function save(isDraft: boolean) {
  form.draft = isDraft
  if (!form.title || !form.slug || !form.pubDate) {
    ElMessage.error('标题、slug 和日期不能为空')
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
    backendReady.value = true
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
    await deleteContentFile(filePath.value, commitMessage.value || undefined)
    status.value = 'COMMITTED'
    backendReady.value = true
    ElMessage.success('已删除')
    router.push('/content')
  } catch {
    backendReady.value = false
    ElMessage.error('删除失败：后端接口未就绪')
  }
}

async function onTriggerBuild() {
  status.value = 'BUILDING'
  buildOutput.value = ''
  try {
    const data = await triggerBuild()
    status.value = data.status
    buildOutput.value = data.output || ''
    backendReady.value = true
    ElMessage.success(`构建状态：${data.status}`)
  } catch {
    status.value = 'FAILED'
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
.build-output { margin-top: 12px; }
.build-output pre { white-space: pre-wrap; word-break: break-word; max-height: 320px; overflow: auto; }
@media (max-width: 1100px) {
  .editor-body { grid-template-columns: 1fr; }
}
</style>
