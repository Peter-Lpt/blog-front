<template>
  <el-config-provider :locale="zhCn">
    <AppHeader v-if="!isAdmin"/>
    <main :class="{ 'admin-main': isAdmin }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!isAdmin"/>
    <ThemeToggle/>
    <LoginDialog/>
  </el-config-provider>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {useRoute} from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import LoginDialog from './components/LoginDialog.vue'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>
