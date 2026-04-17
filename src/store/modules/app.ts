import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const setLanguage = (lang: string) => {
    language.value = lang
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      theme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme.value)
    }
  }

  // 初始化语言
  const initLanguage = () => {
    const savedLang = localStorage.getItem('language')
    if (savedLang) {
      language.value = savedLang
    } else {
      const browserLang = navigator.language
      language.value = browserLang.startsWith('zh') ? 'zh-CN' : 'en-US'
    }
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    toggleSidebar,
    setTheme,
    setLanguage,
    initTheme,
    initLanguage
  }
})