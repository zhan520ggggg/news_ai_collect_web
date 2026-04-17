<template>
  <div class="roles">
    <div class="header">
      <h1>角色管理</h1>
      <el-button type="primary" @click="handleAddRole">添加角色</el-button>
    </div>

    <el-card>
      <template #header>
        <div class="table-header">
          <el-input
            v-model="searchQuery"
            placeholder="搜索角色"
            style="width: 300px;"
            clearable
            @clear="resetSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <div>
            <el-button :icon="Refresh" @click="handleRefresh" />
          </div>
        </div>
      </template>
      <el-table :data="filteredRoles" v-loading="loading">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色代码" />
        <el-table-column label="菜单权限">
          <template #default="{ row }">
            <el-tag
              v-if="row.permissions && row.permissions.length > 0"
              size="small"
              type="success"
            >
              {{ row.permissions.length }} 个菜单
            </el-tag>
            <el-tag
              v-else
              size="small"
              type="info"
            >
              无菜单权限
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" @click="handleSetPermissions(row)">权限</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="500px"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色代码（英文）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 设置权限对话框 -->
    <el-dialog
      v-model="permDialogVisible"
      title="设置角色权限"
      width="700px"
    >
      <div class="permissions-container">
        <div class="permissions-tree">
          <el-tree
            ref="permTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-expand-all="true"
            :props="treeProps"
            :check-strictly="true"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存权限</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, TreeInstance } from 'element-plus'
import { rolesApi, menusApi, type AssignMenusDto } from '@/api'

const loading = ref(false)
const searchQuery = ref('')
const roleDialogVisible = ref(false)
const permDialogVisible = ref(false)
const roleDialogTitle = ref('')
const roleFormRef = ref<FormInstance>()
const permTreeRef = ref<TreeInstance>()

// 角色数据 (适配API响应)
interface RoleItem {
  id: string  // 对应roleId
  name: string  // 对应roleName
  code: string  // 对应roleDisplayName
  permissions: string[]  // 对应menuIds
}

const roles = ref<RoleItem[]>([
  {
    id: '1',
    name: '超级管理员',
    code: 'SuperAdmin',
    permissions: ['*:*:*']
  },
  {
    id: '2',
    name: '管理员',
    code: 'Admin',
    permissions: ['system:read', 'user:*', 'content:*', 'role:read']
  },
  {
    id: '3',
    name: '编辑',
    code: 'Editor',
    permissions: ['content:create', 'content:edit', 'content:view']
  },
  {
    id: '4',
    name: '审阅员',
    code: 'Reviewer',
    permissions: ['content:review', 'content:publish', 'content:view']
  },
  {
    id: '5',
    name: '观察者',
    code: 'Viewer',
    permissions: ['content:view', 'dashboard:view']
  }
])

// 角色表单
const roleForm = reactive({
  id: '',
  name: '',
  code: ''
})

const roleRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9_]*$/, message: '只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ]
}

// 权限树数据
const permissionTree = ref([
  {
    id: 'system',
    label: '系统管理',
    children: [
      { id: 'system:user', label: '用户管理', permissions: ['user:read', 'user:create', 'user:edit', 'user:delete'] },
      { id: 'system:role', label: '角色管理', permissions: ['role:read', 'role:create', 'role:edit', 'role:delete'] },
      { id: 'system:menu', label: '菜单管理', permissions: ['menu:read', 'menu:edit'] },
      { id: 'system:config', label: '系统配置', permissions: ['config:read', 'config:edit'] }
    ]
  },
  {
    id: 'content',
    label: '内容管理',
    children: [
      { id: 'content:hotspot', label: '热点管理', permissions: ['hotspot:read', 'hotspot:create', 'hotspot:edit', 'hotspot:delete', 'hotspot:publish'] },
      { id: 'content:category', label: '分类标签', permissions: ['category:read', 'category:edit', 'tag:read', 'tag:edit'] },
      { id: 'content:review', label: '内容审核', permissions: ['review:read', 'review:approve', 'review:reject'] },
      { id: 'content:archive', label: '内容归档', permissions: ['archive:read', 'archive:manage'] }
    ]
  },
  {
    id: 'analysis',
    label: '数据分析',
    children: [
      { id: 'analysis:dashboard', label: '数据看板', permissions: ['dashboard:view'] },
      { id: 'analysis:trend', label: '趋势分析', permissions: ['analysis:trend'] },
      { id: 'analysis:collection', label: '采集分析', permissions: ['analysis:collection'] },
      { id: 'analysis:operations', label: '运营分析', permissions: ['analysis:operations'] }
    ]
  },
  {
    id: 'collection',
    label: '热点采集',
    children: [
      { id: 'collection:config', label: '采集配置', permissions: ['collection:config'] },
      { id: 'collection:monitor', label: '采集监控', permissions: ['monitor:view'] },
      { id: 'collection:data', label: '采集数据', permissions: ['collection:data'] }
    ]
  }
])

const treeProps = {
  label: 'label',
  children: 'children'
}

const currentRoleId = ref('')

// 计算属性：过滤后的角色列表
const filteredRoles = computed(() => {
  if (!searchQuery.value.trim()) {
    return roles.value
  }
  const query = searchQuery.value.toLowerCase()
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(query) ||
    role.code.toLowerCase().includes(query)
  )
})

onMounted(() => {
  fetchRoles()
  fetchMenuTree()
})

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await rolesApi.getAllRoles()
    // request.ts 拦截器已处理响应，直接取 data
    if (response.data) {
      roles.value = response.data.map((roleApi) => ({
        id: roleApi.roleId || '',
        name: roleApi.roleDisplayName || '',
        code: roleApi.roleName || '',
        permissions: roleApi.menuIds || []
      }))
    }
  } catch (error) {
    console.error('获取角色失败:', error)
    ElMessage.error('获取角色失败')
  } finally {
    loading.value = false
  }
}

const fetchMenuTree = async () => {
  try {
    const response = await menusApi.getMenuTree()
    const apiResponse = response as any
    if (apiResponse.code === 0 && apiResponse.data) {
      // 转换菜单树数据为权限树格式
      const convertMenuToPermissionTree = (menus: any[]): any[] => {
        return menus.map(menu => ({
          id: menu.id,
          label: menu.name,
          children: menu.children ? convertMenuToPermissionTree(menu.children) : []
        }))
      }

      permissionTree.value = convertMenuToPermissionTree(apiResponse.data)
    }
  } catch (error) {
    console.error('获取菜单树失败:', error)
    ElMessage.error('获取菜单树失败')
    // 保持默认的权限树数据
  }
}

const handleRefresh = () => {
  fetchRoles()
}

const handleSearch = () => {
  // 搜索功能已通过计算属性实现
}

const resetSearch = () => {
  searchQuery.value = ''
}

const handleAddRole = () => {
  roleDialogTitle.value = '添加角色'
  Object.assign(roleForm, {
    id: '',
    name: '',
    code: ''
  })
  roleDialogVisible.value = true
  nextTick(() => {
    roleFormRef.value?.clearValidate()
  })
}

const handleEdit = (role: RoleItem) => {
  roleDialogTitle.value = '编辑角色'
  Object.assign(roleForm, {
    id: role.id,
    name: role.name,
    code: role.code
  })
  roleDialogVisible.value = true
  nextTick(() => {
    roleFormRef.value?.clearValidate()
  })
}

const handleSetPermissions = (role: RoleItem) => {
  currentRoleId.value = role.id
  permDialogVisible.value = true

  nextTick(() => {
    if (permTreeRef.value) {
      // 清空所有选中
      permTreeRef.value.setCheckedKeys([])

      // 为当前角色设置权限
      const checkedKeys = getPermissionKeys(role.permissions)
      permTreeRef.value.setCheckedKeys(checkedKeys)
    }
  })
}

const getPermissionKeys = (menuIds: string[]): string[] => {
  const keys: string[] = []

  // 递归查找菜单ID对应的节点ID
  const findKeys = (nodes: any[]) => {
    for (const node of nodes) {
      // 如果节点ID在menuIds数组中，则选中该节点
      if (menuIds.includes(node.id)) {
        keys.push(node.id)
      }

      if (node.children) {
        findKeys(node.children)
      }
    }
  }

  findKeys(permissionTree.value)
  return keys
}

const savePermissions = async () => {
  if (!permTreeRef.value || !currentRoleId.value) return

  const checkedKeys = permTreeRef.value.getCheckedKeys() as string[]
  loading.value = true

  try {
    const params: AssignMenusDto = {
      menuIds: checkedKeys.length > 0 ? checkedKeys : null
    }

    const response = await rolesApi.assignRoleMenus(currentRoleId.value, params)
    const apiResponse = response as any

    if (apiResponse.code === 0) {
      ElMessage.success('权限保存成功')
      permDialogVisible.value = false
      // 刷新角色列表以更新权限
      fetchRoles()
    }
  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('保存权限失败')
  } finally {
    loading.value = false
  }
}

const submitRoleForm = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 后端API: name=roleName(角色代码), displayName=roleDisplayName(显示名称)
        const params = {
          name: roleForm.code,
          displayName: roleForm.name
        }

        if (roleForm.id) {
          // 更新角色
          await rolesApi.updateRole(roleForm.id, params)
          ElMessage.success('角色更新成功')
        } else {
          // 创建角色
          await rolesApi.createRole(params)
          ElMessage.success('角色创建成功')
        }

        roleDialogVisible.value = false
        fetchRoles()
      } catch (error) {
        console.error('保存角色失败:', error)
        ElMessage.error('保存角色失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleDelete = (role: RoleItem) => {
  ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      loading.value = true
      try {
        await rolesApi.deleteRole(role.id)
        ElMessage.success('角色删除成功')
        fetchRoles()
      } catch (error) {
        console.error('删除角色失败:', error)
        ElMessage.error('删除角色失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}
</script>

<style scoped>
.roles {
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

.permissions-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.permissions-tree {
  padding: 8px 0;
}

:deep(.el-tree-node__content) {
  height: 32px;
}
</style>