import request from '../request'
import type { ApiResponse, MenuTreeDto, MenuResponseDto, CreateMenuDto, UpdateMenuDto } from '../types'

export type { MenuTreeDto, MenuResponseDto, CreateMenuDto, UpdateMenuDto } from '../types'

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
