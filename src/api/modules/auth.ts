import request from '../request'
import type { ApiResponse, LoginDto, RegisterDto, LoginResponseDto, UserResponseDto } from '../types'

export type { LoginDto, RegisterDto, LoginResponseDto, UserResponseDto } from '../types'

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
