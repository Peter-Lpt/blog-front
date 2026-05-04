<template>
  <AppHeader v-if="!isAdmin" />
  <main :class="{ 'admin-main': isAdmin }">
    <router-view />
  </main>
  <AppFooter v-if="!isAdmin" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<style lang="scss">
main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;

  &.admin-main {
    max-width: 100%;
    padding: 0;
  }
}
</style>
