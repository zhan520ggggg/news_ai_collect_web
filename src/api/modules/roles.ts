import request from '../request'
import type { ApiResponse } from '../request'

// 角色菜单响应
export interface RoleMenuResponseDto {
  roleId: string
  roleName: string | null
  roleDisplayName: string | null
  menuIds: string[] | null
}

// 分配菜单DTO
export interface AssignMenusDto {
  menuIds: string[] | null
}

// 创建/更新角色DTO
export interface RoleDto {
  name: string
  displayName: string
}

export const rolesApi = {
  // 获取所有角色（含菜单Id列表）
  getAllRoles() {
    return request.get<ApiResponse<RoleMenuResponseDto[]>>('/api/roles')
  },

  // 获取指定角色的菜单
  getRoleMenus(id: string) {
    return request.get<ApiResponse<RoleMenuResponseDto>>(`/api/roles/${id}/menus`)
  },

  // 为角色分配菜单
  assignRoleMenus(id: string, params: AssignMenusDto) {
    return request.put<ApiResponse<RoleMenuResponseDto>>(`/api/roles/${id}/menus`, params)
  },

  // 创建角色
  createRole(params: RoleDto) {
    return request.post<ApiResponse<RoleMenuResponseDto>>('/api/roles', params)
  },

  // 更新角色
  updateRole(id: string, params: RoleDto) {
    return request.put<ApiResponse<RoleMenuResponseDto>>(`/api/roles/${id}`, params)
  },

  // 删除角色
  deleteRole(id: string) {
    return request.delete<ApiResponse<void>>(`/api/roles/${id}`)
  }
}