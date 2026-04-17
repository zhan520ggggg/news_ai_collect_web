<template>
  <div class="hotspot-category-tag">
    <div class="header">
      <h1>分类与标签管理</h1>
    </div>
    <el-card>
      <template #header>
        <span>分类与标签</span>
      </template>
      <div>
        <p>分类与标签管理页面内容待开发</p>
        <p>路由路径: /hotspot/category-tag</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
</script>

<style scoped>
.hotspot-category-tag {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>