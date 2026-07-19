import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/views/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/comments' },
        {
          path: 'comments',
          name: 'comments',
          component: () => import('@/views/CommentManage.vue'),
        },
        {
          path: 'friend-links',
          name: 'friendLinks',
          component: () => import('@/views/FriendLinkManage.vue'),
        },
        {
          path: 'content',
          name: 'content',
          component: () => import('@/views/ContentTree.vue'),
        },
        {
          path: 'content/edit',
          name: 'contentEdit',
          component: () => import('@/views/ContentEditor.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  // 处理 OAuth 回调（URL 带 oauth_token）
  if (to.query.oauth_token) {
    const authStore = useAuthStore()
    authStore.setToken(to.query.oauth_token as string)
    return { path: to.path, query: {} }
  }

  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return '/login'
    // 验证 token 有效性
    const valid = await authStore.verifyToken().catch(() => false)
    if (!valid) return '/login'
    if (!authStore.isAdmin) return '/login'
  }
})

export default router
