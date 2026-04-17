<template>
  <div class="collection-data">
    <div class="header">
      <h1>采集数据处理</h1>
    </div>
    <el-card>
      <template #header>
        <span>采集数据处理管理</span>
      </template>
      <div>
        <p>采集数据处理页面内容待开发</p>
        <p>路由路径: /collection/data</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
</script>

<style scoped>
.collection-data {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>