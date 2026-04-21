<template>
  <div class="collection-monitor">
    <div class="header">
      <h1>采集执行与监控</h1>
      <div class="header-actions">
        <el-button
          type="primary"
          :icon="VideoPlay"
          @click="handleStartAll"
          :loading="starting"
        >
          启动全部采集
        </el-button>
        <el-button
          :icon="VideoPause"
          @click="handleStopAll"
          :loading="stopping"
        >
          停止全部采集
        </el-button>
        <el-button
          :icon="Refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon running">
              <el-icon :size="40"><VideoPlay /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.running }}</div>
              <div class="stat-label">运行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon :size="40"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.success }}</div>
              <div class="stat-label">今日成功</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon error">
              <el-icon :size="40"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.failed }}</div>
              <div class="stat-label">今日失败</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">采集总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-card class="task-card">
      <template #header>
        <div class="card-header">
          <span>采集任务列表</span>
          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            style="width: 120px;"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option label="运行中" value="running" />
            <el-option label="已停止" value="stopped" />
            <el-option label="等待中" value="pending" />
          </el-select>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="taskList"
      >
        <el-table-column
          prop="name"
          label="任务名称"
          min-width="200"
        />
        <el-table-column
          prop="source"
          label="采集来源"
          min-width="150"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="120"
        >
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="progress"
          label="进度"
          width="180"
        >
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="lastRunTime"
          label="上次执行"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.lastRunTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="nextRunTime"
          label="下次执行"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.nextRunTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="collectedCount"
          label="采集数量"
          width="120"
        />
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              v-if="scope.row.status !== 'running'"
              size="small"
              type="success"
              @click="handleStartTask(scope.row)"
            >
              启动
            </el-button>
            <el-button
              v-if="scope.row.status === 'running'"
              size="small"
              type="warning"
              @click="handleStopTask(scope.row)"
            >
              停止
            </el-button>
            <el-button
              size="small"
              @click="handleViewLog(scope.row)"
            >
              日志
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 日志对话框 -->
    <el-dialog
      v-model="logDialogVisible"
      :title="`${currentTask?.name || ''} - 执行日志`"
      width="800px"
    >
      <div class="log-container">
        <el-scrollbar height="400px">
          <div class="log-content">
            <div
              v-for="(log, index) in currentLogs"
              :key="index"
              class="log-item"
              :class="log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-text">{{ log.text }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <el-button @click="logDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, VideoPlay, VideoPause, CircleCheck, CircleClose, Document } from '@element-plus/icons-vue'

interface CollectionTask {
  id: string
  name: string
  source: string
  status: 'running' | 'stopped' | 'pending'
  progress: number
  lastRunTime: string | null
  nextRunTime: string | null
  collectedCount: number
}

interface LogItem {
  time: string
  text: string
  type: 'info' | 'success' | 'error' | 'warning'
}

const loading = ref(false)
const starting = ref(false)
const stopping = ref(false)
const statusFilter = ref('')
const logDialogVisible = ref(false)
const currentTask = ref<CollectionTask | null>(null)
const currentLogs = ref<LogItem[]>([])

const stats = reactive({
  running: 0,
  success: 0,
  failed: 0,
  total: 0
})

const taskList = ref<CollectionTask[]>([])

let refreshTimer: number | null = null

const mockTasks: CollectionTask[] = [
  {
    id: '1',
    name: '微博热点采集',
    source: '微博',
    status: 'running',
    progress: 65,
    lastRunTime: '2024-04-21T14:30:00',
    nextRunTime: '2024-04-21T15:00:00',
    collectedCount: 1256
  },
  {
    id: '2',
    name: '知乎热榜采集',
    source: '知乎',
    status: 'running',
    progress: 42,
    lastRunTime: '2024-04-21T14:25:00',
    nextRunTime: '2024-04-21T14:55:00',
    collectedCount: 892
  },
  {
    id: '3',
    name: '百度热搜采集',
    source: '百度',
    status: 'stopped',
    progress: 0,
    lastRunTime: '2024-04-21T12:00:00',
    nextRunTime: '2024-04-21T16:00:00',
    collectedCount: 2341
  },
  {
    id: '4',
    name: '抖音热点采集',
    source: '抖音',
    status: 'pending',
    progress: 0,
    lastRunTime: '2024-04-21T13:30:00',
    nextRunTime: '2024-04-21T15:30:00',
    collectedCount: 567
  },
  {
    id: '5',
    name: 'B站热门采集',
    source: 'B站',
    status: 'running',
    progress: 88,
    lastRunTime: '2024-04-21T14:00:00',
    nextRunTime: '2024-04-21T14:45:00',
    collectedCount: 789
  }
]

const mockLogs: LogItem[] = [
  { time: '14:30:01', text: '任务启动成功', type: 'info' },
  { time: '14:30:02', text: '开始连接数据源...', type: 'info' },
  { time: '14:30:05', text: '数据源连接成功', type: 'success' },
  { time: '14:30:06', text: '开始采集数据...', type: 'info' },
  { time: '14:30:10', text: '已采集 50 条数据', type: 'info' },
  { time: '14:30:15', text: '已采集 100 条数据', type: 'info' },
  { time: '14:30:20', text: '数据去重处理中...', type: 'info' },
  { time: '14:30:22', text: '去重完成，保留 98 条有效数据', type: 'success' },
  { time: '14:30:23', text: '数据分类中...', type: 'info' },
  { time: '14:30:25', text: '分类完成', type: 'success' },
  { time: '14:30:26', text: '数据保存中...', type: 'info' },
  { time: '14:30:30', text: '数据保存成功', type: 'success' },
  { time: '14:30:31', text: '任务执行完成', type: 'success' }
]

onMounted(() => {
  loadData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    taskList.value = [...mockTasks]
    updateStats()
    loading.value = false
  }, 500)
}

const updateStats = () => {
  stats.running = taskList.value.filter(t => t.status === 'running').length
  stats.success = 156
  stats.failed = 8
  stats.total = 5845
}

const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    taskList.value.forEach(task => {
      if (task.status === 'running' && task.progress < 100) {
        task.progress = Math.min(100, task.progress + Math.random() * 5)
      }
    })
  }, 3000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    running: 'success',
    stopped: 'info',
    pending: 'warning'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    pending: '等待中'
  }
  return map[status] || status
}

const getProgressStatus = (status: string) => {
  if (status === 'running') return undefined
  if (status === 'stopped') return 'exception'
  return 'success'
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('已刷新')
}

const handleFilterChange = () => {
  loadData()
}

const handleStartAll = () => {
  starting.value = true
  setTimeout(() => {
    taskList.value.forEach(task => {
      if (task.status !== 'running') {
        task.status = 'running'
        task.progress = 0
      }
    })
    updateStats()
    starting.value = false
    ElMessage.success('已启动全部采集任务')
  }, 1000)
}

const handleStopAll = () => {
  stopping.value = true
  setTimeout(() => {
    taskList.value.forEach(task => {
      if (task.status === 'running') {
        task.status = 'stopped'
      }
    })
    updateStats()
    stopping.value = false
    ElMessage.success('已停止全部采集任务')
  }, 1000)
}

const handleStartTask = (task: CollectionTask) => {
  task.status = 'running'
  task.progress = 0
  updateStats()
  ElMessage.success(`${task.name} 已启动`)
}

const handleStopTask = (task: CollectionTask) => {
  task.status = 'stopped'
  updateStats()
  ElMessage.success(`${task.name} 已停止`)
}

const handleViewLog = (task: CollectionTask) => {
  currentTask.value = task
  currentLogs.value = [...mockLogs]
  logDialogVisible.value = true
}
</script>

<style scoped>
.collection-monitor {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.running {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
}

.stat-icon.success {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
}

.stat-icon.error {
  background: linear-gradient(135deg, #f56c6c, #f78989);
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.task-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-container {
  background: #1e1e1e;
  border-radius: 4px;
  padding: 16px;
}

.log-content {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.log-item {
  margin-bottom: 4px;
  line-height: 1.6;
}

.log-time {
  color: #6a9955;
  margin-right: 12px;
}

.log-text {
  color: #d4d4d4;
}

.log-item.success .log-text {
  color: #4ec9b0;
}

.log-item.error .log-text {
  color: #f14c4c;
}

.log-item.warning .log-text {
  color: #dcdcaa;
}
</style>
