import {createRouter, createWebHistory} from 'vue-router'

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
            path: '/admin',
            component: () => import('@/views/admin/AdminLayout.vue'),
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

export default router
