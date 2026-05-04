import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'

export const useConfigStore = defineStore('config', () => {
  const categories = ref<Category[]>([])
  const tags = ref<Tag[]>([])

  async function loadCategories() {
    const data = await getCategoryList()
    categories.value = data as unknown as Category[]
  }

  async function loadTags() {
    const data = await getTagList()
    tags.value = data as unknown as Tag[]
  }

  async function loadAll() {
    await Promise.all([loadCategories(), loadTags()])
  }

  return { categories, tags, loadCategories, loadTags, loadAll }
})
