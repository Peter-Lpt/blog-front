<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>评论审核</h2>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="审核状态" clearable @change="fetchList">
        <el-option label="待审核" :value="0"/>
        <el-option label="已通过" :value="1"/>
        <el-option label="已拒绝" :value="2"/>
      </el-select>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="nickname" label="昵称" width="120"/>
      <el-table-column prop="content" label="内容" show-overflow-tooltip/>
      <el-table-column label="文章" width="180">
        <template #default="{ row }">
          <a v-if="row.essayTitle" :href="'/article/' + row.essayId" target="_blank" class="essay-link">{{ row.essayTitle }}</a>
          <span v-else class="essay-id">{{ row.essayId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'">
            {{ row.status === 1 ? '已通过' : row.status === 2 ? '已拒绝' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="时间" width="170"/>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 0">
            <el-button text size="small" type="success" @click="handleAudit(row.commentId, 1)">通过</el-button>
            <el-button text size="small" type="danger" @click="handleAudit(row.commentId, 2)">拒绝</el-button>
          </template>
          <el-popconfirm title="确定删除?" @confirm="handleDelete(row.commentId)">
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
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {auditComment, deleteComment, getCommentPageWithEssay} from '@/api/comment'

interface CommentWithEssay extends Comment {
  essayTitle?: string
}

const list = ref<CommentWithEssay[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const filterStatus = ref<number | undefined>()

async function fetchList() {
  loading.value = true
  try {
    const params: PageParams = {pageNo: pageNo.value, pageSize: pageSize.value, status: filterStatus.value}
    const data = await getCommentPageWithEssay(params) as unknown as PageResult<CommentWithEssay>
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function handleAudit(commentId: string, status: number) {
  await auditComment({commentId, status})
  ElMessage.success(status === 1 ? '已通过' : '已拒绝')
  fetchList()
}

async function handleDelete(commentId: string) {
  await deleteComment(commentId)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
@use '@/styles/admin-mixins.scss' as *;

.manage-page {
  @include manage-page-container;
}

.page-header {
  @include page-header-row;
}

.filter-bar {
  @include filter-bar;
}

.pagination {
  @include pagination;
}

.essay-link {
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.essay-id {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
