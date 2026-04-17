<template>
  <div class="menus">
    <div class="header">
      <h1>菜单管理</h1>
      <div>
        <el-button @click="toggleExpand">
          {{ allExpanded ? '折叠全部' : '展开全部' }}
        </el-button>
        <el-button type="primary" @click="handleAddRoot">添加根菜单</el-button>
        <el-button :icon="Refresh" @click="handleRefresh" />
      </div>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单结构</span>
          <span class="header-tip">拖拽节点可调整顺序</span>
        </div>
      </template>
      <div v-loading="loading">
        <div class="tree-container">
          <el-tree
            ref="menuTreeRef"
            :data="menuTreeData"
            :props="treeProps"
            node-key="id"
            :expand-on-click-node="false"
            :highlight-current="true"
            :default-expand-all="false"
            :expand-on-node-click="false"
            class="menu-tree"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node" @dblclick="node.expanded = !node.expanded">
                <div class="node-info">
                  <div class="node-main">
                    <el-icon v-if="data.icon" :size="18" class="node-icon">
                      <component :is="data.icon" />
                    </el-icon>
                    <span class="node-name">{{ data.name }}</span>
                    <el-tag v-if="data.code" size="small" type="info" class="node-code">{{ data.code }}</el-tag>
                  </div>
                  <div class="node-meta">
                    <span v-if="data.route" class="node-route">{{ data.route }}</span>
                    <span v-if="data.sort !== undefined" class="node-sort">排序: {{ data.sort }}</span>
                  </div>
                </div>
                <div class="node-actions">
                  <el-button size="small" type="primary" @click="handleAddChild(data)">添加</el-button>
                  <el-button size="small" @click="handleEdit(data)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(data)">删除</el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
    >
      <el-form :model="menuForm" :rules="rules" ref="menuFormRef" label-width="80px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="menuForm.code" placeholder="请输入菜单编码（如：system.users）" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请选择或输入图标名称" clearable>
            <template #prefix>
              <el-icon v-if="menuForm.icon" :size="16">
                <component :is="menuForm.icon" />
              </el-icon>
            </template>
            <template #suffix>
              <el-popover placement="bottom-end" :width="320" trigger="click">
                <template #reference>
                  <el-button text size="small" :icon="MoreFilled" />
                </template>
                <div class="icon-picker-grid">
                  <div
                    v-for="iconName in iconList"
                    :key="iconName"
                    class="icon-item"
                    :class="{ active: menuForm.icon === iconName }"
                    @click="selectIcon(iconName)"
                  >
                    <el-icon :size="18">
                      <component :is="iconName" />
                    </el-icon>
                    <span class="icon-name">{{ iconName }}</span>
                  </div>
                </div>
              </el-popover>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="路径" prop="route">
          <el-input v-model="menuForm.route" placeholder="请输入路由路径（如：/users）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="父菜单" prop="parentId">
          <el-tree-select
            v-model="menuForm.parentId"
            :data="menuTreeData"
            :props="treeProps"
            node-key="id"
            placeholder="请选择父菜单（不选则为根菜单）"
            check-strictly
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, MoreFilled, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, TreeInstance } from 'element-plus'
import { menusApi } from '@/api'
import type { MenuTreeDto, CreateMenuDto, UpdateMenuDto } from '@/api'

// 常用 Element Plus 图标列表
const iconList = [
  'Menu', 'Setting', 'User', 'Lock', 'Goods', 'PieChart', 'Collection',
  'DataAnalysis', 'ChatDotRound', 'Document', 'HomeFilled', 'Edit', 'Delete',
  'Plus', 'Minus', 'Search', 'View', 'Hide', 'Refresh', 'Download', 'Upload',
  'Folder', 'Files', 'Picture', 'Camera', 'Bell', 'Star', 'Share', 'Link',
  'Warning', 'CircleClose', 'CircleCheck', 'InfoFilled', 'QuestionFilled',
  'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'DArrowRight', 'DArrowLeft',
  'CaretTop', 'CaretBottom', 'Expand', 'Fold', 'Sort', 'Timer', 'Calendar',
  'Phone', 'Message', 'Position', 'Service', 'Tools', 'Odometer', 'TrendCharts',
  'Sugar', 'Coffee', 'Trophy', 'Medal', 'Flag', 'Key', 'Monitor', 'Notebook'
]

const loading = ref(false)
const allExpanded = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const menuFormRef = ref<FormInstance>()
const menuTreeRef = ref<TreeInstance>()

const menuTreeData = ref<MenuTreeDto[]>([])

const menuForm = reactive<CreateMenuDto & { id?: string }>({
  name: '',
  code: '',
  icon: '',
  route: '',
  sort: 0,
  parentId: ''
})

const treeProps = {
  label: 'name',
  children: 'children'
}

const rules: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchMenuTree()
})

const fetchMenuTree = () => {
  loading.value = true
  menusApi.getMenuTree().then(response => {
    if (response.code === 0) {
      menuTreeData.value = response.data
    } else {
      ElMessage.error(response.message || '获取菜单树失败')
    }
  }).catch(error => {
    ElMessage.error('请求失败：' + error.message)
  }).finally(() => {
    loading.value = false
  })
}

const handleRefresh = () => {
  fetchMenuTree()
}

const handleNodeDblClick = (_data: any) => {
  // 双击事件由模板中的 @dblclick 处理
}

const toggleExpand = () => {
  if (!menuTreeRef.value) return
  const nodes = menuTreeRef.value.store?.nodesMap
  if (!nodes) return

  Object.values(nodes).forEach((node: any) => {
    node.expanded = !allExpanded.value
  })
  allExpanded.value = !allExpanded.value
}

const handleAddRoot = () => {
  dialogTitle.value = '添加根菜单'
  Object.assign(menuForm, {
    id: undefined,
    name: '',
    code: '',
    icon: '',
    route: '',
    sort: 0,
    parentId: ''
  })
  dialogVisible.value = true
  nextTick(() => {
    menuFormRef.value?.clearValidate()
  })
}

const selectIcon = (iconName: string) => {
  menuForm.icon = iconName
}

const handleAddChild = (data: MenuTreeDto) => {
  dialogTitle.value = '添加子菜单'
  Object.assign(menuForm, {
    id: undefined,
    name: '',
    code: '',
    icon: '',
    route: '',
    sort: 0,
    parentId: data.id
  })
  dialogVisible.value = true
  nextTick(() => {
    menuFormRef.value?.clearValidate()
  })
}

const handleEdit = (data: MenuTreeDto) => {
  dialogTitle.value = '编辑菜单'
  Object.assign(menuForm, {
    id: data.id,
    name: data.name,
    code: data.code,
    icon: data.icon,
    route: data.route,
    sort: data.sort,
    parentId: data.parentId
  })
  dialogVisible.value = true
  nextTick(() => {
    menuFormRef.value?.clearValidate()
  })
}

const handleDelete = (data: MenuTreeDto) => {
  ElMessageBox.confirm(
    `确定删除菜单 "${data.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    menusApi.deleteMenu(data.id).then(response => {
      if (response.code === 0) {
        ElMessage.success('删除成功')
        fetchMenuTree()
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
  menuFormRef.value?.validate((valid) => {
    if (valid) {
      if (menuForm.id) {
        // 更新菜单
        const { id, ...updateData } = menuForm
        menusApi.updateMenu(id, updateData as UpdateMenuDto).then(response => {
          if (response.code === 0) {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            fetchMenuTree()
          } else {
            ElMessage.error(response.message || '更新失败')
          }
        }).catch(error => {
          ElMessage.error('更新失败：' + error.message)
        })
      } else {
        // 创建菜单
        const formData = { ...menuForm }
        if (!formData.parentId) {
          delete formData.parentId
        }
        menusApi.createMenu(formData as CreateMenuDto).then(response => {
          if (response.code === 0) {
            ElMessage.success('创建成功')
            dialogVisible.value = false
            fetchMenuTree()
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
</script>

<style scoped>
.menus {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-tip {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.tree-container {
  padding: 8px 0;
  min-height: 400px;
}

.menu-tree {
  background: transparent;
}

:deep(.el-tree-node) {
  padding: 4px 0;
}

:deep(.el-tree-node__content) {
  height: auto;
  min-height: 40px;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid transparent;
  transition: all 0.2s;
}

:deep(.el-tree-node__content:hover) {
  background: #f0f7ff;
  border-color: #e6eef8;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #e6f0ff;
  border-color: #cce0ff;
}

:deep(.el-tree-node__expand-icon) {
  color: #c0c4cc;
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.node-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  color: #303133;
  flex-shrink: 0;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.node-code {
  font-size: 12px;
  flex-shrink: 0;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.node-route {
  font-family: monospace;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.node-sort {
  color: #c0c4cc;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.el-tree-node__content:hover) .node-actions {
  opacity: 1;
}

.node-actions .el-button {
  padding: 4px 8px;
}

.node-actions .el-button + .el-button {
  margin-left: 0;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;
  background: #fafafa;
  border-radius: 8px;
}

.icon-picker-grid .icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.icon-picker-grid .icon-item:hover {
  background: #fff;
  border-color: #e6eef8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.icon-picker-grid .icon-item.active {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.icon-picker-grid .icon-name {
  font-size: 10px;
  margin-top: 6px;
  color: #606266;
  line-height: 1.2;
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.icon-picker-grid .icon-item.active .icon-name {
  color: #409eff;
  font-weight: 500;
}
</style>