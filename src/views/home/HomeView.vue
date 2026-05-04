<template>
  <div class="home-view">
    <div class="home-main">
      <SearchBar v-model:keyword="keyword" @search="handleSearch" />
      <ActiveFilters
        :keyword="keyword"
        :category-id="categoryId"
        :tag-id="tagId"
        @remove="handleRemoveFilter"
      />
      <ArticleList :essays="essays" :total="total" :page-no="pageNo" :page-size="pageSize" @page-change="handlePageChange" />
    </div>
    <aside class="home-sidebar">
      <Sidebar />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEssayPage } from '@/api/essay'
import ArticleList from '@/components/ArticleList.vue'
import Sidebar from '@/components/Sidebar.vue'
import SearchBar from '@/components/SearchBar.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'

const route = useRoute()
const router = useRouter()

const essays = ref<Essay[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const categoryId = ref<string | undefined>()
const tagId = ref<string | undefined>()

async function fetchEssays() {
  const params: PageParams = {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    keyword: keyword.value || undefined,
    categoryId: categoryId.value,
    tagId: tagId.value,
  }
  const data = await getEssayPage(params) as unknown as PageResult<Essay>
  essays.value = data.records || []
  total.value = data.total || 0
}

function handleSearch(kw: string) {
  keyword.value = kw
  pageNo.value = 1
  fetchEssays()
}

function handlePageChange(page: number) {
  pageNo.value = page
  fetchEssays()
}

function handleRemoveFilter(type: string) {
  if (type === 'keyword') keyword.value = ''
  if (type === 'categoryId') {
    categoryId.value = undefined
    router.replace({ query: { ...route.query, categoryId: undefined } })
  }
  if (type === 'tagId') {
    tagId.value = undefined
    router.replace({ query: { ...route.query, tagId: undefined } })
  }
  pageNo.value = 1
  fetchEssays()
}

watch(() => route.query, (q) => {
  categoryId.value = q.categoryId as string | undefined
  tagId.value = q.tagId as string | undefined
  pageNo.value = 1
  fetchEssays()
}, { immediate: true })

// immediate watch 已处理初始化加载，无需 onMounted
</script>

<style lang="scss" scoped>
.home-view {
  display: flex;
  gap: 20px;
}

.home-main {
  flex: 1;
  min-width: 0;
}

.home-sidebar {
  width: 280px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .home-view {
    flex-direction: column;
  }
  .home-sidebar {
    width: 100%;
  }
}
</style>
