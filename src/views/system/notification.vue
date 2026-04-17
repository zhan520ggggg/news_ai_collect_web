<template>
  <div class="notification">
    <div class="header">
      <h1>系统通知</h1>
      <div>
        <el-button type="primary" @click="handleSendNotification">发送通知</el-button>
        <el-button @click="markAllAsRead">全部标记已读</el-button>
        <el-button :icon="Refresh" @click="handleRefresh" />
      </div>
    </div>

    <div class="content">
      <!-- 通知类型筛选 -->
      <div class="filter-section">
        <el-radio-group v-model="activeTab" @change="handleTabChange">
          <el-radio-button label="all">全部通知</el-radio-button>
          <el-radio-button label="unread">未读通知</el-radio-button>
          <el-radio-button label="important">重要通知</el-radio-button>
          <el-radio-button label="system">系统通知</el-radio-button>
          <el-radio-button label="user">用户消息</el-radio-button>
        </el-radio-group>
        <div class="filter-actions">
          <el-select v-model="filterType" placeholder="按类型筛选" clearable>
            <el-option label="消息提醒" value="message" />
            <el-option label="任务提醒" value="task" />
            <el-option label="系统警报" value="alert" />
            <el-option label="更新提醒" value="update" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="按状态筛选" clearable>
            <el-option label="未读" value="unread" />
            <el-option label="已读" value="read" />
            <el-option label="已处理" value="handled" />
          </el-select>
          <el-date-picker
            v-model="filterDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </div>
      </div>

      <!-- 通知列表 -->
      <el-card>
        <template #header>
          <div class="table-header">
            <span>通知列表</span>
            <span class="notification-count">
              共 {{ totalNotifications }} 条通知，其中 {{ unreadCount }} 条未读
            </span>
          </div>
        </template>
        <div v-loading="loading">
          <div v-if="filteredNotifications.length === 0" class="empty-notification">
            <el-empty description="暂无通知" />
          </div>
          <div v-else class="notification-list">
            <div
              v-for="item in paginatedNotifications"
              :key="item.id"
              class="notification-item"
              :class="{
                'notification-unread': item.status === 'unread',
                'notification-important': item.important
              }"
              @click="handleViewNotification(item)"
            >
              <div class="notification-icon">
                <el-badge :is-dot="item.status === 'unread'">
                  <el-icon :size="20" :color="getNotificationColor(item.type)">
                    <component :is="getNotificationIcon(item.type)" />
                  </el-icon>
                </el-badge>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <div class="notification-title">
                    <span class="title-text">{{ item.title }}</span>
                    <el-tag v-if="item.important" size="small" type="danger">重要</el-tag>
                    <el-tag v-if="item.status === 'unread'" size="small" type="info">未读</el-tag>
                    <el-tag size="small">{{ getTypeLabel(item.type) }}</el-tag>
                  </div>
                  <div class="notification-time">
                    {{ formatTime(item.createdAt) }}
                  </div>
                </div>
                <div class="notification-body">
                  <p class="notification-message">{{ item.message }}</p>
                  <div v-if="item.details" class="notification-details">
                    <el-collapse>
                      <el-collapse-item title="详情信息">
                        <pre>{{ item.details }}</pre>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </div>
                <div class="notification-footer">
                  <div class="notification-source">
                    发送者：{{ item.sender }}
                  </div>
                  <div class="notification-actions">
                    <el-button v-if="item.status === 'unread'" size="small" link @click.stop="markAsRead(item)">标记已读</el-button>
                    <el-button v-if="item.type === 'task'" size="small" link @click.stop="handleTaskAction(item)">查看任务</el-button>
                    <el-button v-if="item.important" size="small" link @click.stop="handleImportantAction(item)">重要处理</el-button>
                    <el-button size="small" link @click.stop="handleDelete(item)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredNotifications.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-card>

      <!-- 发送通知对话框 -->
      <el-dialog
        v-model="sendDialogVisible"
        title="发送通知"
        width="600px"
      >
        <el-form :model="sendForm" :rules="sendRules" ref="sendFormRef" label-width="100px">
          <el-form-item label="通知标题" prop="title">
            <el-input v-model="sendForm.title" placeholder="请输入通知标题" />
          </el-form-item>
          <el-form-item label="通知内容" prop="message">
            <el-input
              v-model="sendForm.message"
              type="textarea"
              :rows="4"
              placeholder="请输入通知内容"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="接收对象" prop="recipients">
            <el-select
              v-model="sendForm.recipients"
              multiple
              placeholder="请选择接收对象"
            >
              <el-option value="all" label="所有用户" />
              <el-option value="superadmin" label="超级管理员" />
              <el-option value="admin" label="管理员" />
              <el-option value="editor" label="编辑" />
              <el-option value="reviewer" label="审阅员" />
              <el-option value="viewer" label="观察者" />
            </el-select>
          </el-form-item>
          <el-form-item label="通知类型" prop="type">
            <el-radio-group v-model="sendForm.type">
              <el-radio label="message">消息提醒</el-radio>
              <el-radio label="task">任务提醒</el-radio>
              <el-radio label="alert">系统警报</el-radio>
              <el-radio label="update">更新提醒</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="重要程度">
            <el-switch
              v-model="sendForm.important"
              active-text="重要通知"
              inactive-text="普通通知"
            />
          </el-form-item>
          <el-form-item label="附件">
            <el-upload
              action="#"
              multiple
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="sendForm.files"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持上传图片、文档等附件，单个文件不超过10MB</div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item label="发送方式">
            <el-checkbox-group v-model="sendForm.channels">
              <el-checkbox value="inapp">站内通知</el-checkbox>
              <el-checkbox value="email">邮件通知</el-checkbox>
              <el-checkbox value="sms">短信通知</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="定时发送">
            <el-switch v-model="sendForm.scheduled" />
            <div v-if="sendForm.scheduled" style="margin-top: 8px;">
              <el-date-picker
                v-model="sendForm.scheduledTime"
                type="datetime"
                placeholder="选择发送时间"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="sendDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitSendForm" :loading="sendLoading">立即发送</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Message, Bell, CircleCheck, Warning } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'

const loading = ref(false)
const sendLoading = ref(false)
const activeTab = ref('all')
const sendDialogVisible = ref(false)
const sendFormRef = ref<FormInstance>()

// 筛选条件
const filterType = ref('')
const filterStatus = ref('')
const filterDateRange = ref<[Date, Date] | null>(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 发送通知表单
const sendForm = reactive({
  title: '',
  message: '',
  recipients: [] as string[],
  type: 'message',
  important: false,
  files: [] as UploadFile[],
  channels: ['inapp'] as string[],
  scheduled: false,
  scheduledTime: ''
})

const sendRules: FormRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ],
  recipients: [
    { required: true, message: '请选择接收对象', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ]
}

// 通知数据
interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  status: string
  important: boolean
  sender: string
  createdAt: string
  readAt?: string
  details?: string
  source?: string
}

const notifications = ref<NotificationItem[]>([
  {
    id: '1',
    title: '系统更新提醒',
    message: '系统计划于今晚 01:00 进行维护更新，预计耗时 2 小时，请提前保存工作。',
    type: 'update',
    status: 'read',
    important: true,
    sender: '系统管理员',
    createdAt: '2026-04-16 08:30:00',
    details: '更新内容：\n1. 优化数据采集算法\n2. 修复已知问题\n3. 提升系统性能'
  },
  {
    id: '2',
    title: '新的热点待审核',
    message: '用户 "张三" 提交了一条新的热点内容，请及时审核。',
    type: 'task',
    status: 'unread',
    important: false,
    sender: '热点采集系统',
    createdAt: '2026-04-16 10:15:00',
    details: '热点标题：XXX事件爆发\n提交时间：2026-04-16 10:10:00\n审核优先级：高'
  },
  {
    id: '3',
    title: '数据备份完成',
    message: '昨日的系统数据备份已完成，备份文件大小：235MB，备份时间：15分钟。',
    type: 'message',
    status: 'read',
    important: false,
    sender: '系统守护进程',
    createdAt: '2026-04-16 02:15:00',
    details: '备份文件：backup_2026-04-15_0200.zip\n备份内容：数据库、配置文件\n存储路径：/backups/daily/'
  },
  {
    id: '4',
    title: '服务器CPU使用率过高',
    message: '检测到Web服务器CPU使用率超过90%，可能存在性能瓶颈，请检查。',
    type: 'alert',
    status: 'unread',
    important: true,
    sender: '监控系统',
    createdAt: '2026-04-16 11:05:00',
    details: '服务器：web01\nCPU使用率：92%\n持续时间：10分钟\n建议：检查应用负载或扩容'
  },
  {
    id: '5',
    title: '欢迎新用户加入',
    message: '新用户 "李四" 已通过审核，角色：编辑，请确认权限分配。',
    type: 'message',
    status: 'read',
    important: false,
    sender: '用户管理系统',
    createdAt: '2026-04-15 16:45:00',
    details: '用户名：lisi\n邮箱：lisi@example.com\n注册时间：2026-04-15 16:30:00'
  },
  {
    id: '6',
    title: '采集任务异常',
    message: '微博采集器 #3 连续失败 5 次，可能网络连接异常，请检查。',
    type: 'alert',
    status: 'unread',
    important: true,
    sender: '采集监控系统',
    createdAt: '2026-04-15 14:20:00',
    details: '采集器ID：weibo-collector-3\n异常时间：2026-04-15 14:10 - 14:20\n错误信息：网络连接超时'
  },
  {
    id: '7',
    title: '月度报告已生成',
    message: '2026年4月份运营分析报告已生成，请在报表中心查看详细数据。',
    type: 'message',
    status: 'read',
    important: false,
    sender: '数据分析系统',
    createdAt: '2026-04-15 09:00:00',
    details: '报告名称：2026年4月运营分析\n生成时间：2026-04-15 08:45:00\n包含数据：用户活跃度、热点趋势、运营指标'
  },
  {
    id: '8',
    title: '系统许可证即将到期',
    message: '系统商业许可证将于 2026-06-01 过期，请及时续费。',
    type: 'task',
    status: 'unread',
    important: true,
    sender: '授权管理系统',
    createdAt: '2026-04-14 15:30:00',
    details: '许可证ID：LIC-2025-001\n到期时间：2026-06-01 00:00:00\n用户数：100\n有效期：1年'
  },
  {
    id: '9',
    title: '安全扫描提醒',
    message: '每日系统安全扫描已完成，发现 2 个低风险问题，建议及时修复。',
    type: 'message',
    status: 'read',
    important: false,
    sender: '安全监控中心',
    createdAt: '2026-04-14 10:00:00',
    details: '扫描时间：2026-04-14 03:00:00\n发现风险：\n1. 弱密码用户：3个\n2. 未更新组件：1个'
  },
  {
    id: '10',
    title: '数据库连接池接近上限',
    message: '数据库连接池使用率达到 85%，接近配置上限，建议优化查询或增加连接数。',
    type: 'alert',
    status: 'read',
    important: true,
    sender: '数据库监控',
    createdAt: '2026-04-13 18:15:00',
    details: '数据库：mysql-prod\n当前连接数：85/100\n峰值时间：18:00-18:15\n建议优化：长期查询、数据库连接复用'
  }
])

onMounted(() => {
  loadNotifications()
})

const loadNotifications = () => {
  loading.value = true
  // 模拟API加载通知数据
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleRefresh = () => {
  loadNotifications()
  ElMessage.success('通知列表已刷新')
}

const handleTabChange = (tab: string) => {
  currentPage.value = 1
}

// 计算属性：总通知数和未读数
const totalNotifications = computed(() => notifications.value.length)
const unreadCount = computed(() => notifications.value.filter(n => n.status === 'unread').length)

// 计算属性：筛选后的通知
const filteredNotifications = computed(() => {
  let result = notifications.value

  // 按标签筛选
  if (activeTab.value === 'unread') {
    result = result.filter(n => n.status === 'unread')
  } else if (activeTab.value === 'important') {
    result = result.filter(n => n.important)
  } else if (activeTab.value === 'system') {
    result = result.filter(n => ['alert', 'update'].includes(n.type))
  } else if (activeTab.value === 'user') {
    result = result.filter(n => !['alert', 'update'].includes(n.type))
  }

  // 按类型筛选
  if (filterType.value) {
    result = result.filter(n => n.type === filterType.value)
  }

  // 按状态筛选
  if (filterStatus.value) {
    result = result.filter(n => n.status === filterStatus.value)
  }

  // 按时间范围筛选
  if (filterDateRange.value) {
    const [start, end] = filterDateRange.value
    result = result.filter(n => {
      const time = new Date(n.createdAt).getTime()
      return time >= start.getTime() && time <= end.getTime()
    })
  }

  // 按时间倒序排序
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 计算属性：分页后的通知
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotifications.value.slice(start, end)
})

const getNotificationIcon = (type: string) => {
  const icons: Record<string, any> = {
    message: Message,
    task: CircleCheck,
    alert: Warning,
    update: Bell
  }
  return icons[type] || Message
}

const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    message: '#409eff',
    task: '#67c23a',
    alert: '#f56c6c',
    update: '#e6a23c'
  }
  return colors[type] || '#909399'
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    message: '消息提醒',
    task: '任务提醒',
    alert: '系统警报',
    update: '更新提醒'
  }
  return labels[type] || '未知'
}

const formatTime = (timestamp: string): string => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diff / (1000 * 60))
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

const handleSendNotification = () => {
  sendDialogVisible.value = true
  // 重置表单
  Object.assign(sendForm, {
    title: '',
    message: '',
    recipients: [],
    type: 'message',
    important: false,
    files: [],
    channels: ['inapp'],
    scheduled: false,
    scheduledTime: ''
  })
}

const handleFileChange = (file: UploadFile, fileList: UploadFiles) => {
  sendForm.files = fileList as UploadFile[]
}

const handleFileRemove = (file: UploadFile, fileList: UploadFiles) => {
  sendForm.files = fileList as UploadFile[]
}

const submitSendForm = () => {
  if (!sendFormRef.value) return

  sendFormRef.value.validate((valid) => {
    if (valid) {
      sendLoading.value = true

      // 模拟API发送通知
      setTimeout(() => {
        sendLoading.value = false
        sendDialogVisible.value = false

        // 添加发送的通知到列表（模拟）
        const newNotification: NotificationItem = {
          id: String(notifications.value.length + 1),
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
          status: 'unread',
          important: sendForm.important,
          sender: '当前用户',
          createdAt: new Date().toISOString(),
          details: `发送方式：${sendForm.channels.join(', ')}\n接收对象：${sendForm.recipients.join(', ')}`
        }

        notifications.value.unshift(newNotification)
        ElMessage.success('通知发送成功')
      }, 1500)
    }
  })
}

const markAllAsRead = () => {
  ElMessageBox.confirm(
    '确定要将所有未读通知标记为已读吗？',
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    notifications.value.forEach(notification => {
      if (notification.status === 'unread') {
        notification.status = 'read'
        notification.readAt = new Date().toISOString()
      }
    })
    ElMessage.success('所有通知已标记为已读')
  }).catch(() => {
    // 取消
  })
}

const handleViewNotification = (item: NotificationItem) => {
  if (item.status === 'unread') {
    item.status = 'read'
    item.readAt = new Date().toISOString()
  }

  // 在实际应用中，这里可以显示通知详情弹窗或跳转到相关页面
  console.log('查看通知详情:', item)
}

const markAsRead = (item: NotificationItem) => {
  item.status = 'read'
  item.readAt = new Date().toISOString()
  ElMessage.success('已标记为已读')
}

const handleTaskAction = (item: NotificationItem) => {
  ElMessage.info(`跳转到任务页面处理: ${item.title}`)
  // 实际项目中应该跳转到任务详情页面
}

const handleImportantAction = (item: NotificationItem) => {
  ElMessage.info(`处理重要通知: ${item.title}`)
  // 实际项目中应该有专门的重要通知处理流程
}

const handleDelete = (item: NotificationItem) => {
  ElMessageBox.confirm(
    `确定要删除通知 "${item.title}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = notifications.value.findIndex(n => n.id === item.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      ElMessage.success('通知已删除')
    }
  }).catch(() => {
    // 取消
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
</script>

<style scoped>
.notification {
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

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-count {
  font-size: 14px;
  color: #909399;
}

.empty-notification {
  padding: 40px 0;
  text-align: center;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  gap: 16px;
}

.notification-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.notification-unread {
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
}

.notification-important {
  background-color: #fdf6ec;
  border-left: 3px solid #e6a23c;
}

.notification-icon {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.title-text {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
  margin-right: 8px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.notification-body {
  margin-bottom: 12px;
}

.notification-message {
  margin: 0;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
}

.notification-details {
  margin-top: 8px;
  font-size: 12px;
}

.notification-details pre {
  margin: 0;
  white-space: pre-wrap;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.notification-source {
  font-style: italic;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

:deep(.el-badge__content.is-dot) {
  right: 6px;
  top: 6px;
}

:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  border: none;
  padding: 8px 0;
  font-size: 12px;
  color: #909399;
  background: transparent;
}

:deep(.el-collapse-item__wrap) {
  border: none;
  background: transparent;
}
</style>