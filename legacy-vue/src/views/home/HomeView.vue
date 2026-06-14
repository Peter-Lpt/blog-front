<template>
  <div class="home-view">
    <aside class="home-sidebar">
      <Sidebar
        :article-dates="articleDates"
        :selected-date="date"
      />
    </aside>
    <div class="home-main">
      <ActiveFilters
          :keyword="keyword"
          :category-name="currentFilterType === 'category' ? configStore.categories.find(c => c.routeName === currentRouteName)?.name : undefined"
          :tag-name="currentFilterType === 'tag' ? configStore.tags.find(t => t.routeName === currentRouteName)?.name : undefined"
          :date="date"
          @remove="handleRemoveFilter"
      />
      <ArticleList :essays="essays" :total="total" :page-no="pageNo" :page-size="pageSize" @page-change="handlePageChange"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getEssayPage, getEssayDates} from '@/api/essay'
import ArticleList from '@/components/ArticleList.vue'
import Sidebar from '@/components/Sidebar.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'
import {useConfigStore} from '@/stores/config'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const essays = ref<Essay[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const categoryId = ref<string | undefined>()
const tagId = ref<string | undefined>()
const date = ref<string | undefined>()
const articleDates = ref<Record<string, number>>({})
const currentRouteName = ref<string | undefined>()
const currentFilterType = ref<'category' | 'tag' | undefined>()

async function fetchEssays() {
  const params: PageParams = {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    keyword: keyword.value || undefined,
    categoryId: categoryId.value,
    tagId: tagId.value,
    date: date.value,
  }
  const data = await getEssayPage(params) as unknown as PageResult<Essay>
  essays.value = data.records || []
  total.value = data.total || 0
}

async function fetchArticleDates() {
  try {
    articleDates.value = await getEssayDates()
  } catch {
    articleDates.value = {}
  }
}

function handlePageChange(page: number) {
  pageNo.value = page
  fetchEssays()
}

function handleRemoveFilter(type: string) {
  if (type === 'keyword') {
    keyword.value = ''
    router.replace({query: {...route.query, keyword: undefined}})
  }
  if (type === 'categoryId' || type === 'tagId') {
    categoryId.value = undefined
    tagId.value = undefined
    currentRouteName.value = undefined
    currentFilterType.value = undefined
    router.push('/')
  }
  if (type === 'date') {
    date.value = undefined
    const query = {...route.query}
    delete query.date
    router.replace({query})
  }
  pageNo.value = 1
}

watch(() => [route.params, route.query], ([params, q]) => {
  const routeName = params.routeName as string | undefined
  const routeNameStr = route.name as string

  currentRouteName.value = routeName
  keyword.value = (q.keyword as string) || ''
  date.value = q.date as string | undefined
  pageNo.value = 1

  if (routeNameStr === 'category' && routeName) {
    currentFilterType.value = 'category'
    const cat = configStore.categories.find(c => c.routeName === routeName)
    categoryId.value = cat?.categoryId
    tagId.value = undefined
  } else if (routeNameStr === 'tag' && routeName) {
    currentFilterType.value = 'tag'
    const tag = configStore.tags.find(t => t.routeName === routeName)
    tagId.value = tag?.tagId
    categoryId.value = undefined
  } else {
    currentFilterType.value = undefined
    categoryId.value = undefined
    tagId.value = undefined
  }

  fetchEssays()
}, {immediate: true})

// 页面加载时获取日历数据
fetchArticleDates()
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
