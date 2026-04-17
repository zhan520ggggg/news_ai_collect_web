import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { UserResponseDto, MenuItemDto } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserResponseDto | null>(null)
  const roles = ref<string[]>([])
  const menus = ref<MenuItemDto[]>([])

  // 标准化角色名称（映射到有效的UserRole类型）
  const normalizeRole = (role: string): string => {
    if (!role) return role
    // 常见角色映射到标准角色
    const roleMap: Record<string, string> = {
      // 标准角色
      'admin': 'Admin',
      'superadmin': 'SuperAdmin',
      'user': 'User',
      // 带下划线的变体
      'super_admin': 'SuperAdmin',
      'role_admin': 'Admin',
      'role_user': 'User',
      // 其他常见变体
      'administrator': 'Admin',
      'super_administrator': 'SuperAdmin',
      'super': 'SuperAdmin',
      'normal_user': 'User',
      'regular_user': 'User',
      'standard_user': 'User',
      'manager': 'Admin',  // 经理映射为Admin
      'supervisor': 'Admin', // 主管映射为Admin
      'operator': 'User', // 操作员映射为User
      // 带数字前缀的角色
      'role_1': 'SuperAdmin',
      'role_2': 'Admin',
      'role_3': 'User'
    }
    const lowerRole = role.toLowerCase().trim()

    // 首先检查精确匹配
    if (roleMap[lowerRole]) {
      return roleMap[lowerRole]
    }

    // 检查包含关系（例如 "admin" 在 "site_admin" 中）
    if (lowerRole.includes('admin') || lowerRole.includes('administrator')) {
      if (lowerRole.includes('super')) {
        return 'SuperAdmin'
      }
      return 'Admin'
    }

    if (lowerRole.includes('user') || lowerRole.includes('member') || lowerRole.includes('guest')) {
      return 'User'
    }

    // 如果无法识别，默认映射到User（最低权限）
    console.warn(`无法识别的角色: "${role}", 默认映射到User`)
    return 'User'
  }

  // 标准化角色数组
  const normalizeRoles = (roles: string[]): string[] => {
    return roles.map(role => normalizeRole(role)).filter(role => role)
  }

  const isAuthenticated = computed(() => !!token.value)
  const userRoles = computed(() => roles.value)

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password })

      if (response.code === 0) {
        // 类型断言确保 TypeScript 知道正确的类型
        const loginData = response.data as any
        const { token: authToken, user: userData, menus, roles: rawRoles } = loginData

        // 确保 username 字段存在（兼容后端返回的 userName）
        const normalizedUserData = {
          ...userData,
          username: userData.username || userData.userName || ''
        }

        // 规范化角色
        const normalizedRoles = normalizeRoles(rawRoles || [])

        console.log('登录返回的角色数据:', {
          rawRoles: rawRoles,
          normalizedRoles: normalizedRoles
        })

        token.value = authToken
        user.value = normalizedUserData
        roles.value = normalizedRoles
        menus.value = menus || []
        localStorage.setItem('token', authToken)
        localStorage.setItem('user', JSON.stringify(normalizedUserData))

        // 如果存在菜单数据，也存储起来
        if (menus) {
          localStorage.setItem('menus', JSON.stringify(menus))
        }

        // 存储角色数据
        if (normalizedRoles && normalizedRoles.length > 0) {
          localStorage.setItem('roles', JSON.stringify(normalizedRoles))
        }

        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || '登录失败'
      }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    roles.value = []
    menus.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('menus')
    localStorage.removeItem('roles')
  }

  const loadUserFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedRoles = localStorage.getItem('roles')
    const storedMenus = localStorage.getItem('menus')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        user.value = null
      }
    }

    if (storedRoles) {
      try {
        const rawRoles = JSON.parse(storedRoles)
        roles.value = normalizeRoles(rawRoles)

        console.log('从本地存储加载的角色数据:', {
          rawRoles: rawRoles,
          normalizedRoles: roles.value
        })
      } catch {
        roles.value = []
      }
    }

    if (storedMenus) {
      try {
        menus.value = JSON.parse(storedMenus)
      } catch {
        menus.value = []
      }
    }
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      if (response.code === 0) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || '获取用户信息失败'
      }
    }
  }

  return {
    token,
    user,
    roles,
    menus,
    isAuthenticated,
    userRoles,
    login,
    logout,
    loadUserFromStorage,
    getCurrentUser
  }
})