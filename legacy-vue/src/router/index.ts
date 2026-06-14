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
            path: '/category/:routeName',
            name: 'category',
            component: () => import('@/views/home/HomeView.vue'),
        },
        {
            path: '/tag/:routeName',
            name: 'tag',
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

// 标记是否正在验证 token，避免并发请求重复验证
let isVerifying = false

router.beforeEach(async (to, _from) => {
    if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
        const authStore = useAuthStore()

        // 无 token 直接跳转登录
        if (!authStore.isLoggedIn) {
            return '/admin/login'
        }

        // 验证 token 有效性（避免并发重复验证）
        if (!isVerifying) {
            isVerifying = true
            try {
                const valid = await authStore.verifyToken()
                if (!valid) {
                    return '/admin/login'
                }
            } finally {
                isVerifying = false
            }
        }

        // 普通用户不允许进入后台
        if (!authStore.isAdmin) {
            return '/'
        }
    }
})

export default router
