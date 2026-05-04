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
}
</style>
