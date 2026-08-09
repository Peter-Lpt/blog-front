<template>
  <div class="friend-link-manage">
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()">新增友链</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe :header-cell-style="{ background: '#faf9f5', color: '#5d6b73', fontWeight: 600 }">
      <el-table-column prop="name" label="名称" width="160" />
      <el-table-column prop="url" label="地址" min-width="240" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row.linkId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.linkId ? '编辑友链' : '新增友链'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.url" placeholder="https://" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFriendLinkPage, addFriendLink, editFriendLink, deleteFriendLink } from '@/api/friendLink'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = reactive({
  linkId: undefined as string | undefined,
  name: '',
  url: '',
  description: '',
  status: 1,
})

async function loadList() {
  loading.value = true
  try {
    const data: any = await getFriendLinkPage({ pageNo: 1, pageSize: 100 })
    list.value = data.records || []
  } finally {
    loading.value = false
  }
}

function openDialog(row?: any) {
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, { linkId: undefined, name: '', url: '', description: '', status: 1 })
  }
  dialogVisible.value = true
}

async function save() {
  if (!form.name || !form.url) {
    ElMessage.warning('请填写名称和地址')
    return
  }
  if (form.linkId) {
    await editFriendLink(form)
  } else {
    await addFriendLink(form)
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadList()
}

async function remove(linkId: string) {
  await ElMessageBox.confirm('确定删除该友链？', '提示', { type: 'warning' })
  await deleteFriendLink(linkId)
  ElMessage.success('已删除')
  loadList()
}

onMounted(loadList)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>
