import request from '../request'
import type { ApiResponse } from '../request'

// 菜单树节点
export interface MenuTreeDto {
  id: string
  name: string
  code: string
  icon?: string
  route?: string
  sort: number
  parentId?: string
  children?: MenuTreeDto[]
  createdAt: string
  updatedAt: string
}

// 菜单响应
export interface MenuResponseDto {
  id: string
  name: string
  code: string
  icon?: string
  route?: string
  sort: number
  parentId?: string
  createdAt: string
  updatedAt: string
}

// 创建菜单DTO
export interface CreateMenuDto {
  name: string
  code: string
  icon?: string
  route?: string
  sort?: number
  parentId?: string
}

// 更新菜单DTO
export interface UpdateMenuDto {
  name?: string
  code?: string
  icon?: string
  route?: string
  sort?: number
  parentId?: string
}

export const menusApi = {
  // 获取完整菜单树
  getMenuTree() {
    return request.get<ApiResponse<MenuTreeDto[]>>('/api/menus/tree')
  },

  // 获取所有菜单（扁平列表）
  getAllMenus() {
    return request.get<ApiResponse<MenuResponseDto[]>>('/api/menus')
  },

  // 根据ID获取菜单
  getMenuById(id: string) {
    return request.get<ApiResponse<MenuResponseDto>>(`/api/menus/${id}`)
  },

  // 创建菜单
  createMenu(params: CreateMenuDto) {
    return request.post<ApiResponse<MenuResponseDto>>('/api/menus', params)
  },

  // 更新菜单
  updateMenu(id: string, params: UpdateMenuDto) {
    return request.put<ApiResponse<MenuResponseDto>>(`/api/menus/${id}`, params)
  },

  // 删除菜单
  deleteMenu(id: string) {
    return request.delete<ApiResponse<void>>(`/api/menus/${id}`)
  }
}