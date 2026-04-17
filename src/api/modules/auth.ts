import request from '../request'
import type { ApiResponse } from '../request'

// 登录DTO
export interface LoginDto {
  username: string
  password: string
}

// 登录响应DTO
export interface LoginResponseDto {
  token: string
  expiresAt: string
  user: UserResponseDto
  menus: MenuItemDto[]
  roles: string[]
}

// 注册DTO
export interface RegisterDto {
  username: string
  password: string
  email: string
  phone?: string
}

// 菜单项DTO
export interface MenuItemDto {
  id: string
  code: string
  name: string
  parentId: string | null
  icon: string | null
  route: string | null
  type: number
  sort: number
  children: MenuItemDto[]
}

// 用户响应DTO
export interface UserResponseDto {
  id: string
  // 兼容后端返回的 userName 和前端的 username
  username?: string
  userName?: string
  email: string
  phone?: string | null
  role?: string
  displayName?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string | null
}

export const authApi = {
  // 用户登录
  login(params: LoginDto) {
    return request.post<ApiResponse<LoginResponseDto>>('/api/auth/login', params)
  },

  // 用户注册
  register(params: RegisterDto) {
    return request.post<ApiResponse<UserResponseDto>>('/api/auth/register', params)
  },

  // 获取当前用户信息
  getCurrentUser() {
    return request.get<ApiResponse<UserResponseDto>>('/api/auth/me')
  },

  // 注销（如果需要）
  logout() {
    return request.post<ApiResponse<void>>('/api/auth/logout')
  }
}