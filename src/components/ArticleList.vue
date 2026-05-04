<template>
  <div class="article-list">
    <ArticleCard v-for="essay in essays" :key="essay.essayId" :essay="essay" />
    <el-empty v-if="!essays.length" description="暂无文章" />
    <el-pagination
      v-if="total > pageSize"
      :current-page="pageNo"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="$emit('pageChange', $event)"
      class="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import ArticleCard from './ArticleCard.vue'

defineProps<{
  essays: Essay[]
  total: number
  pageNo: number
  pageSize: number
}>()

defineEmits<{
  pageChange: [page: number]
}>()
</script>

<style lang="scss" scoped>
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
