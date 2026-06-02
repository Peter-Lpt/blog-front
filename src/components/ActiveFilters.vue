<template>
  <div v-if="hasFilters" class="active-filters">
    <span class="filter-label">当前筛选：</span>
    <el-tag v-if="keyword" closable @close="$emit('remove', 'keyword')">
      关键词: {{ keyword }}
    </el-tag>
    <el-tag v-if="categoryName" closable @close="$emit('remove', 'categoryId')">
      分类: {{ categoryName }}
    </el-tag>
    <el-tag v-if="tagName" closable @close="$emit('remove', 'tagId')">
      标签: {{ tagName }}
    </el-tag>
    <el-tag v-if="date" closable @close="$emit('remove', 'date')">
      日期: {{ date }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
  keyword: string
  categoryName?: string
  tagName?: string
  date?: string
}>()

defineEmits<{
  remove: [type: string]
}>()

const hasFilters = computed(() => props.keyword || props.categoryName || props.tagName || props.date)
</script>

<style lang="scss" scoped>
.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
