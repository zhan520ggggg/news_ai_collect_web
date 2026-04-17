<template>
  <div class="config">
    <div class="header">
      <h1>系统配置</h1>
      <div>
        <el-button type="primary" @click="saveAllConfig">保存配置</el-button>
        <el-button @click="resetToDefault">重置为默认</el-button>
        <el-button :icon="Refresh" @click="handleRefresh" />
      </div>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 系统基础配置 -->
      <el-tab-pane label="基础配置" name="basic">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统基础配置</span>
            </div>
          </template>
          <el-form label-width="180px">
            <el-form-item label="系统名称">
              <el-input v-model="config.system.name" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <div class="logo-upload">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleLogoChange"
                >
                  <img v-if="config.system.logo" :src="config.system.logo" class="logo-image" alt="Logo" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="logo-tips">
                  <p>建议尺寸：200 x 60 px</p>
                  <p>支持格式：PNG、JPG、SVG</p>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="config.system.description"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="config.system.version" placeholder="请输入系统版本" disabled />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="config.system.copyright" placeholder="请输入版权信息" />
            </el-form-item>
            <el-form-item label="备案信息">
              <el-input v-model="config.system.icp" placeholder="请输入备案号" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 用户配置 -->
      <el-tab-pane label="用户配置" name="user">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户管理配置</span>
            </div>
          </template>
          <el-form label-width="180px">
            <el-form-item label="新用户注册">
              <el-radio-group v-model="config.user.allowRegister">
                <el-radio label="allow">允许注册</el-radio>
                <el-radio label="invite">仅邀请注册</el-radio>
                <el-radio label="disable">禁止注册</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="默认用户角色">
              <el-select v-model="config.user.defaultRole" placeholder="请选择默认角色">
                <el-option label="观察者" value="viewer" />
                <el-option label="编辑" value="editor" />
                <el-option label="审阅员" value="reviewer" />
              </el-select>
            </el-form-item>
            <el-form-item label="密码强度要求">
              <el-radio-group v-model="config.user.passwordStrength">
                <el-radio label="low">低（6位字符）</el-radio>
                <el-radio label="medium">中（8位含字母数字）</el-radio>
                <el-radio label="high">高（8位含大小写字母数字）</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input-number v-model="config.user.sessionTimeout" :min="15" :max="480" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="允许同一账号多地登录">
              <el-switch v-model="config.user.allowMultiLogin" />
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="config.user.loginLockEnabled" />
              <div v-if="config.user.loginLockEnabled" class="inline-inputs">
                失败
                <el-input-number v-model="config.user.maxLoginAttempts" :min="1" :max="10" controls-position="right" />
                次后锁定
                <el-input-number v-model="config.user.lockDuration" :min="5" :max="60" controls-position="right" />
                分钟
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 热点采集配置 -->
      <el-tab-pane label="采集配置" name="collection">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热点采集配置</span>
            </div>
          </template>
          <el-form label-width="200px">
            <el-form-item label="默认采集间隔时间">
              <el-input-number v-model="config.collection.defaultInterval" :min="5" :max="60" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="最大并发采集任务数">
              <el-input-number v-model="config.collection.maxConcurrentTasks" :min="1" :max="20" />
            </el-form-item>
            <el-form-item label="采集超时时间">
              <el-input-number v-model="config.collection.timeout" :min="10" :max="120" />
              <span class="unit">秒</span>
            </el-form-item>
            <el-form-item label="自动去重相似内容">
              <el-switch v-model="config.collection.autoDeduplicate" />
            </el-form-item>
            <el-form-item label="采集关键词过滤">
              <el-input
                v-model="config.collection.filterKeywords"
                type="textarea"
                :rows="3"
                placeholder="每行一个关键词，采集时会自动过滤包含这些关键词的内容"
              />
            </el-form-item>
            <el-form-item label="自动分类精度阈值">
              <el-slider v-model="config.collection.autoClassifyThreshold" :min="0" :max="100" show-input />
            </el-form-item>
            <el-form-item label="采集数据保留天数">
              <el-input-number v-model="config.collection.dataRetentionDays" :min="30" :max="365" />
              <span class="unit">天</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 分析展示配置 -->
      <el-tab-pane label="分析配置" name="analysis">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据分析展示配置</span>
            </div>
          </template>
          <el-form label-width="200px">
            <el-form-item label="数据刷新间隔">
              <el-select v-model="config.analysis.refreshInterval" placeholder="请选择刷新间隔">
                <el-option label="实时（5秒）" :value="5" />
                <el-option label="快速（30秒）" :value="30" />
                <el-option label="普通（1分钟）" :value="60" />
                <el-option label="慢速（5分钟）" :value="300" />
              </el-select>
            </el-form-item>
            <el-form-item label="图表默认主题">
              <el-select v-model="config.analysis.chartTheme" placeholder="请选择图表主题">
                <el-option label="明亮主题" value="light" />
                <el-option label="暗色主题" value="dark" />
              </el-select>
            </el-form-item>
            <el-form-item label="热点趋势预测周期">
              <el-input-number v-model="config.analysis.trendPredictDays" :min="1" :max="30" />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item label="热门阈值设置">
              <div class="inline-inputs">
                <span class="inline-label">点击量：</span>
                <el-input-number v-model="config.analysis.thresholds.clicks" :min="100" :max="100000" />
                <span class="inline-label">评论数：</span>
                <el-input-number v-model="config.analysis.thresholds.comments" :min="10" :max="10000" />
                <span class="inline-label">分享数：</span>
                <el-input-number v-model="config.analysis.thresholds.shares" :min="10" :max="10000" />
              </div>
            </el-form-item>
            <el-form-item label="数据自动导出">
              <el-switch v-model="config.analysis.autoExport.enabled" />
              <div v-if="config.analysis.autoExport.enabled" class="inline-inputs">
                每隔
                <el-input-number v-model="config.analysis.autoExport.interval" :min="6" :max="168" />
                <el-select v-model="config.analysis.autoExport.intervalUnit" style="width: 80px;">
                  <el-option label="小时" value="hours" />
                  <el-option label="天" value="days" />
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="报告发送邮箱">
              <el-input v-model="config.analysis.reportEmail" placeholder="请输入接收报告的邮箱地址" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 通知配置 -->
      <el-tab-pane label="通知配置" name="notification">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统通知配置</span>
            </div>
          </template>
          <el-form label-width="200px">
            <el-form-item label="系统公告开关">
              <el-switch v-model="config.notification.announcementEnabled" />
            </el-form-item>
            <el-form-item label="邮件通知开关">
              <el-switch v-model="config.notification.emailEnabled" />
            </el-form-item>
            <el-form-item label="短信通知开关">
              <el-switch v-model="config.notification.smsEnabled" />
            </el-form-item>
            <el-form-item label="站内通知开关">
              <el-switch v-model="config.notification.inAppEnabled" />
            </el-form-item>
            <el-form-item label="默认通知标题前缀">
              <el-input v-model="config.notification.defaultPrefix" placeholder="例如：[系统通知]" />
            </el-form-item>
            <el-form-item label="通知保留天数">
              <el-input-number v-model="config.notification.retentionDays" :min="7" :max="90" />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item label="紧急通知接收人">
              <el-input
                v-model="config.notification.emergencyContacts"
                type="textarea"
                :rows="3"
                placeholder="请输入紧急通知接收人，每行一个（姓名:手机:邮箱）"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 备份配置 -->
      <el-tab-pane label="备份配置" name="backup">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统备份配置</span>
            </div>
          </template>
          <el-form label-width="200px">
            <el-form-item label="自动备份开关">
              <el-switch v-model="config.backup.autoBackupEnabled" />
            </el-form-item>
            <el-form-item label="备份时间">
              <el-time-select
                v-model="config.backup.backupTime"
                :picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '23:30'
                }"
                placeholder="选择时间"
              />
            </el-form-item>
            <el-form-item label="备份频率">
              <el-select v-model="config.backup.frequency" placeholder="请选择备份频率">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
            <el-form-item label="备份保留数量">
              <el-input-number v-model="config.backup.retentionCount" :min="1" :max="100" />
              <span class="unit">个</span>
            </el-form-item>
            <el-form-item label="备份文件压缩">
              <el-switch v-model="config.backup.compressEnabled" />
            </el-form-item>
            <el-form-item label="备份目录">
              <el-input v-model="config.backup.directory" placeholder="请输入备份存储目录" />
              <el-button type="primary" link @click="browseDirectory">浏览</el-button>
            </el-form-item>
            <el-form-item label="备份内容">
              <el-checkbox-group v-model="config.backup.items">
                <el-checkbox value="database">数据库</el-checkbox>
                <el-checkbox value="files">文件系统</el-checkbox>
                <el-checkbox value="logs">系统日志</el-checkbox>
                <el-checkbox value="config">配置文件</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="备份前提醒">
              <el-switch v-model="config.backup.preBackupNotification" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

const loading = ref(false)
const activeTab = ref('basic')

// 系统配置数据
interface SystemConfig {
  name: string
  logo: string
  description: string
  version: string
  copyright: string
  icp: string
}

interface UserConfig {
  allowRegister: string
  defaultRole: string
  passwordStrength: string
  sessionTimeout: number
  allowMultiLogin: boolean
  loginLockEnabled: boolean
  maxLoginAttempts: number
  lockDuration: number
}

interface CollectionConfig {
  defaultInterval: number
  maxConcurrentTasks: number
  timeout: number
  autoDeduplicate: boolean
  filterKeywords: string
  autoClassifyThreshold: number
  dataRetentionDays: number
}

interface AnalysisThresholds {
  clicks: number
  comments: number
  shares: number
}

interface AutoExportConfig {
  enabled: boolean
  interval: number
  intervalUnit: string
}

interface AnalysisConfig {
  refreshInterval: number
  chartTheme: string
  trendPredictDays: number
  thresholds: AnalysisThresholds
  autoExport: AutoExportConfig
  reportEmail: string
}

interface NotificationConfig {
  announcementEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
  defaultPrefix: string
  retentionDays: number
  emergencyContacts: string
}

interface BackupConfig {
  autoBackupEnabled: boolean
  backupTime: string
  frequency: string
  retentionCount: number
  compressEnabled: boolean
  directory: string
  items: string[]
  preBackupNotification: boolean
}

interface Config {
  system: SystemConfig
  user: UserConfig
  collection: CollectionConfig
  analysis: AnalysisConfig
  notification: NotificationConfig
  backup: BackupConfig
}

// 默认配置
const defaultConfig: Config = {
  system: {
    name: '热点采集分析系统',
    logo: '',
    description: '基于人工智能的热点采集、分析与展示系统',
    version: 'v1.0.0',
    copyright: '© 2026 热点分析系统版权所有',
    icp: '京ICP备XXXXXXXX号-1'
  },
  user: {
    allowRegister: 'allow',
    defaultRole: 'viewer',
    passwordStrength: 'medium',
    sessionTimeout: 30,
    allowMultiLogin: true,
    loginLockEnabled: true,
    maxLoginAttempts: 5,
    lockDuration: 30
  },
  collection: {
    defaultInterval: 30,
    maxConcurrentTasks: 5,
    timeout: 30,
    autoDeduplicate: true,
    filterKeywords: '',
    autoClassifyThreshold: 70,
    dataRetentionDays: 90
  },
  analysis: {
    refreshInterval: 60,
    chartTheme: 'light',
    trendPredictDays: 7,
    thresholds: {
      clicks: 1000,
      comments: 100,
      shares: 50
    },
    autoExport: {
      enabled: false,
      interval: 24,
      intervalUnit: 'hours'
    },
    reportEmail: ''
  },
  notification: {
    announcementEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    defaultPrefix: '[系统通知]',
    retentionDays: 30,
    emergencyContacts: ''
  },
  backup: {
    autoBackupEnabled: true,
    backupTime: '02:00',
    frequency: 'daily',
    retentionCount: 30,
    compressEnabled: true,
    directory: '/backups',
    items: ['database', 'files'],
    preBackupNotification: true
  }
}

const config = reactive<Config>(JSON.parse(JSON.stringify(defaultConfig)))

onMounted(() => {
  loadConfig()
})

const loadConfig = () => {
  loading.value = true
  // 模拟API加载配置
  setTimeout(() => {
    // 实际项目中应该从API获取配置
    loading.value = false
  }, 500)
}

const handleRefresh = () => {
  loadConfig()
  ElMessage.success('配置已刷新')
}

const handleLogoChange = (file: UploadFile) => {
  // 实际项目中应该上传到服务器并返回URL
  const reader = new FileReader()
  reader.onload = () => {
    config.system.logo = reader.result as string
  }
  reader.readAsDataURL(file.raw as Blob)
}

const saveAllConfig = () => {
  loading.value = true
  // 模拟API保存配置
  setTimeout(() => {
    loading.value = false
    ElMessage.success('配置保存成功')
    console.log('保存的配置:', JSON.parse(JSON.stringify(config)))
  }, 1000)
}

const resetToDefault = () => {
  ElMessageBox.confirm(
    '确定要重置所有配置为默认值吗？这将覆盖当前的配置设置。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    Object.assign(config, JSON.parse(JSON.stringify(defaultConfig)))
    ElMessage.success('已重置为默认配置')
  }).catch(() => {
    // 取消
  })
}

const browseDirectory = () => {
  ElMessage.info('在实际项目中，这里会打开文件夹选择对话框')
  // 实际项目中需要使用原生文件对话框
}
</script>

<style scoped>
.config {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

:deep(.el-tabs__content) {
  padding-top: 0;
}

.card-header {
  font-weight: 600;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

.inline-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.inline-label {
  margin-left: 8px;
  color: #606266;
}

.logo-upload {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.logo-image {
  width: 200px;
  height: 60px;
  object-fit: contain;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

:deep(.avatar-uploader) .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

:deep(.avatar-uploader) .el-upload:hover {
  border-color: var(--el-color-primary);
}

:deep(.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 60px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-tips {
  font-size: 12px;
  color: #909399;
}

.logo-tips p {
  margin: 4px 0;
}
</style>