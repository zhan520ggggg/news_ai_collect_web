<template>
  <div class="users">
    <div class="header">
      <h1>用户管理</h1>
      <el-button
        type="primary"
        @click="handleAdd"
      >
        新增用户
      </el-button>
    </div>
    <el-card>
      <template #header>
        <div class="table-header">
          <el-input
            v-model="search"
            placeholder="搜索用户"
            style="width: 300px;"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button
                :icon="Search"
                @click="handleSearch"
              />
            </template>
          </el-input>
          <div>
            <el-button
              :icon="Refresh"
              @click="handleRefresh"
            />
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="tableData"
      >
        <el-table-column
          prop="userName"
          label="用户名"
        />
        <el-table-column
          prop="displayName"
          label="显示名称"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="phone"
          label="手机号"
        />
        <el-table-column
          prop="isActive"
          label="状态"
        >
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色">
          <template #default="scope">
            <el-tag
              v-for="role in scope.row.roles"
              :key="role.roleId"
              size="small"
              type="info"
              class="role-tag"
            >
              {{ role.roleDisplayName || role.roleName }}
            </el-tag>
            <span
              v-if="!scope.row.roles || scope.row.roles.length === 0"
              class="no-role"
            >-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
        />
        <el-table-column
          label="操作"
          width="200"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item
          label="用户名"
          prop="userName"
        >
          <el-input
            v-model="userForm.userName"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          v-if="!userForm.id"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item
          label="显示名称"
          prop="displayName"
        >
          <el-input
            v-model="userForm.displayName"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="userForm.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="userForm.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%;"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.roleId"
              :label="role.roleDisplayName || role.roleName"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi, rolesApi } from '@/api'
import type { UserResponseDto, CreateUserDto, UpdateUserDto, UserRole } from '@/api'

type User = UserResponseDto

const search = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const userFormRef = ref<FormInstance>()
const roleOptions = ref<UserRole[]>([])

const tableData = ref<User[]>([])

const userForm = reactive<CreateUserDto & { id?: string; password?: string; isActive?: boolean }>({
  userName: '',
  password: '',
  email: '',
  phone: '',
  displayName: '',
  isActive: true,
  roleIds: []
})

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchData()
  fetchRoles()
})

const fetchRoles = () => {
  rolesApi.getAllRoles().then(response => {
    if (response.code === 0 && response.data) {
      roleOptions.value = response.data.map(role => ({
        roleId: role.roleId,
        roleName: role.roleName,
        roleDisplayName: role.roleDisplayName
      }))
    }
  }).catch(error => {
    console.error('获取角色列表失败:', error)
  })
}

const fetchData = () => {
  loading.value = true
  userApi.getUsersPaged({
    pageNumber: currentPage.value,
    pageSize: pageSize.value,
    search: search.value || undefined
  }).then(response => {
    if (response.code === 0) {
      tableData.value = response.data.items
      total.value = response.data.totalCount
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  }).catch(error => {
    ElMessage.error('请求失败：' + error.message)
  }).finally(() => {
    loading.value = false
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(userForm, {
    id: undefined,
    userName: '',
    password: '',
    email: '',
    phone: '',
    displayName: '',
    isActive: true,
    roleIds: []
  })
  dialogVisible.value = true
  nextTick(() => {
    userFormRef.value?.clearValidate()
  })
}

const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, {
    id: row.id,
    userName: row.userName,
    password: undefined,
    email: row.email,
    phone: row.phone,
    displayName: row.displayName || '',
    isActive: row.isActive,
    roleIds: row.roles?.map(r => r.roleId) || []
  })
  dialogVisible.value = true
  nextTick(() => {
    userFormRef.value?.clearValidate()
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定删除用户 "${row.userName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    userApi.deleteUser(row.id).then(response => {
      if (response.code === 0) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    }).catch(error => {
      ElMessage.error('删除失败：' + error.message)
    })
  }).catch(() => {
    // 取消
  })
}

const submitForm = () => {
  userFormRef.value?.validate((valid) => {
    if (valid) {
      if (userForm.id) {
        // 更新用户
        const { id, password, ...updateData } = userForm
        userApi.updateUser(id, updateData as UpdateUserDto).then(response => {
          if (response.code === 0) {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(response.message || '更新失败')
          }
        }).catch(error => {
          ElMessage.error('更新失败：' + error.message)
        })
      } else {
        // 创建用户
        const formData = { ...userForm } as CreateUserDto
        userApi.createUser(formData).then(response => {
          if (response.code === 0) {
            ElMessage.success('创建成功')
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(response.message || '创建失败')
          }
        }).catch(error => {
          ElMessage.error('创建失败：' + error.message)
        })
      }
    }
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}
</script>

<style scoped>
.users {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.role-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.no-role {
  color: #909399;
  font-size: 12px;
}
</style>