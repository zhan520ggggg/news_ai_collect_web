<template>
  <div class="data-analysis-collection">
    <div class="header">
      <h1>采集数据分析</h1>
    </div>
    <el-card>
      <template #header>
        <span>采集数据统计</span>
      </template>
      <div>
        <p>采集数据分析页面内容待开发</p>
        <p>路由路径: /data-analysis/collection</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
</script>

<style scoped>
.data-analysis-collection {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>