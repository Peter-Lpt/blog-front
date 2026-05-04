<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>友链管理</h2>
      <el-button type="primary" @click="openDialog()">新增友链</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="url" label="链接" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '可见' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除?" @confirm="handleDelete(row.linkId)">
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

    <el-dialog v-model="dialogVisible" :title="form.linkId ? '编辑友链' : '新增友链'" width="500px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="链接" required>
          <el-input v-model="form.url" maxlength="200" />
        </el-form-item>
        <el-form-item label="Logo">
          <el-input v-model="form.logo" maxlength="500" placeholder="图片 URL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" maxlength="200" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" maxlength="100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { getFriendLinkPage, addFriendLink, editFriendLink, deleteFriendLink } from '@/api/friendLink'

const list = ref<FriendLink[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const form = ref<FriendLinkForm>({ name: '', url: '', status: 1 })

async function fetchList() {
  loading.value = true
  try {
    const data = await getFriendLinkPage({ pageNo: pageNo.value, pageSize: pageSize.value }) as unknown as PageResult<FriendLink>
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function openDialog(row?: FriendLink) {
  if (row) {
    const { linkId, name, url, logo, description, email, status, sort } = row
    form.value = { linkId, name, url, logo, description, email, status, sort }
  } else {
    form.value = { name: '', url: '', status: 1 }
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name || !form.value.url) return ElMessage.warning('请填写名称和链接')
  saving.value = true
  try {
    if (form.value.linkId) {
      await editFriendLink(form.value)
    } else {
      await addFriendLink(form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchList()
  } finally {
    saving.value = false
  }
}

async function handleDelete(linkId: string) {
  await deleteFriendLink(linkId)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
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

  h2 { font-size: 18px; }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
