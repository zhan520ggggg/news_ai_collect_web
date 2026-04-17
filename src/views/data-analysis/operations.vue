<template>
  <div class="operations">
    <div class="header">
      <h1>运营数据分析</h1>
      <div>
        <el-button :icon="Refresh" @click="handleRefresh" />
      </div>
    </div>

    <div class="content">
      <!-- 数据概览卡片 -->
      <el-row :gutter="20" class="overview-cards">
        <el-col :span="6">
          <el-card class="card">
            <div class="card-content">
              <div class="card-icon" style="background-color: #409eff20;">
                <el-icon color="#409eff" :size="24"><User /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">活跃用户</div>
                <div class="card-value">1,254</div>
                <div class="card-trend">
                  <span class="trend-up">+12.5%</span>
                  <span class="card-desc">较上月</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">
            <div class="card-content">
              <div class="card-icon" style="background-color: #67c23a20;">
                <el-icon color="#67c23a" :size="24"><TrendCharts /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">热点数量</div>
                <div class="card-value">342</div>
                <div class="card-trend">
                  <span class="trend-up">+8.3%</span>
                  <span class="card-desc">本周新增</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">
            <div class="card-content">
              <div class="card-icon" style="background-color: #e6a23c20;">
                <el-icon color="#e6a23c" :size="24"><Document /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">发布内容</div>
                <div class="card-value">128</div>
                <div class="card-trend">
                  <span class="trend-down">-3.2%</span>
                  <span class="card-desc">较上周</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">
            <div class="card-content">
              <div class="card-icon" style="background-color: #f56c6c20;">
                <el-icon color="#f56c6c" :size="24"><ChatDotRound /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">用户互动</div>
                <div class="card-value">2,587</div>
                <div class="card-trend">
                  <span class="trend-up">+15.7%</span>
                  <span class="card-desc">较昨日</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-area">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>用户活跃度趋势</span>
                <div>
                  <el-radio-group v-model="activeTimeRange" size="small">
                    <el-radio-button label="day">日</el-radio-button>
                    <el-radio-button label="week">周</el-radio-button>
                    <el-radio-button label="month">月</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            <div ref="activeChartRef" class="chart-container" style="height: 300px;"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>内容类型分布</span>
              </div>
            </template>
            <div ref="contentChartRef" class="chart-container" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <el-card class="table-card">
        <template #header>
          <div class="tabel-header">
            <span>运营关键指标</span>
            <div>
              <el-date-picker
                v-model="tableDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width: 240px;"
              />
            </div>
          </div>
        </template>
        <el-table
          v-loading="tableLoading"
          :data="tableData"
          style="width: 100%;"
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="newUsers" label="新增用户" width="100" />
          <el-table-column prop="activeUsers" label="活跃用户" width="100" />
          <el-table-column prop="newHotspots" label="新增热点" width="100" />
          <el-table-column prop="publishedContent" label="发布内容" width="100" />
          <el-table-column prop="userInteractions" label="用户互动" width="100" />
          <el-table-column prop="avgSession" label="平均会话时长" width="120">
            <template #default="{ row }">
              {{ row.avgSession }}分钟
            </template>
          </el-table-column>
          <el-table-column prop="conversionRate" label="转化率" width="100">
            <template #default="{ row }">
              {{ row.conversionRate }}%
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Refresh, User, TrendCharts, Document, ChatDotRound } from '@element-plus/icons-vue'
import type { ElTable, ElMessage, ElLoading } from 'element-plus'
import type { ECharts } from 'echarts'

const loading = ref(false)
const tableLoading = ref(false)
const activeChartRef = ref<HTMLElement>()
const contentChartRef = ref<HTMLElement>()
let activeChart: ECharts | null = null
let contentChart: ECharts | null = null

// 活跃度时间范围
const activeTimeRange = ref('week')

// 表格相关
const tableDateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(85)

// 表格数据
interface TableDataItem {
  date: string
  newUsers: number
  activeUsers: number
  newHotspots: number
  publishedContent: number
  userInteractions: number
  avgSession: number
  conversionRate: number
}

const tableData = ref<TableDataItem[]>([
  { date: '2026-04-10', newUsers: 45, activeUsers: 1254, newHotspots: 23, publishedContent: 15, userInteractions: 2587, avgSession: 8.5, conversionRate: 3.2 },
  { date: '2026-04-09', newUsers: 38, activeUsers: 1210, newHotspots: 21, publishedContent: 12, userInteractions: 2236, avgSession: 7.8, conversionRate: 2.9 },
  { date: '2026-04-08', newUsers: 42, activeUsers: 1185, newHotspots: 18, publishedContent: 10, userInteractions: 2105, avgSession: 7.2, conversionRate: 2.7 },
  { date: '2026-04-07', newUsers: 35, activeUsers: 1152, newHotspots: 15, publishedContent: 8, userInteractions: 1954, avgSession: 6.8, conversionRate: 2.4 },
  { date: '2026-04-06', newUsers: 48, activeUsers: 1127, newHotspots: 20, publishedContent: 14, userInteractions: 2310, avgSession: 8.1, conversionRate: 3.1 },
  { date: '2026-04-05', newUsers: 40, activeUsers: 1089, newHotspots: 22, publishedContent: 16, userInteractions: 2456, avgSession: 8.3, conversionRate: 3.0 },
  { date: '2026-04-04', newUsers: 32, activeUsers: 1054, newHotspots: 17, publishedContent: 11, userInteractions: 1987, avgSession: 7.5, conversionRate: 2.6 },
  { date: '2026-04-03', newUsers: 36, activeUsers: 1021, newHotspots: 19, publishedContent: 13, userInteractions: 2154, avgSession: 7.9, conversionRate: 2.8 },
  { date: '2026-04-02', newUsers: 41, activeUsers: 985, newHotspots: 25, publishedContent: 18, userInteractions: 2678, avgSession: 8.6, conversionRate: 3.3 },
  { date: '2026-04-01', newUsers: 37, activeUsers: 945, newHotspots: 21, publishedContent: 14, userInteractions: 2345, avgSession: 8.2, conversionRate: 3.0 },
])

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

const initCharts = () => {
  if (activeChartRef.value) {
    activeChart = echarts.init(activeChartRef.value)
    const activeOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: {
          color: '#606266'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#606266',
          formatter: '{value} 人'
        }
      },
      series: [
        {
          name: '活跃用户',
          type: 'line',
          smooth: true,
          data: [1254, 1210, 1185, 1152, 1127, 1089, 1054],
          itemStyle: {
            color: '#409eff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(64, 158, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(64, 158, 255, 0.05)'
              }]
            }
          }
        }
      ]
    }
    activeChart.setOption(activeOption)
  }

  if (contentChartRef.value) {
    contentChart = echarts.init(contentChartRef.value)
    const contentOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '内容类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 42, name: '新闻资讯' },
            { value: 31, name: '热点事件' },
            { value: 18, name: '行业分析' },
            { value: 9, name: '用户原创' }
          ],
          color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c']
        }
      ]
    }
    contentChart.setOption(contentOption)
  }
}

const handleRefresh = () => {
  loading.value = true
  // 模拟数据刷新
  setTimeout(() => {
    if (activeChart) {
      const newData = [1280, 1220, 1200, 1160, 1130, 1100, 1070]
      activeChart.setOption({
        series: [{
          data: newData
        }]
      })
    }
    loading.value = false
  }, 1000)
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

// 监听窗口大小变化，重新渲染图表
window.addEventListener('resize', () => {
  if (activeChart) {
    activeChart.resize()
  }
  if (contentChart) {
    contentChart.resize()
  }
})

// 组件销毁时清理图表
onBeforeUnmount(() => {
  if (activeChart) {
    activeChart.dispose()
    activeChart = null
  }
  if (contentChart) {
    contentChart.dispose()
    contentChart = null
  }
  window.removeEventListener('resize', null)
})
</script>

<style scoped>
.operations {
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

.overview-cards {
  margin-bottom: 10px;
}

.card {
  border-radius: 8px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.card-desc {
  color: #909399;
}

.chart-area {
  margin-bottom: 10px;
}

.chart-card, .table-card {
  border-radius: 8px;
}

.chart-header, .tabel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>