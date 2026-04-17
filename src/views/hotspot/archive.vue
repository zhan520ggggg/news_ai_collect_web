<template>
  <div class="hotspot-archive">
    <div class="header">
      <h1>热点归档</h1>
    </div>
    <el-card>
      <template #header>
        <span>热点归档管理</span>
      </template>
      <div>
        <p>热点归档页面内容待开发</p>
        <p>路由路径: /hotspot/archive</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
</script>

<style scoped>
.hotspot-archive {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>