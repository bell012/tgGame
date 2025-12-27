<template>
  <header class="top-nav">
    <div class="h-full px-4 flex items-center justify-between">
      <!-- Logo/标题 -->
      <router-link to="/" class="nav-logo">
        顶部导航
      </router-link>

      <!-- 右侧操作区 -->
      <div class="flex items-center gap-4">
        <!-- 语言切换 -->
        <div class="flex gap-2">
          <button
            @click="switchLanguage('en')"
            class="lang-btn"
            :class="{ 'active': currentLocale === 'en' }"
          >
            EN
          </button>
          <button
            @click="switchLanguage('zh')"
            class="lang-btn"
            :class="{ 'active': currentLocale === 'zh' }"
          >
            中文
          </button>
        </div>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()

const currentLocale = computed(() => {
  return (route.params.locale as string) || 'en'
})

const switchLanguage = (lang: string) => {
  const currentPath = route.path.replace(/^\/(zh|en)/, '') || '/'
  if (lang === 'en') {
    router.push(currentPath === '/' ? '/' : currentPath)
  } else {
    router.push(`/${lang}${currentPath === '/' ? '' : currentPath}`)
  }
}
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background-color: var(--color-background-level-1);
  box-shadow: 0 2px 4px var(--color-mask-20);
  z-index: 50;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--color-text-level-1);
  transition: color 0.2s;
}

.nav-logo:hover {
  color: var(--color-theme-level-1);
}

.lang-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--color-text-level-3);
  background-color: transparent;
  transition: all 0.2s;
  border: 1px solid var(--color-opacity-15);
}

.lang-btn:hover {
  background-color: var(--color-opacity-8);
}

.lang-btn.active {
  background-color: var(--color-theme-level-1);
  color: var(--color-text-level-4);
  border-color: var(--color-theme-level-1);
}
</style>

