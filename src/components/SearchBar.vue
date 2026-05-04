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
  margin-bottom: 16px;

  :deep(.el-input__wrapper) {
    background: $glass-bg;
    backdrop-filter: blur($glass-blur);
    -webkit-backdrop-filter: blur($glass-blur);
    border: $glass-border;
    border-radius: $glass-radius;
    box-shadow: $glass-shadow;
  }

  :deep(.el-input-group__append) {
    background: $primary-color;
    border-color: $primary-color;
    color: #fff;
    border-radius: 0 $glass-radius $glass-radius 0;

    .el-button {
      color: #fff;

      &:hover {
        color: #fff;
      }
    }
  }
}
</style>
