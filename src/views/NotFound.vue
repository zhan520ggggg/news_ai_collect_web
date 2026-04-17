<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}

.content {
  text-align: center;
}

.content h1 {
  font-size: 120px;
  margin: 0;
  color: var(--el-color-primary);
}

.content p {
  font-size: 20px;
  margin: 20px 0 30px;
  color: #666;
}
</style>