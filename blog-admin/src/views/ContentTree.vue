<template>
  <div class="content-tree">
    <div class="tree-toolbar">
      <el-button type="primary" @click="createNew">新建文章</el-button>
      <el-button @click="refresh">刷新</el-button>
      <el-tag v-if="buildStatus" :type="statusType(buildStatus.status)" size="small">
        构建：{{ buildStatus.status }}
      </el-tag>
      <div class="spacer" />
      <el-button size="small" @click="showBuildStatus">查看构建状态</el-button>
    </div>

    <el-alert
      v-if="!backendReady"
      type="warning"
      :closable="false"
      title="后端内容接口尚未接入"
      description="已按 /api/admin/content/* 契约完成前端。后端 BE-005/006/007 就绪后此处即可联调，当前读取目录树会返回网络错误。"
      style="margin-bottom: 12px"
    />

    <el-tree
      v-loading="loading"
      :data="tree"
      :props="{ label: 'name', children: 'children' }"
      node-key="path"
      default-expand-all
      class="tree"
    >
      <template #default="{ node, data }">
        <span class="tree-node">
          <span class="node-name">{{ data.name }}</span>
          <el-tag v-if="data.draft" size="small" type="info">草稿</el-tag>
          <el-tag v-if="data.status" size="small" :type="statusType(data.status)">{{ data.status }}</el-tag>
          <span class="node-actions" v-if="data.type === 'file'">
            <el-button link type="primary" size="small" @click.stop="open(data)">编辑</el-button>
          </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getContentTree,
  getBuildStatus,
  type ContentNode,
  type ContentStatus,
} from '@/api/content'

const router = useRouter()
const loading = ref(false)
const backendReady = ref(true)
const tree = ref<ContentNode[]>([])
const buildStatus = ref<any>(null)

function statusType(s: string): 'success' | 'warning' | 'info' | 'danger' {
  return s === 'PREVIEWABLE' || s === 'COMMITTED'
    ? 'success'
    : s === 'FAILED'
      ? 'danger'
      : s === 'BUILDING' || s === 'VALIDATING'
        ? 'warning'
        : 'info'
}

async function refresh() {
  loading.value = true
  try {
    tree.value = await getContentTree()
  } catch {
    backendReady.value = false
    tree.value = []
  } finally {
    loading.value = false
  }
}

async function showBuildStatus() {
  try {
    buildStatus.value = await getBuildStatus()
  } catch {
    backendReady.value = false
    ElMessage.warning('构建状态接口未就绪')
  }
}

function open(data: ContentNode) {
  router.push(`/content/edit?path=${encodeURIComponent(data.path)}`)
}

function createNew() {
  router.push('/content/edit')
}

onMounted(refresh)
</script>

<style scoped>
.content-tree { padding: 16px; }
.tree-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
.tree { border: 1px solid var(--el-border-color); border-radius: 8px; padding: 8px; }
.tree-node { display: flex; align-items: center; gap: 8px; width: 100%; }
.node-name { font-weight: 500; }
.node-actions { margin-left: auto; }
</style>
