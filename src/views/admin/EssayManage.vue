<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>文章管理</h2>
      <el-button type="primary" @click="openDialog()">新增文章</el-button>
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
          <el-select v-model="form.categoryId" clearable placeholder="选择分类">
            <el-option v-for="cat in categories" :key="cat.categoryId" :label="cat.name" :value="cat.categoryId" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tagId" clearable placeholder="选择标签">
            <el-option v-for="tag in tags" :key="tag.tagId" :label="tag.name" :value="tag.tagId" />
          </el-select>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getEssayPage, addEssay, editEssay, deleteEssay } from '@/api/essay'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'

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
