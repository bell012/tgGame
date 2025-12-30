<template>
  <div class="bottom-tab-bar">
    <div class="h-full flex items-center justify-around px-4">
      <!-- 选单 -->
      <router-link
        :to="getLocalePath('/casino')"
        class="tab-item"
        :class="{ 'active': isActive('/casino') }"
      >
        <div class="w-6 h-6 mb-1">
          <img
            src="https://api.iconify.design/mdi:cards-playing.svg?color=%23666"
            alt="选单"
            class="w-full h-full"
            :class="isActive('/casino') ? 'brightness-0 saturate-100 hue-rotate-180' : ''"
          />
        </div>
        <span class="text-xs font-medium">选单</span>
      </router-link>

      <!-- 搜索 -->
      <router-link
        :to="getLocalePath('/sports')"
        class="tab-item"
        :class="{ 'active': isActive('/sports') }"
      >
        <div class="w-6 h-6 mb-1">
          <img
            src="https://api.iconify.design/mdi:magnify.svg?color=%23666"
            alt="搜索"
            class="w-full h-full"
            :class="isActive('/sports') ? 'brightness-0 saturate-100 hue-rotate-180' : ''"
          />
        </div>
        <span class="text-xs font-medium">搜索</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const layoutStore = useLayoutStore()

const isActive = (path: string) => {
  const currentPath = route.path.replace(/^\/(zh|en)/, '')
  return computed(() => currentPath === path).value
}

const getLocalePath = (path: string) => {
  const locale = route.params.locale as string
  if (!locale || locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: v-bind('layoutStore.BOTTOM_TAB_HEIGHT + "px"');
  background-color: var(--color-background-level-1);
  box-shadow: 0 -2px 4px var(--color-mask-20);
  border-top: 1px solid var(--color-opacity-15);
  z-index: 50;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.5rem;
  color: var(--color-text-level-3);
  transition: color 0.2s;
}

.tab-item.active {
  color: var(--color-theme-level-1);
}
</style>

