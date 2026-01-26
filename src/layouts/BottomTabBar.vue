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
          class="w-[18px] h-[18px] mb-1"
          :class="menu.active ? 'fill-primary' : 'fill-text-2'"
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

const { t } = useI18n()
const route = useRoute()
const layoutStore = useLayoutStore()

const menus = computed(() => [
  {
    id: 'menu',
    name: t('locales.bottom_tab_bar.menu'),
    icon: 'menu',
    route: '/menu',
    handler: () => navigateTo('/menu'),
    active: isActive('/menu', true)
  },
  {
    id: 'explore',
    name: t('locales.bottom_tab_bar.explore'),
    icon: 'explore',
    route: '/explore',
    handler: () => navigateTo('/explore'),
    active: isActive('/explore', true)
  },
  {
    id: 'casino',
    name: t('locales.bottom_tab_bar.casino'),
    icon: 'casino',
    route: '/casino',
    handler: () => navigateTo('/casino'),
    active: isActive('/casino')
  },
  {
    id: 'sports',
    name: t('locales.bottom_tab_bar.sports'),
    icon: 'sports',
    route: '/sports',
    handler: () => navigateTo('/sports'),
    active: isActive('/sports')
  },
  {
    id: 'chat-public',
    name: t('locales.bottom_tab_bar.chat'),
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
  const currentPath = route.path.replace(/^\/(zh|en)/, '')
  return computed(() => {
    if (exact) return currentPath === path
    return currentPath === path || currentPath.startsWith(path + '/')
  }).value
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
