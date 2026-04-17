import type { MenuItemDto } from '@/api'

// Element Plus 菜单项接口
export interface MenuItem {
  index: string
  title: string
  icon?: string
  children?: MenuItem[]
  meta?: {
    title: string
    icon?: string
  }
}

/**
 * 将后端菜单数据转换为 Element Plus 菜单结构
 * 支持两种数据结构：
 * 1. 扁平结构：所有菜单在同一数组，通过parentId关联
 * 2. 嵌套结构：顶级菜单包含children字段，形成树形结构
 * @param menuData 后端返回的菜单数据
 * @returns Element Plus 菜单项数组
 */
export function transformMenuData(menuData: MenuItemDto[]): MenuItem[] {
  if (!menuData || menuData.length === 0) {
    return []
  }

  // 判断数据结构类型
  // 检查是否有嵌套的children结构
  const hasNestedChildren = menuData.some(menu => menu.children && menu.children.length > 0)

  // 检查是否有parentId字段（扁平结构特征）
  const hasParentIds = menuData.some(menu => menu.parentId !== undefined && menu.parentId !== null)

  // 判断逻辑：如果有嵌套children，优先按嵌套结构处理
  // 否则，如果有parentId字段，按扁平结构处理
  // 如果两者都没有，按嵌套结构处理（假设已经是顶级菜单）

  if (hasNestedChildren) {
    // 嵌套结构：直接转换整个树
    console.log('transformMenuData: 检测到嵌套结构菜单数据')
    return menuData.map(menu => transformMenuItemFromNested(menu)).sort((a, b) => {
      // 尝试从原始数据获取sort字段
      const menuA = findMenuInTree(menuData, a.index)
      const menuB = findMenuInTree(menuData, b.index)
      return (menuA?.sort || 0) - (menuB?.sort || 0)
    })
  } else if (hasParentIds) {
    // 扁平结构：过滤出顶级菜单（parentId为null或undefined）
    console.log('transformMenuData: 检测到扁平结构菜单数据')
    const topLevelMenus = menuData.filter(menu => !menu.parentId)
    console.log('顶级菜单数量:', topLevelMenus.length, '总菜单数量:', menuData.length)

    // 递归转换扁平结构的菜单
    return topLevelMenus.map(menu => transformMenuItemFromFlat(menu, menuData)).sort((a, b) => {
      const menuA = menuData.find(m => m.route === a.index)
      const menuB = menuData.find(m => m.route === b.index)
      return (menuA?.sort || 0) - (menuB?.sort || 0)
    })
  } else {
    // 嵌套结构：直接转换整个树
    // 假设menuData已经是顶级菜单数组，每个菜单可能包含children
    console.log('transformMenuData: 检测到可能为嵌套结构（无parentId字段）')
    return menuData.map(menu => transformMenuItemFromNested(menu)).sort((a, b) => {
      // 尝试从原始数据获取sort字段
      const menuA = findMenuInTree(menuData, a.index)
      const menuB = findMenuInTree(menuData, b.index)
      return (menuA?.sort || 0) - (menuB?.sort || 0)
    })
  }
}

/**
 * 在菜单树中查找指定路由的菜单项
 */
function findMenuInTree(menuTree: MenuItemDto[], route: string): MenuItemDto | null {
  for (const menu of menuTree) {
    if (menu.route === route) {
      return menu
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuInTree(menu.children, route)
      if (found) return found
    }
  }
  return null
}

/**
 * 规范化路由路径，确保以 / 开头
 */
function normalizeRoute(route: string | null): string {
  if (!route) return ''
  return route.startsWith('/') ? route : `/${route}`
}

/**
 * 转换扁平结构的单个菜单项
 */
function transformMenuItemFromFlat(menu: MenuItemDto, allMenus: MenuItemDto[]): MenuItem {
  const menuItem: MenuItem = {
    index: normalizeRoute(menu.route) || `/${menu.code}`,
    title: menu.name,
    icon: mapIconName(menu.icon),
    meta: {
      title: menu.name,
      icon: menu.icon || undefined
    }
  }

  // 查找子菜单（通过parentId）
  const children = allMenus.filter(child => child.parentId === menu.id)
  if (children.length > 0) {
    menuItem.children = children
      .map(child => transformMenuItemFromFlat(child, allMenus))
      .sort((a, b) => {
        const childA = allMenus.find(m => m.route === a.index)
        const childB = allMenus.find(m => m.route === b.index)
        return (childA?.sort || 0) - (childB?.sort || 0)
      })
  }

  return menuItem
}

/**
 * 转换嵌套结构的单个菜单项
 */
function transformMenuItemFromNested(menu: MenuItemDto): MenuItem {
  const menuItem: MenuItem = {
    index: normalizeRoute(menu.route) || `/${menu.code}`,
    title: menu.name,
    icon: mapIconName(menu.icon),
    meta: {
      title: menu.name,
      icon: menu.icon || undefined
    }
  }

  // 如果有子菜单，递归转换
  if (menu.children && menu.children.length > 0) {
    menuItem.children = menu.children
      .map(child => transformMenuItemFromNested(child))
      .sort((a, b) => {
        // 在原始菜单树的children中查找对应的菜单项
        const childA = menu.children?.find(m => (m.route || `/${m.code}`) === a.index)
        const childB = menu.children?.find(m => (m.route || `/${m.code}`) === b.index)
        return (childA?.sort || 0) - (childB?.sort || 0)
      })
  }

  return menuItem
}

/**
 * 映射图标名称
 */
function mapIconName(iconName: string | null): string | undefined {
  if (!iconName) return undefined

  // 假设图标名称是有效的 Element Plus 图标，直接返回
  // 如果图标不存在，Element Plus 会处理回退
  return iconName
}