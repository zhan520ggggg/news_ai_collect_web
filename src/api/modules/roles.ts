import request from '../request'
import type { ApiResponse, RoleMenuResponseDto, AssignMenusDto, CreateRoleDto, UpdateRoleDto, RoleResponseDto } from '../types'

export type { RoleMenuResponseDto, AssignMenusDto, CreateRoleDto, UpdateRoleDto, RoleResponseDto } from '../types'

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
  createRole(params: CreateRoleDto) {
    return request.post<ApiResponse<RoleResponseDto>>('/api/roles', params)
  },

  // 更新角色
  updateRole(id: string, params: UpdateRoleDto) {
    return request.put<ApiResponse<RoleResponseDto>>(`/api/roles/${id}`, params)
  },

  // 删除角色
  deleteRole(id: string) {
    return request.delete<ApiResponse<void>>(`/api/roles/${id}`)
  }
}
