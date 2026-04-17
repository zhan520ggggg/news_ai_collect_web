import request from '../request'
import type { ApiResponse, PagedRequest, PagedResponse } from '../request'

// 角色信息
export interface UserRole {
  roleId: string
  roleName: string | null
  roleDisplayName: string | null
}

// 用户响应DTO
export interface UserResponseDto {
  id: string
  userName: string
  email: string
  phone: string
  displayName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  roles?: UserRole[]
}

// 创建用户DTO
export interface CreateUserDto {
  userName: string
  password: string
  email: string
  phone?: string
  displayName?: string
  roleIds?: string[]
}

// 更新用户DTO
export interface UpdateUserDto {
  userName?: string
  email?: string
  phone?: string
  displayName?: string
  isActive?: boolean
  roleIds?: string[]
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