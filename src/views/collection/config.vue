<template>
  <div class="collection-config">
    <div class="header">
      <h1>采集配置</h1>
      <div>
        <el-button
          type="primary"
          @click="saveConfig"
        >
          保存配置
        </el-button>
        <el-button @click="resetToDefault">
          重置为默认
        </el-button>
        <el-button
          :icon="Refresh"
          @click="handleRefresh"
        />
      </div>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>热点采集配置</span>
        </div>
      </template>
      <el-form label-width="200px">
        <el-form-item label="默认采集间隔时间">
          <el-input-number
            v-model="config.defaultInterval"
            :min="5"
            :max="60"
          />
          <span class="unit">分钟</span>
        </el-form-item>
        <el-form-item label="最大并发采集任务数">
          <el-input-number
            v-model="config.maxConcurrentTasks"
            :min="1"
            :max="20"
          />
        </el-form-item>
        <el-form-item label="采集超时时间">
          <el-input-number
            v-model="config.timeout"
            :min="10"
            :max="120"
          />
          <span class="unit">秒</span>
        </el-form-item>
        <el-form-item label="自动去重相似内容">
          <el-switch v-model="config.autoDeduplicate" />
        </el-form-item>
        <el-form-item label="采集关键词过滤">
          <el-input
            v-model="config.filterKeywords"
            type="textarea"
            :rows="3"
            placeholder="每行一个关键词，采集时会自动过滤包含这些关键词的内容"
          />
        </el-form-item>
        <el-form-item label="自动分类精度阈值">
          <el-slider
            v-model="config.autoClassifyThreshold"
            :min="0"
            :max="100"
            show-input
          />
        </el-form-item>
        <el-form-item label="采集数据保留天数">
          <el-input-number
            v-model="config.dataRetentionDays"
            :min="30"
            :max="365"
          />
          <span class="unit">天</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)

interface CollectionConfig {
  defaultInterval: number
  maxConcurrentTasks: number
  timeout: number
  autoDeduplicate: boolean
  filterKeywords: string
  autoClassifyThreshold: number
  dataRetentionDays: number
}

const defaultConfig: CollectionConfig = {
  defaultInterval: 30,
  maxConcurrentTasks: 5,
  timeout: 30,
  autoDeduplicate: true,
  filterKeywords: '',
  autoClassifyThreshold: 70,
  dataRetentionDays: 90
}

const config = reactive<CollectionConfig>(JSON.parse(JSON.stringify(defaultConfig)))

onMounted(() => {
  loadConfig()
})

const loadConfig = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleRefresh = () => {
  loadConfig()
  ElMessage.success('配置已刷新')
}

const saveConfig = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('配置保存成功')
    console.log('保存的配置:', JSON.parse(JSON.stringify(config)))
  }, 1000)
}

const resetToDefault = () => {
  ElMessageBox.confirm(
    '确定要重置配置为默认值吗？这将覆盖当前的配置设置。',
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
</script>

<style scoped>
.collection-config {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
}

.unit {
  margin-left: 8px;
  color: #909399;
}
</style>
