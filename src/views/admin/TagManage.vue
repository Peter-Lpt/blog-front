<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="openDialog()">新增标签</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="routeName" label="路由名"/>
      <el-table-column prop="articleCount" label="文章数" width="90"/>
      <el-table-column prop="createTime" label="创建时间" width="170"/>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除?" @confirm="handleDelete(row.tagId)">
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

    <el-dialog v-model="dialogVisible" :title="form.tagId ? '编辑标签' : '新增标签'" width="400px" destroy-on-close>
      <el-form :model="form" label-width="60px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="50"/>
        </el-form-item>
        <el-form-item label="路由名">
          <el-input v-model="form.routeName" maxlength="50"/>
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
import {onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {addTag, deleteTag, editTag, getTagPage} from '@/api/tag'

const list = ref<Tag[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const form = ref<TagForm>({name: ''})

async function fetchList() {
  loading.value = true
  try {
    const data = await getTagPage({pageNo: pageNo.value, pageSize: pageSize.value}) as unknown as PageResult<Tag>
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function openDialog(row?: Tag) {
  if (row) {
    const {tagId, name, routeName} = row
    form.value = {tagId, name, routeName}
  } else {
    form.value = {name: ''}
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  saving.value = true
  try {
    if (form.value.tagId) {
      await editTag(form.value)
    } else {
      await addTag(form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchList()
  } finally {
    saving.value = false
  }
}

async function handleDelete(tagId: string) {
  await deleteTag(tagId)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.manage-page {
  background: var(--card-bg);

  border: var(--card-border);
  border-radius: var(--card-radius);
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

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
