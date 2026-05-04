<template>
  <div v-if="hasFilters" class="active-filters">
    <span class="filter-label">当前筛选：</span>
    <el-tag v-if="keyword" closable @close="$emit('remove', 'keyword')">
      关键词: {{ keyword }}
    </el-tag>
    <el-tag v-if="categoryId" closable @close="$emit('remove', 'categoryId')">
      分类: {{ categoryName }}
    </el-tag>
    <el-tag v-if="tagId" closable @close="$emit('remove', 'tagId')">
      标签: {{ tagName }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'

const props = defineProps<{
  keyword: string
  categoryId?: string
  tagId?: string
}>()

defineEmits<{
  remove: [type: string]
}>()

const configStore = useConfigStore()

const hasFilters = computed(() => props.keyword || props.categoryId || props.tagId)
const categoryName = computed(() => configStore.categories.find(c => c.categoryId === props.categoryId)?.name || '')
const tagName = computed(() => configStore.tags.find(t => t.tagId === props.tagId)?.name || '')
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
