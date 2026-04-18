// ==========================================
// 基于 Swagger 定义的统一类型
// 从 http://localhost:5293/swagger/v1/swagger.json 生成
// ==========================================

// 基础 API 响应
export interface ApiResponse<T = any> {
  code: number
  message: string | null
  data: T | null
  timestamp?: string
}

// 分页响应
export interface PagedResponse<T> {
  items: T[] | null
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

// 分页请求参数
export interface PagedRequest {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// ==========================================
// Auth 相关类型
// ==========================================

export interface LoginDto {
  userName: string
  password: string
}

export interface RegisterDto {
  userName: string
  email: string
  password: string
  displayName?: string | null
  roleIds?: string[] | null
}

export interface UserResponseDto {
  id: string
  userName: string | null
  email: string | null
  phone: string | null
  displayName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  roles: string[] | null
}

export interface MenuTreeDto {
  id: string
  code: string | null
  name: string | null
  parentId: string | null
  icon: string | null
  route: string | null
  type: number
  sort: number
  children: MenuTreeDto[] | null
}

export interface LoginResponseDto {
  token: string | null
  expiresAt: string
  user: UserResponseDto
  menus: MenuTreeDto[] | null
  roles: string[] | null
}

// ==========================================
// Users 相关类型
// ==========================================

export interface CreateUserDto {
  userName?: string | null
  email?: string | null
  phone?: string | null
  password?: string | null
  displayName?: string | null
  roleIds?: string[] | null
}

export interface UpdateUserDto {
  userName?: string | null
  email?: string | null
  phone?: string | null
  displayName?: string | null
  roleIds?: string[] | null
}

// ==========================================
// Roles 相关类型
// ==========================================

export interface RoleMenuResponseDto {
  roleId: string
  roleName: string | null
  roleDisplayName: string | null
  menuIds: string[] | null
}

export interface AssignMenusDto {
  menuIds: string[] | null
}

export interface CreateRoleDto {
  name?: string | null
  displayName?: string | null
  description?: string | null
}

export interface UpdateRoleDto {
  name?: string | null
  displayName?: string | null
  description?: string | null
}

export interface RoleResponseDto {
  id: string
  name: string | null
  displayName: string | null
  description: string | null
  createdAt: string
  updatedAt: string | null
}

// ==========================================
// Menus 相关类型
// ==========================================

export interface MenuResponseDto {
  id: string
  code: string | null
  name: string | null
  parentId: string | null
  icon: string | null
  route: string | null
  type: number
  sort: number
  visible: boolean
}

export interface CreateMenuDto {
  code?: string | null
  name?: string | null
  parentId?: string | null
  icon?: string | null
  route?: string | null
  type: number
  sort: number
  visible: boolean
}

export interface UpdateMenuDto {
  code?: string | null
  name?: string | null
  parentId?: string | null
  icon?: string | null
  route?: string | null
  type?: number | null
  sort?: number | null
  visible?: boolean | null
}

// ==========================================
// DataCollections 相关类型
// ==========================================

export interface CreateDataCollectionDto {
  title?: string | null
  time?: string | null
  content?: string | null
}

export interface DataCollectionResponseDto {
  id: string
  title: string | null
  time: string | null
  content: string | null
  createdAt: string
  updatedAt: string | null
}
