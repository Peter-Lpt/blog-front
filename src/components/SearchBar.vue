<template>
  <div class="search-bar">
    <el-input
      :model-value="keyword"
      @update:model-value="$emit('update:keyword', $event)"
      placeholder="搜索文章..."
      clearable
      @keyup.enter="$emit('search', keyword)"
    >
      <template #append>
        <el-button @click="$emit('search', keyword)">
          <el-icon><Search /></el-icon>
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

defineProps<{ keyword: string }>()
defineEmits<{
  'update:keyword': [value: string]
  search: [keyword: string]
}>()
</script>

<style lang="scss" scoped>
.search-bar {
  margin-bottom: 24px;

  :deep(.el-input-group) {
    border-radius: 20px;
    overflow: hidden;
  }

  :deep(.el-input__wrapper) {
    background: transparent;
    box-shadow: none;
    border: 1px solid var(--border-color);
    border-radius: 20px 0 0 20px;
  }

  :deep(.el-input-group__append) {
    background: transparent;
    border: 1px solid var(--border-color);
    border-left: none;
    color: var(--text-secondary);
    border-radius: 0 20px 20px 0;

    .el-button {
      color: var(--text-secondary);

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style>
