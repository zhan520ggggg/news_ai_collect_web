<template>
  <template v-if="showLayout">
    <Layout>
      <router-view />
    </Layout>
  </template>
  <template v-else>
    <router-view />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/layout/index.vue'

const route = useRoute()

const showLayout = computed(() => {
  const hiddenLayoutRoutes = ['/login', '/404']
  return !hiddenLayoutRoutes.includes(route.path)
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
</style>