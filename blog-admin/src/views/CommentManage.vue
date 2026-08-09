<template>
  <div class="comment-manage">
    <div class="toolbar">
      <el-select v-model="filter.status" placeholder="状态筛选" @change="loadList" clearable style="width: 140px">
        <el-option label="全部" :value="undefined" />
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已拒绝" :value="2" />
      </el-select>
    </div>

    <el-table :data="list" v-loading="loading" stripe :header-cell-style="{ background: '#faf9f5', color: '#5d6b73', fontWeight: 600 }">
      <el-table-column prop="nickname" label="评论者" width="120" />
      <el-table-column prop="content" label="内容" min-width="280" show-overflow-tooltip />
      <el-table-column prop="essaySlug" label="文章 slug" width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="audit(row.commentId, 1)">通过</el-button>
          <el-button size="small" type="danger" @click="audit(row.commentId, 2)">拒绝</el-button>
          <el-button size="small" type="warning" @click="remove(row.commentId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="pageNo"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="loadList"
      style="margin-top: 16px; justify-content: center"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommentPage, auditComment, deleteComment } from '@/api/comment'

const list = ref<any[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = 10
const loading = ref(false)
const filter = reactive({ status: undefined as number | undefined })

async function loadList() {
  loading.value = true
  try {
    const data: any = await getCommentPage({
      pageNo: pageNo.value,
      pageSize,
      status: filter.status,
    })
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function audit(commentId: string, status: number) {
  await auditComment({ commentId, status })
  ElMessage.success('已操作')
  loadList()
}

async function remove(commentId: string) {
  await ElMessageBox.confirm('确定删除该评论？', '提示', { type: 'warning' })
  await deleteComment(commentId)
  ElMessage.success('已删除')
  loadList()
}

function statusType(s: number) {
  return s === 0 ? 'warning' : s === 1 ? 'success' : 'danger'
}
function statusText(s: number) {
  return s === 0 ? '待审核' : s === 1 ? '已通过' : '已拒绝'
}

onMounted(loadList)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>
