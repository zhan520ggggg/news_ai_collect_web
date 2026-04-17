<template>
  <div class="layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside
        :class="['sidebar', { 'sidebar-collapsed': sidebarCollapsed }]"
        :width="sidebarCollapsed ? '64px' : '200px'"
      >
        <div class="logo">
          <img
            v-if="!sidebarCollapsed"
            :src="logoImg"
            class="logo-img"
            alt="logo"
          >
          <h1 v-if="!sidebarCollapsed">
            采集分析Claw
          </h1>
          <h1 v-else>
            管理
          </h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          :collapse-transition="false"
          router
          background-color="#001529"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <!-- 动态菜单渲染 -->
          <template v-if="hasDynamicMenus">
            <template
              v-for="menu in dynamicMenuItems"
              :key="menu.index"
            >
              <!-- 有子菜单的情况 -->
              <el-sub-menu
                v-if="menu.children && menu.children.length > 0"
                :index="menu.index"
              >
                <template #title>
                  <el-icon v-if="menu.icon">
                    <component :is="getIconComponent(menu.icon)" />
                  </el-icon>
                  <span>{{ menu.title }}</span>
                </template>
                <el-menu-item
                  v-for="child in menu.children"
                  :key="child.index"
                  :index="child.index"
                >
                  <el-icon v-if="child.icon">
                    <component :is="getIconComponent(child.icon)" />
                  </el-icon>
                  <template #title>
                    {{ child.title }}
                  </template>
                </el-menu-item>
              </el-sub-menu>
              <!-- 没有子菜单的情况 -->
              <el-menu-item
                v-else
                :index="menu.index"
              >
                <el-icon v-if="menu.icon">
                  <component :is="getIconComponent(menu.icon)" />
                </el-icon>
                <template #title>
                  {{ menu.title }}
                </template>
              </el-menu-item>
            </template>
          </template>
          <!-- 没有动态菜单时显示过滤后的默认菜单 -->
          <template v-else>
            <template
              v-for="menu in defaultMenuItems"
              :key="menu.index"
            >
              <!-- 子菜单 -->
              <el-sub-menu
                v-if="menu.type === 'submenu'"
                :index="menu.index"
              >
                <template #title>
                  <el-icon>
                    <component :is="getIconComponent(menu.icon)" />
                  </el-icon>
                  <span>{{ menu.title }}</span>
                </template>
                <el-menu-item
                  v-for="child in menu.children"
                  :key="child.index"
                  :index="child.index"
                >
                  <template #title>
                    {{ child.title }}
                  </template>
                </el-menu-item>
              </el-sub-menu>
              <!-- 普通菜单项 -->
              <el-menu-item
                v-else
                :index="menu.index"
              >
                <el-icon>
                  <component :is="getIconComponent(menu.icon)" />
                </el-icon>
                <template #title>
                  {{ menu.title }}
                </template>
              </el-menu-item>
            </template>
          </template>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              :icon="sidebarToggleIcon"
              circle
              @click="toggleSidebar"
            />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">
                首页
              </el-breadcrumb-item>
              <el-breadcrumb-item v-if="$route.meta.title">
                {{ $route.meta.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown>
              <div class="user-info">
                <el-avatar
                  :size="32"
                  :src="userAvatar"
                />
                <div class="user-details">
                  <span class="username">{{ username }}</span>
                  <span
                    v-if="primaryRole"
                    class="user-role"
                  >
                    <el-tag
                      size="small"
                      type="success"
                    >{{ primaryRole }}</el-tag>
                  </span>
                </div>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goProfile">
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="toggleTheme">
                    {{ theme === 'light' ? '切换到暗黑模式' : '切换到明亮模式' }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    @click="handleLogout"
                  >
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="main">
          <router-view />
        </el-main>

        <!-- 底部 -->
        <el-footer class="footer">
          © 2024 采集分析Claw. All rights reserved.
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useAppStore } from '@/store/modules/app'
import { transformMenuData, type MenuItem } from '@/utils/menu'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Fold, Expand, PieChart, User, Goods, Lock, Setting, Menu } from '@element-plus/icons-vue'

// 动态导入所有Element Plus图标
const icons = ElementPlusIconsVue

import logoImg from '@/img/logo.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const theme = computed(() => appStore.theme)

const activeMenu = computed(() => route.path)

const username = computed(() => authStore.user?.username || '管理员')
const userAvatar = 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/doubao_avatar.png'//computed(() => authStore.user?.avatar || '')
const userRoles = computed(() => authStore.roles || [])
const primaryRole = computed(() => {
  if (userRoles.value.length > 0) {
    return userRoles.value[0]
  }
  return ''
})

// 动态菜单相关计算属性 - 直接使用后端返回的菜单数据
const rawMenus = computed(() => authStore.menus || [])
const dynamicMenuItems = computed(() => {
  if (rawMenus.value.length === 0) {
    return []
  }
  // 直接转换后端返回的菜单数据为Element Plus菜单结构
  // 后端已经根据用户权限返回了有权限的菜单，前端无需再过滤
  return transformMenuData(rawMenus.value)
})

// 默认菜单项（开发阶段备用，不进行角色过滤）
// 如果后端没有返回菜单数据，显示所有默认菜单
// 页面访问权限由路由守卫控制
const defaultMenuItems = computed(() => {
  return [
    {
      index: '/dashboard',
      icon: 'PieChart',
      title: '仪表盘',
      type: 'item'
    }
  ]
})

// 检查是否有动态菜单数据
const hasDynamicMenus = computed(() => dynamicMenuItems.value.length > 0)

// 获取图标组件
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null

  const IconComponent = (icons as any)[iconName]
  return IconComponent || null
}

// 侧边栏切换按钮图标
const sidebarToggleIcon = computed(() => {
  return sidebarCollapsed.value ? Expand : Fold
})

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleTheme = () => {
  const newTheme = theme.value === 'light' ? 'dark' : 'light'
  appStore.setTheme(newTheme)
  localStorage.setItem('theme', newTheme)
}

const goProfile = () => {
  ElMessage.info('个人中心功能开发中')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  appStore.initTheme()
  appStore.initLanguage()
  // 加载本地存储的用户数据（包括菜单）
  authStore.loadUserFromStorage()

  // 调试日志 - 详细菜单数据结构
  console.log('=== 菜单数据调试信息 ===')
  console.log('用户角色:', userRoles.value)
  console.log('原始菜单数据 (rawMenus):', rawMenus.value)

  // 检查原始菜单数据的结构
  if (rawMenus.value.length > 0) {
    console.log('原始菜单数据结构分析:')
    rawMenus.value.forEach((menu, index) => {
      console.log(`菜单 ${index} (${menu.name}):`, {
        id: menu.id,
        name: menu.name,
        parentId: menu.parentId,
        route: menu.route,
        icon: menu.icon,
        hasChildren: menu.children && menu.children.length > 0,
        childrenCount: menu.children ? menu.children.length : 0,
        children: menu.children ? menu.children.map(c => ({ id: c.id, name: c.name, route: c.route })) : []
      })
    })
  }

  console.log('转换后的菜单项 (dynamicMenuItems):', dynamicMenuItems.value)

  // 检查转换后的菜单结构
  if (dynamicMenuItems.value.length > 0) {
    console.log('转换后菜单结构分析:')
    dynamicMenuItems.value.forEach((menu, index) => {
      console.log(`菜单项 ${index} (${menu.title}):`, {
        index: menu.index,
        title: menu.title,
        icon: menu.icon,
        hasChildren: menu.children && menu.children.length > 0,
        childrenCount: menu.children ? menu.children.length : 0,
        children: menu.children ? menu.children.map(c => ({ index: c.index, title: c.title })) : []
      })
    })
  }

  console.log('是否有动态菜单:', hasDynamicMenus.value)
  console.log('默认菜单项:', defaultMenuItems.value)
  console.log('=== 结束调试信息 ===')
})
</script>

<style scoped>
.layout {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #002140;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  white-space: nowrap;
}

.logo-img {
  height: 36px;
  width: 36px;
  margin-right: 8px;
  object-fit: contain;
}

.sidebar-collapsed .logo h1 {
  font-size: 14px;
}

.el-menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.username {
  font-weight: 500;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-role .el-tag {
  font-size: 10px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.footer {
  text-align: center;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>