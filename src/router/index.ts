import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { ElMessage } from 'element-plus'

// 扩展路由meta类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
  }
}

// 静态路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘', requiresAuth: true }
  },
  // 热点采集模块
  {
    path: '/collection/config',
    name: 'CollectionConfig',
    component: () => import('@/views/collection/config.vue'),
    meta: { title: '采集配置', requiresAuth: true }
  },
  {
    path: '/collection/monitor',
    name: 'CollectionMonitor',
    component: () => import('@/views/collection/monitor.vue'),
    meta: { title: '采集监控', requiresAuth: true }
  },
  {
    path: '/collection/data',
    name: 'CollectionData',
    component: () => import('@/views/collection/data.vue'),
    meta: { title: '采集数据', requiresAuth: true }
  },

  // 热点管理模块
  {
    path: '/hotspot/list',
    name: 'HotspotList',
    component: () => import('@/views/hotspot/list.vue'),
    meta: { title: '热点列表', requiresAuth: true }
  },
  {
    path: '/hotspot/edit',
    name: 'HotspotEdit',
    component: () => import('@/views/hotspot/edit.vue'),
    meta: { title: '热点编辑', requiresAuth: true }
  },
  {
    path: '/hotspot/category-tag',
    name: 'HotspotCategoryTag',
    component: () => import('@/views/hotspot/category-tag.vue'),
    meta: { title: '分类标签', requiresAuth: true }
  },
  {
    path: '/hotspot/review',
    name: 'HotspotReview',
    component: () => import('@/views/hotspot/review.vue'),
    meta: { title: '热点审核', requiresAuth: true }
  },
  {
    path: '/hotspot/publish',
    name: 'HotspotPublish',
    component: () => import('@/views/hotspot/publish.vue'),
    meta: { title: '热点发布', requiresAuth: true }
  },
  {
    path: '/hotspot/archive',
    name: 'HotspotArchive',
    component: () => import('@/views/hotspot/archive.vue'),
    meta: { title: '热点归档', requiresAuth: true }
  },

  // 数据分析展示模块
  {
    path: '/data-analysis/dashboard',
    name: 'DataDashboard',
    component: () => import('@/views/data-analysis/dashboard.vue'),
    meta: { title: '数据仪表盘', requiresAuth: true }
  },
  {
    path: '/data-analysis/trend',
    name: 'DataTrend',
    component: () => import('@/views/data-analysis/trend.vue'),
    meta: { title: '趋势分析', requiresAuth: true }
  },
  {
    path: '/data-analysis/collection',
    name: 'DataCollection',
    component: () => import('@/views/data-analysis/collection.vue'),
    meta: { title: '采集分析', requiresAuth: true }
  },
  {
    path: '/data-analysis/operations',
    name: 'DataOperations',
    component: () => import('@/views/data-analysis/operations.vue'),
    meta: { title: '运营分析', requiresAuth: true }
  },

  // 系统管理模块
  {
    path: '/system/users',
    name: 'SystemUsers',
    component: () => import('@/views/system/users.vue'),
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/system/menus',
    name: 'SystemMenu',
    component: () => import('@/views/system/menu.vue'),
    meta: { title: '菜单管理', requiresAuth: true }
  },
  {
    path: '/system/role',
    name: 'SystemRole',
    component: () => import('@/views/system/role.vue'),
    meta: { title: '角色管理', requiresAuth: true }
  },
  {
    path: '/system/config',
    name: 'SystemConfig',
    component: () => import('@/views/system/config.vue'),
    meta: { title: '系统配置', requiresAuth: true }
  },
  {
    path: '/system/backup',
    name: 'SystemBackup',
    component: () => import('@/views/system/backup.vue'),
    meta: { title: '系统备份', requiresAuth: true }
  },
  {
    path: '/system/notification',
    name: 'SystemNotification',
    component: () => import('@/views/system/notification.vue'),
    meta: { title: '系统通知', requiresAuth: true }
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫：认证 + 权限检查
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 采集分析Claw`
  }

  // 不需要认证的页面直接放行
  if (!to.meta.requiresAuth) {
    return true
  }

  // 未登录则跳转登录页
  if (!isAuthenticated) {
    ElMessage.warning('请先登录')
    return { name: 'Login' }
  }

  // 已登录但菜单为空（如页面刷新场景），先从 localStorage 加载
  if (authStore.menus.length === 0) {
    authStore.loadUserFromStorage()
  }

  // 仪表盘所有登录用户均可访问，不纳入后端菜单权限校验
  if (to.path === '/dashboard') {
    return true
  }

  // 登录后的权限检查：从后端返回的菜单数据中收集所有合法路由
  const allowedRoutes = new Set<string>()
  const collectRoutes = (menus: any[]) => {
    for (const menu of menus) {
      // 收集非空 route 字段
      if (menu.route) {
        const route = menu.route.startsWith('/') ? menu.route : `/${menu.route}`
        allowedRoutes.add(route)
      }
      // 递归收集子菜单 route
      if (menu.children && menu.children.length > 0) {
        collectRoutes(menu.children)
      }
    }
  }
  collectRoutes(authStore.menus || [])

  // 如果后端没有返回任何菜单，跳转到登录页
  if (allowedRoutes.size === 0) {
    ElMessage.warning('您没有访问任何页面的权限')
    return { name: 'Login' }
  }

  // 如果目标路径不在允许的路由列表中，拦截
  if (!allowedRoutes.has(to.path)) {
    ElMessage.error('您没有访问该页面的权限')
    return { name: 'Login' }
  }

  return true
})

export default router
