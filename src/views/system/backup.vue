<template>
  <div class="backup">
    <div class="header">
      <h1>系统备份</h1>
      <div>
        <el-button
          type="primary"
          @click="handleManualBackup"
        >
          立即备份
        </el-button>
        <el-button
          :icon="Refresh"
          @click="handleRefresh"
        />
      </div>
    </div>

    <div class="content">
      <!-- 备份配置卡片 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>备份配置</span>
          </div>
        </template>
        <el-form label-width="150px">
          <el-form-item label="自动备份">
            <el-switch
              v-model="config.autoBackup"
              @change="updateConfig"
            />
          </el-form-item>
          <el-form-item label="备份频率">
            <el-select
              v-model="config.frequency"
              placeholder="请选择备份频率"
              @change="updateConfig"
            >
              <el-option
                label="每日"
                value="daily"
              />
              <el-option
                label="每周"
                value="weekly"
              />
              <el-option
                label="每月"
                value="monthly"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备份时间">
            <el-time-select
              v-model="config.backupTime"
              :picker-options="{
                start: '00:00',
                step: '00:30',
                end: '23:30'
              }"
              placeholder="选择时间"
              @change="updateConfig"
            />
          </el-form-item>
          <el-form-item label="备份保留数量">
            <el-input-number
              v-model="config.retentionCount"
              :min="1"
              :max="100"
              @change="updateConfig"
            />
            <span class="unit">个备份文件</span>
          </el-form-item>
          <el-form-item label="备份存储位置">
            <el-input
              v-model="config.storagePath"
              placeholder="请输入备份存储路径"
            />
            <el-button
              type="primary"
              link
              @click="browseStoragePath"
            >
              浏览
            </el-button>
          </el-form-item>
          <el-form-item label="备份内容">
            <el-checkbox-group
              v-model="config.backupItems"
              @change="updateConfig"
            >
              <el-checkbox value="database">
                数据库
              </el-checkbox>
              <el-checkbox value="files">
                文件系统
              </el-checkbox>
              <el-checkbox value="logs">
                系统日志
              </el-checkbox>
              <el-checkbox value="configs">
                配置文件
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="备份前通知">
            <el-switch
              v-model="config.preBackupNotification"
              @change="updateConfig"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 备份任务列表 -->
      <el-card class="tasks-card">
        <template #header>
          <div class="card-header">
            <span>备份任务列表</span>
          </div>
        </template>
        <div v-loading="tasksLoading">
          <el-table
            :data="backupTasks"
            style="width: 100%;"
            row-key="id"
          >
            <el-table-column
              prop="name"
              label="任务名称"
              width="180"
            />
            <el-table-column
              prop="type"
              label="类型"
              width="100"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.type === '手动' ? 'primary' : 'success'"
                  size="small"
                >
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="120"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.status === '成功' ? 'success' : row.status === '失败' ? 'danger' : 'info'"
                  size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="size"
              label="大小"
              width="100"
            >
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="startTime"
              label="开始时间"
              width="160"
            />
            <el-table-column
              prop="endTime"
              label="结束时间"
              width="160"
            />
            <el-table-column
              prop="duration"
              label="耗时"
              width="100"
            >
              <template #default="{ row }">
                {{ formatDuration(row.duration) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="200"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  link
                  :disabled="row.status !== '成功'"
                  @click="handleDownload(row)"
                >
                  下载
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  link
                  :disabled="row.status !== '成功'"
                  @click="handleRestore(row)"
                >
                  恢复
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  link
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalTasks"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-card>

      <!-- 手动备份对话框 -->
      <el-dialog
        v-model="manualBackupDialogVisible"
        title="手动备份"
        width="500px"
      >
        <el-form label-width="100px">
          <el-form-item label="备份名称">
            <el-input
              v-model="manualBackupForm.name"
              placeholder="请输入备份名称"
            />
          </el-form-item>
          <el-form-item label="备份描述">
            <el-input
              v-model="manualBackupForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入备份描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="备份内容">
            <el-checkbox-group v-model="manualBackupForm.items">
              <el-checkbox value="database">
                数据库
              </el-checkbox>
              <el-checkbox value="files">
                文件系统
              </el-checkbox>
              <el-checkbox value="logs">
                系统日志
              </el-checkbox>
              <el-checkbox value="configs">
                配置文件
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="立即备份">
            <el-switch v-model="manualBackupForm.immediate" />
          </el-form-item>
          <el-form-item
            v-if="!manualBackupForm.immediate"
            label="计划时间"
          >
            <el-date-picker
              v-model="manualBackupForm.scheduledTime"
              type="datetime"
              placeholder="选择计划执行时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="manualBackupDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="backupLoading"
              @click="submitManualBackup"
            >开始备份</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tasksLoading = ref(false)
const backupLoading = ref(false)
const manualBackupDialogVisible = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(25)

// 备份配置
const config = reactive({
  autoBackup: true,
  frequency: 'daily',
  backupTime: '02:00',
  retentionCount: 30,
  storagePath: '/data/backups',
  backupItems: ['database', 'files'],
  preBackupNotification: true
})

// 手动备份表单
const manualBackupForm = reactive({
  name: '',
  description: '',
  items: ['database', 'files'],
  immediate: true,
  scheduledTime: ''
})

// 备份任务数据
interface BackupTask {
  id: string
  name: string
  type: string
  status: string
  size: number
  startTime: string
  endTime: string
  duration: number
  description?: string
}

const backupTasks = ref<BackupTask[]>([
  {
    id: '1',
    name: '系统完整备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 250, // 250MB
    startTime: '2026-04-16 02:00:00',
    endTime: '2026-04-16 02:15:30',
    duration: 15.5 * 60, // 15.5分钟
    description: '每日自动完整备份'
  },
  {
    id: '2',
    name: '数据库增量备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 50, // 50MB
    startTime: '2026-04-16 12:30:00',
    endTime: '2026-04-16 12:35:15',
    duration: 5.25 * 60, // 5.25分钟
    description: '午间增量备份'
  },
  {
    id: '3',
    name: '配置文件备份',
    type: '手动',
    status: '成功',
    size: 1024 * 1024 * 10, // 10MB
    startTime: '2026-04-15 14:20:00',
    endTime: '2026-04-15 14:22:30',
    duration: 2.5 * 60, // 2.5分钟
    description: '配置修改前的备份'
  },
  {
    id: '4',
    name: '系统完整备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 245, // 245MB
    startTime: '2026-04-15 02:00:00',
    endTime: '2026-04-15 02:13:45',
    duration: 13.75 * 60, // 13.75分钟
    description: '每日自动完整备份'
  },
  {
    id: '5',
    name: '完整系统恢复点',
    type: '手动',
    status: '失败',
    size: 0,
    startTime: '2026-04-14 16:45:00',
    endTime: '2026-04-14 16:50:20',
    duration: 5.33 * 60, // 5.33分钟
    description: '磁盘空间不足导致备份失败'
  },
  {
    id: '6',
    name: '数据库增量备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 48, // 48MB
    startTime: '2026-04-14 12:30:00',
    endTime: '2026-04-14 12:34:50',
    duration: 4.83 * 60, // 4.83分钟
    description: '午间增量备份'
  },
  {
    id: '7',
    name: '系统完整备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 238, // 238MB
    startTime: '2026-04-14 02:00:00',
    endTime: '2026-04-14 02:12:30',
    duration: 12.5 * 60, // 12.5分钟
    description: '每日自动完整备份'
  },
  {
    id: '8',
    name: '日志归档备份',
    type: '手动',
    status: '成功',
    size: 1024 * 1024 * 85, // 85MB
    startTime: '2026-04-13 18:00:00',
    endTime: '2026-04-13 18:06:15',
    duration: 6.25 * 60, // 6.25分钟
    description: '周度日志归档'
  },
  {
    id: '9',
    name: '数据库增量备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 52, // 52MB
    startTime: '2026-04-13 12:30:00',
    endTime: '2026-04-13 12:35:45',
    duration: 5.75 * 60, // 5.75分钟
    description: '午间增量备份'
  },
  {
    id: '10',
    name: '系统完整备份',
    type: '自动',
    status: '成功',
    size: 1024 * 1024 * 232, // 232MB
    startTime: '2026-04-13 02:00:00',
    endTime: '2026-04-13 02:11:20',
    duration: 11.33 * 60, // 11.33分钟
    description: '每日自动完整备份'
  }
])

onMounted(() => {
  loadBackupTasks()
})

const loadBackupTasks = () => {
  tasksLoading.value = true
  // 模拟API加载任务列表
  setTimeout(() => {
    tasksLoading.value = false
  }, 500)
}

const handleRefresh = () => {
  loadBackupTasks()
  ElMessage.success('备份任务列表已刷新')
}

const updateConfig = () => {
  // 实际项目中应该调用API保存配置
  ElMessage.success('备份配置已更新')
  console.log('备份配置:', config)
}

const browseStoragePath = () => {
  ElMessage.info('在实际项目中，这里会打开文件夹选择对话框')
  // 实际项目中需要使用原生文件对话框
}

const handleManualBackup = () => {
  manualBackupForm.name = `手动备份_${new Date().toLocaleDateString().replace(/\//g, '-')}`
  manualBackupForm.description = ''
  manualBackupForm.items = [...config.backupItems]
  manualBackupForm.immediate = true
  manualBackupForm.scheduledTime = ''
  manualBackupDialogVisible.value = true
}

const submitManualBackup = () => {
  if (!manualBackupForm.name.trim()) {
    ElMessage.error('请输入备份名称')
    return
  }

  if (manualBackupForm.items.length === 0) {
    ElMessage.error('请选择至少一项备份内容')
    return
  }

  backupLoading.value = true
  // 模拟API调用
  setTimeout(() => {
    backupLoading.value = false
    manualBackupDialogVisible.value = false

    // 添加新的备份任务（模拟）
    const newTask: BackupTask = {
      id: String(backupTasks.value.length + 1),
      name: manualBackupForm.name,
      type: '手动',
      status: '进行中',
      size: 0,
      startTime: new Date().toLocaleString(),
      endTime: '',
      duration: 0,
      description: manualBackupForm.description || '手动创建的备份任务'
    }

    backupTasks.value.unshift(newTask)
    totalTasks.value++

    // 模拟备份完成
    setTimeout(() => {
      const task = backupTasks.value.find(t => t.id === newTask.id)
      if (task) {
        task.status = '成功'
        task.size = 1024 * 1024 * 180
        task.endTime = new Date(Date.now() + 3 * 60 * 1000).toLocaleString()
        task.duration = 3 * 60
      }
    }, 3000)

    ElMessage.success('备份任务已开始执行')
  }, 1000)
}

const handleDownload = (row: BackupTask) => {
  if (row.status !== '成功') {
    ElMessage.error('只有成功的备份才能下载')
    return
  }

  ElMessageBox.confirm(
    `确定要下载备份文件 "${row.name}" 吗？\n文件大小: ${formatFileSize(row.size)}`,
    '下载确认',
    {
      confirmButtonText: '下载',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    ElMessage.success('开始下载备份文件（模拟）')
    // 实际项目中应该触发文件下载
  }).catch(() => {
    // 取消
  })
}

const handleRestore = (row: BackupTask) => {
  if (row.status !== '成功') {
    ElMessage.error('只有成功的备份才能用于恢复')
    return
  }

  ElMessageBox.confirm(
    `确定要使用备份 "${row.name}" 恢复系统吗？\n\n警告：此操作将覆盖当前系统数据，建议在执行前先备份当前系统！`,
    '系统恢复警告',
    {
      confirmButtonText: '确认恢复',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    ElMessage.success('系统恢复任务已开始（模拟）')
    // 实际项目中应该调用系统恢复API
  }).catch(() => {
    // 取消
  })
}

const handleDelete = (row: BackupTask) => {
  ElMessageBox.confirm(
    `确定要删除备份 "${row.name}" 吗？\n此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const index = backupTasks.value.findIndex(task => task.id === row.id)
    if (index !== -1) {
      backupTasks.value.splice(index, 1)
      totalTasks.value--
      ElMessage.success('备份已删除')
    }
  }).catch(() => {
    // 取消
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  // 实际项目中这里应该重新获取数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 实际项目中这里应该重新获取数据
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}分${secs}秒`
}
</script>

<style scoped>
.backup {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card, .tasks-card {
  border-radius: 8px;
}

.card-header {
  font-weight: 600;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>