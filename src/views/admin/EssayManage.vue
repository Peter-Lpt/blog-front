<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>文章管理</h2>
      <div>
        <el-button type="success" @click="showImportDialog = true">导入 Markdown</el-button>
        <el-button type="primary" @click="openDialog()">新增文章</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="fetchList">
        <el-option label="暂存" :value="1" />
        <el-option label="已发布" :value="2" />
      </el-select>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 2 ? 'success' : 'info'">{{ row.status === 2 ? '已发布' : '暂存' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="阅读" width="80" />
      <el-table-column prop="likeCount" label="点赞" width="80" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除?" @confirm="handleDelete(row.essayId)">
            <template #reference>
              <el-button text size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > pageSize"
      :current-page="pageNo"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="(p: number) => { pageNo = p; fetchList() }"
      class="pagination"
    />

    <el-dialog v-model="dialogVisible" :title="form.essayId ? '编辑文章' : '新增文章'" width="700px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="200" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" maxlength="500" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="12" placeholder="Markdown 格式" />
        </el-form-item>
        <el-form-item label="封面图">
          <el-input v-model="form.coverImage" placeholder="图片 URL" />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="form.status">
            <el-option label="暂存" :value="1" />
            <el-option label="发布" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select v-model="form.categoryId" clearable placeholder="选择分类" style="flex: 1">
              <el-option v-for="cat in categories" :key="cat.categoryId" :label="cat.name" :value="cat.categoryId" />
            </el-select>
            <el-button type="primary" :icon="Plus" circle size="small" @click="showCatDialog = true" />
          </div>
        </el-form-item>
        <el-form-item label="标签">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select v-model="form.tagId" clearable placeholder="选择标签" style="flex: 1">
              <el-option v-for="tag in tags" :key="tag.tagId" :label="tag.name" :value="tag.tagId" />
            </el-select>
            <el-button type="primary" :icon="Plus" circle size="small" @click="showTagDialog = true" />
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showImportDialog" title="导入 Markdown 文件" width="700px" destroy-on-close>
      <el-alert title="支持上传多个 .md 文件，自动解析 Frontmatter 元数据" type="info" :closable="false" style="margin-bottom: 16px" />

      <el-form :model="importDefaults" label-width="80px" style="margin-bottom: 16px">
        <el-form-item label="默认状态">
          <el-select v-model="importDefaults.status" style="width: 120px">
            <el-option :value="1" label="暂存" />
            <el-option :value="2" label="发布" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认分类">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select v-model="importDefaults.categoryId" clearable placeholder="不指定" style="flex: 1">
              <el-option v-for="c in categories" :key="c.categoryId" :label="c.name" :value="c.categoryId" />
            </el-select>
            <el-button type="primary" :icon="Plus" circle size="small" @click="showCatDialog = true" />
          </div>
        </el-form-item>
        <el-form-item label="默认标签">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select v-model="importDefaults.tagId" clearable placeholder="不指定" style="flex: 1">
              <el-option v-for="t in tags" :key="t.tagId" :label="t.name" :value="t.tagId" />
            </el-select>
            <el-button type="primary" :icon="Plus" circle size="small" @click="showTagDialog = true" />
          </div>
        </el-form-item>
      </el-form>

      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileSelect"
        :file-list="selectedFiles"
        accept=".md,.markdown"
        multiple
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
        <template #tip>
          <div class="el-upload__tip">支持 .md / .markdown 文件，可多选或拖拽</div>
        </template>
      </el-upload>

      <div v-if="selectedFiles.length" style="margin-top: 12px">
        <el-tag
          v-for="file in selectedFiles"
          :key="file.name"
          closable
          @close="removeFile(file)"
          style="margin: 4px"
        >
          {{ file.name }}
        </el-tag>
      </div>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedFiles.length" @click="handleImport" :loading="importing">
          开始导入（{{ selectedFiles.length }} 个文件）
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCatDialog" title="新建分类" width="400px" destroy-on-close @close="newCatName = ''">
      <el-form label-width="60px">
        <el-form-item label="名称" required>
          <el-input v-model="newCatName" maxlength="50" placeholder="输入分类名称" @keyup.enter="handleCreateCategory" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCatDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateCategory" :loading="creatingCat">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTagDialog" title="新建标签" width="400px" destroy-on-close @close="newTagName = ''">
      <el-form label-width="60px">
        <el-form-item label="名称" required>
          <el-input v-model="newTagName" maxlength="50" placeholder="输入标签名称" @keyup.enter="handleCreateTag" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTag" :loading="creatingTag">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Plus } from '@element-plus/icons-vue'
import { getEssayPage, addEssay, editEssay, deleteEssay, importMarkdown } from '@/api/essay'
import { getCategoryList, addCategory } from '@/api/category'
import { getTagList, addTag } from '@/api/tag'

const list = ref<Essay[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const filterStatus = ref<number | undefined>()
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const dialogVisible = ref(false)
const saving = ref(false)
const form = ref<EssayForm>({ title: '', status: 1 })

const showImportDialog = ref(false)
const uploadRef = ref()
const selectedFiles = ref<File[]>([])
const importing = ref(false)

const importDefaults = reactive({
  status: 1,
  categoryId: undefined as string | undefined,
  tagId: undefined as string | undefined,
})

const showCatDialog = ref(false)
const showTagDialog = ref(false)
const newCatName = ref('')
const newTagName = ref('')
const creatingCat = ref(false)
const creatingTag = ref(false)

async function handleCreateCategory() {
  if (!newCatName.value.trim()) return ElMessage.warning('请输入分类名称')
  creatingCat.value = true
  try {
    const res = await addCategory({ name: newCatName.value.trim() }) as any
    const catData = await getCategoryList()
    categories.value = (catData || []) as unknown as Category[]
    form.value.categoryId = res?.categoryId || res
    importDefaults.categoryId = res?.categoryId || res
    ElMessage.success('分类创建成功')
    showCatDialog.value = false
  } finally {
    creatingCat.value = false
  }
}

async function handleCreateTag() {
  if (!newTagName.value.trim()) return ElMessage.warning('请输入标签名称')
  creatingTag.value = true
  try {
    const res = await addTag({ name: newTagName.value.trim() }) as any
    const tagData = await getTagList()
    tags.value = (tagData || []) as unknown as Tag[]
    form.value.tagId = res?.tagId || res
    importDefaults.tagId = res?.tagId || res
    ElMessage.success('标签创建成功')
    showTagDialog.value = false
  } finally {
    creatingTag.value = false
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: PageParams = { pageNo: pageNo.value, pageSize: pageSize.value, status: filterStatus.value }
    const data = await getEssayPage(params) as unknown as PageResult<Essay>
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function openDialog(row?: Essay) {
  if (row) {
    const { essayId, title, summary, content, coverImage, status, sort } = row
    form.value = { essayId, title, summary, content, coverImage, status, sort }
  } else {
    form.value = { title: '', status: 1 }
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.title) return ElMessage.warning('请输入标题')
  saving.value = true
  try {
    if (form.value.essayId) {
      await editEssay(form.value)
    } else {
      await addEssay(form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchList()
  } finally {
    saving.value = false
  }
}

async function handleDelete(essayId: string) {
  await deleteEssay(essayId)
  ElMessage.success('删除成功')
  fetchList()
}

function handleFileSelect(file: any, fileList: any[]) {
  selectedFiles.value = fileList.map(f => f.raw).filter(Boolean)
}

function removeFile(file: File) {
  selectedFiles.value = selectedFiles.value.filter(f => f !== file)
}

async function handleImport() {
  importing.value = true
  const results: string[] = []
  for (const file of selectedFiles.value) {
    try {
      const content = await file.text()
      await importMarkdown({
        content,
        status: importDefaults.status,
        categoryId: importDefaults.categoryId,
        tagId: importDefaults.tagId,
      })
      results.push(`✅ ${file.name}`)
    } catch (e: any) {
      results.push(`❌ ${file.name}: ${e.message}`)
    }
  }

  const successCount = results.filter(r => r.startsWith('✅')).length
  const failCount = results.filter(r => r.startsWith('❌')).length
  ElMessage.info(`导入完成：成功 ${successCount} 个，失败 ${failCount} 个`)

  showImportDialog.value = false
  selectedFiles.value = []
  importing.value = false
  fetchList()
}

onMounted(async () => {
  fetchList()
  const [catData, tagData] = await Promise.all([getCategoryList(), getTagList()])
  categories.value = (catData || []) as unknown as Category[]
  tags.value = (tagData || []) as unknown as Tag[]
})
</script>

<style lang="scss" scoped>
.manage-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
  }
}

.filter-bar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
