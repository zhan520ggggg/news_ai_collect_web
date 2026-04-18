import request from '../request'
import type { ApiResponse, PagedRequest, PagedResponse, UserResponseDto, CreateUserDto, UpdateUserDto } from '../types'

export type { UserResponseDto, CreateUserDto, UpdateUserDto } from '../types'

// 角色信息 - 为了兼容现有代码保留
export interface UserRole {
  id?: string
  roleId: string
  roleName?: string | null
  roleDisplayName?: string | null
}

export const userApi = {
  // 创建用户
  createUser(params: CreateUserDto) {
    return request.post<ApiResponse<UserResponseDto>>('/api/users', params)
  },

  // 获取单个用户
  getUser(id: string) {
    return request.get<ApiResponse<UserResponseDto>>(`/api/users/${id}`)
  },

  // 获取所有用户
  getAllUsers() {
    return request.get<ApiResponse<UserResponseDto[]>>('/api/users')
  },

  // 分页获取用户
  getUsersPaged(params: PagedRequest) {
    return request.get<ApiResponse<PagedResponse<UserResponseDto>>>('/api/users/paged', { params })
  },

  // 更新用户
  updateUser(id: string, params: UpdateUserDto) {
    return request.put<ApiResponse<UserResponseDto>>(`/api/users/${id}`, params)
  },

  // 删除用户
  deleteUser(id: string) {
    return request.delete<ApiResponse<void>>(`/api/users/${id}`)
  }
}
