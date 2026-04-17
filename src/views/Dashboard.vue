<template>
  <div class="dashboard">
    <h1>仪表盘</h1>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户总数</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              1,234
            </div>
            <div class="description">
              较上月增长 12%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单数量</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              567
            </div>
            <div class="description">
              较上月增长 8%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售额</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              ¥ 89,000
            </div>
            <div class="description">
              较上月增长 15%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>访问量</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              23,456
            </div>
            <div class="description">
              较上月增长 5%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row
      :gutter="20"
      style="margin-top: 20px;"
    >
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
            </div>
          </template>
          <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #ccc;">
            图表区域 (可接入 ECharts 等图表库)
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门页面</span>
            </div>
          </template>
          <el-table
            :data="tableData"
            style="width: 100%"
          >
            <el-table-column
              prop="page"
              label="页面"
            />
            <el-table-column
              prop="views"
              label="访问量"
            />
            <el-table-column
              prop="growth"
              label="增长率"
            >
              <template #default="scope">
                <el-tag :type="scope.row.growth > 0 ? 'success' : 'danger'">
                  {{ scope.row.growth > 0 ? '+' : '' }}{{ scope.row.growth }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  { page: '/dashboard', views: 1234, growth: 12 },
  { page: '/users', views: 987, growth: 8 },
  { page: '/settings', views: 654, growth: 5 },
]
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content .number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-content .description {
  color: #999;
  font-size: 14px;
}
</style>