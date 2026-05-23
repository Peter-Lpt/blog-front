import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/home/HomeView.vue'),
        },
        {
            path: '/article/:essayId',
            name: 'detail',
            component: () => import('@/views/detail/DetailView.vue'),
        },
        {
            path: '/friend-links',
            name: 'friendLinks',
            component: () => import('@/views/friend-links/FriendLinkView.vue'),
        },
        {
            path: '/admin/login',
            name: 'adminLogin',
            component: () => import('@/views/admin/LoginView.vue'),
        },
        {
            path: '/admin',
            component: () => import('@/views/admin/AdminLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    redirect: '/admin/essays',
                },
                {
                    path: 'essays',
                    name: 'adminEssays',
                    component: () => import('@/views/admin/EssayManage.vue'),
                },
                {
                    path: 'categories',
                    name: 'adminCategories',
                    component: () => import('@/views/admin/CategoryManage.vue'),
                },
                {
                    path: 'tags',
                    name: 'adminTags',
                    component: () => import('@/views/admin/TagManage.vue'),
                },
                {
                    path: 'comments',
                    name: 'adminComments',
                    component: () => import('@/views/admin/CommentManage.vue'),
                },
                {
                    path: 'friend-links',
                    name: 'adminFriendLinks',
                    component: () => import('@/views/admin/FriendLinkManage.vue'),
                },
            ],
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
})

router.beforeEach((to, _from) => {
    if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
        const authStore = useAuthStore()
        if (!authStore.isLoggedIn) {
            return '/admin/login'
        }
    }
})

export default router
