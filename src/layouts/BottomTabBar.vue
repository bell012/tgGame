<template>
  <div class="bottom-tab-bar">
    <div class="h-full flex items-center justify-around px-4">
      <button v-for="menu in menus" :key="menu.id" class="tab-item"
        @click="menu.handler" :class="{ active: menu.active}"
      >
        <component :is="sideIcons[menu.icon]" 
            class="w-6 h-6 mb-1 fill-none" 
            :class="menu.active ? 'brightness-0 saturate-100 hue-rotate-180' : ''"
          />
        <p class="text-xs font-medium">{{ menu.name }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { sideIcons } from '@/static/svg/side'
import { useLayoutStore } from '@/stores/layout'
import { navigateTo } from '@/utils/router'
import FoldIcon from '@/static/svg/fold.svg?url'
import SearchIcon from '@/static/svg/search.svg?url'
import ChatIcon from '@/static/svg/chat.svg?url'
import CasionIcon from '@/static/svg/casino.svg?url'

const route = useRoute()
const layoutStore = useLayoutStore()

const menus = computed(() => [
  {
    id: 'menu',
    name: '选单',
    icon: 'icon_2',
    route: '/menu',
    handler: () => navigateTo('/menu'),
    active: isActive('/menu')
  },
  {
    id: 'explore',
    name: '搜索',
    icon: 'icon_2',
    route: '/explore',
    handler: () => navigateTo('/explore'),
    active: isActive('/explore')
  },
  {
    id: 'casino',
    name: '娱乐城',
    icon: 'icon_2',
    route: '/casino',
    handler: () => navigateTo('/casino'),
    active: isActive('/casino')
  },
  {
    id: 'sports',
    name: '体育',
    icon: 'icon_3',
    route: '/sports',
    handler: () => navigateTo('/sports'),
    active: isActive('/sports')
  },
  {
    id: 'chat-public',
    name: '聊天',
    icon: 'icon_2',
    route: '/chat-public',
    handler: () => navigateTo('/chat-public'),
    active: isActive('/chat-public')
  },
])

const isActive = (path: string) => {
  const currentPath = route.path.replace(/^\/(zh|en)/, '')
  return computed(() => currentPath === path).value
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
