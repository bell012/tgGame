<template>
  <div class="bottom-tab-bar">
    <div class="h-full flex items-center justify-around px-4">
      <button
        v-for="menu in menus"
        :key="menu.id"
        class="tab-item"
        @click="menu.handler"
        :class="{ active: menu.active }"
      >
        <component
          :is="bottomTabBarIcons[menu.icon]"
          class="mb-1 h-[18px] w-[18px] fill-current [&_path]:fill-current"
          :class="menu.active ? 'text-theme-primary' : 'text-text-2'"
        />
        <p class="text-xs font-medium">{{ menu.name }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { bottomTabBarIcons } from '@/static/svg/bottom_tab_bar'
import { useLayoutStore } from '@/stores/layout'
import { navigateTo } from '@/utils/router'
import { stripLocalePrefix } from '@/utils/locale'

const { t } = useI18n()
const route = useRoute()
const layoutStore = useLayoutStore()

const menus = computed(() => [
  {
    id: 'home',
    name: t('home.home'),
    icon: 'home',
    route: '/',
    handler: () => navigateTo('/'),
    active: isActive('/', true)
  },
  {
    id: 'explore',
    name: t('bottom_tab_bar.explore'),
    icon: 'explore',
    route: '/explore',
    handler: () => navigateTo('/explore'),
    active: isActive('/explore', true)
  },
  {
    id: 'casino',
    name: t('bottom_tab_bar.casino'),
    icon: 'casino',
    route: '/casino',
    handler: () => navigateTo('/casino'),
    active: isActive('/casino')
  },
  {
    id: 'sports',
    name: t('bottom_tab_bar.sports'),
    icon: 'sports',
    route: '/sports',
    handler: () => navigateTo('/sports'),
    active: isActive('/sports')
  },
  {
    id: 'chat-public',
    name: t('bottom_tab_bar.chat'),
    icon: 'chat',
    route: '/chat-public',
    handler: () => navigateTo('/chat-public'),
    active: isActive('/chat-public', true)
  }
])

/**
 * 判断某个 path 是否激活
 * @param path 父路径，例如 '/a'
 * @param exact 是否精确匹配（默认 false）
 */
const isActive = (path: string, exact = false) => {
  const currentPath = stripLocalePrefix(route.path)
  return computed(() => {
    if (exact) return currentPath === path
    return currentPath === path || currentPath.startsWith(path + '/')
  }).value
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: -2px;
  left: 0;
  right: 0;
  height: v-bind('layoutStore.BOTTOM_TAB_HEIGHT + "px"');
  border-radius: 12px 12px 0 0;
  background: var(--color-background-level-2);
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
