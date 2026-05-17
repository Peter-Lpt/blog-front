<template>
  <div class="home-view">
    <aside class="home-sidebar">
      <Sidebar/>
    </aside>
    <div class="home-main">
      <ActiveFilters
          :keyword="keyword"
          :category-id="categoryId"
          :tag-id="tagId"
          @remove="handleRemoveFilter"
      />
      <ArticleList :essays="essays" :total="total" :page-no="pageNo" :page-size="pageSize" @page-change="handlePageChange"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getEssayPage} from '@/api/essay'
import ArticleList from '@/components/ArticleList.vue'
import Sidebar from '@/components/Sidebar.vue'
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

function handlePageChange(page: number) {
  pageNo.value = page
  fetchEssays()
}

function handleRemoveFilter(type: string) {
  const query = {...route.query}
  if (type === 'keyword') {
    keyword.value = ''
    delete query.keyword
  }
  if (type === 'categoryId') {
    categoryId.value = undefined
    delete query.categoryId
  }
  if (type === 'tagId') {
    tagId.value = undefined
    delete query.tagId
  }
  pageNo.value = 1
  router.replace({query})
}

watch(() => route.query, (q) => {
  keyword.value = (q.keyword as string) || ''
  categoryId.value = q.categoryId as string | undefined
  tagId.value = q.tagId as string | undefined
  pageNo.value = 1
  fetchEssays()
}, {immediate: true})
</script>

<style lang="scss" scoped>
.home-view {
  display: flex;
  gap: 48px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 0;
}

.home-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 96px;
  height: fit-content;
}

.home-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .home-view {
    flex-direction: column;
    gap: 24px;
    padding: 20px 0;
  }

  .home-sidebar {
    width: 100%;
    position: static;
  }
}
</style>
