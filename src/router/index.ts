import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页仪表盘' }
      },
      {
        path: 'subjects',
        name: 'Subjects',
        component: () => import('@/views/subjects/index.vue'),
        meta: { title: '科目管理' }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/tasks/index.vue'),
        meta: { title: '学习任务' }
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: () => import('@/views/tasks/detail.vue'),
        meta: { title: '任务详情' }
      },
      {
        path: 'mistakes',
        name: 'Mistakes',
        component: () => import('@/views/mistakes/index.vue'),
        meta: { title: '错题记录' }
      },
      {
        path: 'mistakes/:id',
        name: 'MistakeDetail',
        component: () => import('@/views/mistakes/detail.vue'),
        meta: { title: '错题详情' }
      },
      {
        path: 'plans',
        name: 'Plans',
        component: () => import('@/views/plans/index.vue'),
        meta: { title: '学习计划' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '项目说明' }
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth !== false)
  const token = localStorage.getItem('yantu_token')

  if (requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login' && token) {
    return '/dashboard'
  }
})

export { routes }
export default router
