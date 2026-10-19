<template>
  <div class="bottom-tab-bar">
    <div class="h-full flex items-center justify-around px-[14px] gap-[6px]">
      <button
        v-for="menu in menus"
        :key="menu.id"
        type="button"
        class="tab-item"
        @pointerdown.passive="prepareTab(menu)"
        @focus="prepareTab(menu)"
        @click="handleTabClick(menu)"
        :class="{ active: menu.active }"
      >
        <component
          :is="bottomTabBarIcons[menu.icon]"
          class="tab-icon mb-[6px] h-[20px] w-[20px] fill-current [&_path]:fill-current"
        />
        <p class="text-xs font-[700]">{{ menu.name }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { bottomTabBarIcons } from '@/static/svg/bottom_tab_bar'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import { useLayoutStore } from '@/stores/layout'
import { navigateBottomTab, preloadBottomTabRoute } from '@/utils/bottomTabTransition'
import { stripLocalePrefix } from '@/utils/locale'

const { t } = useI18n()
const route = useRoute()
const layoutStore = useLayoutStore()
const { open: openOnlineCustomer } = useOnlineCustomerService()
// 图标与文字共用同一份路由选中态，避免各自计算和切换颜色。
const currentPath = computed(() => stripLocalePrefix(route.path))

// 空闲时逐个预取 Tab 页的代码，减少首次点击时等待路由模块下载的时间。
// 这里只加载模块，不挂载页面，也不主动请求页面业务数据。
let stopPreloading = false
let cancelScheduledPreload: (() => void) | undefined
let preloadInFlight = false
let preloadResumeAt = 0
const pendingPreloadPaths = ['/', '/explore', '/casino', '/sports', '/chat-public'].filter(
  path => path !== currentPath.value
)

const scheduleNextPreload = () => {
  if (stopPreloading || cancelScheduledPreload || preloadInFlight || !pendingPreloadPaths.length)
    return

  // 点击和入场动画期间让后台预取让路，避免解析其他页面模块与首屏绘制争用主线程。
  const remaining = preloadResumeAt - performance.now()
  if (remaining > 0) {
    const id = window.setTimeout(() => {
      cancelScheduledPreload = undefined
      scheduleNextPreload()
    }, remaining)
    cancelScheduledPreload = () => window.clearTimeout(id)
    return
  }

  const preload = async () => {
    cancelScheduledPreload = undefined
    if (stopPreloading) return
    if (performance.now() < preloadResumeAt) {
      scheduleNextPreload()
      return
    }
    const path = pendingPreloadPaths.shift()!
    preloadInFlight = true
    try {
      await preloadBottomTabRoute(path)
    } catch {
      // 预取失败不打断操作，正式进入路由时由路由器重新加载。
    } finally {
      preloadInFlight = false
      scheduleNextPreload()
    }
  }

  if (typeof window.requestIdleCallback === 'function') {
    // 页面持续有任务时也应逐步完成预取，避免首次点击时模块仍未下载。
    const id = window.requestIdleCallback(() => void preload(), { timeout: 1200 })
    cancelScheduledPreload = () => window.cancelIdleCallback(id)
  } else {
    const id = window.setTimeout(() => void preload(), 300)
    cancelScheduledPreload = () => window.clearTimeout(id)
  }
}

onMounted(scheduleNextPreload)
onBeforeUnmount(() => {
  stopPreloading = true
  cancelScheduledPreload?.()
})

const menus = computed(() => [
  {
    id: 'home',
    name: t('home.home'),
    icon: 'home',
    route: '/',
    handler: () => navigateBottomTab('/'),
    active: isActive('/', true)
  },
  {
    id: 'explore',
    name: t('bottom_tab_bar.explore'),
    icon: 'explore',
    route: '/explore',
    handler: () => navigateBottomTab('/explore'),
    active: isActive('/explore', true)
  },
  {
    id: 'casino',
    name: t('bottom_tab_bar.casino'),
    icon: 'casino',
    route: '/casino',
    handler: () => navigateBottomTab('/casino'),
    active: isActive('/casino')
  },
  {
    id: 'sports',
    name: t('bottom_tab_bar.sports'),
    icon: 'sports',
    route: '/sports',
    handler: () => navigateBottomTab('/sports'),
    active: isActive('/sports')
  },
  {
    id: 'chat-public',
    name: t('bottom_tab_bar.chat'),
    icon: 'chat',
    route: '/chat-public',
    handler: handleChatClick,
    active: isActive('/chat-public', true)
  }
])

/**
 * 处理 H5 底部客服入口，根据后台客服模式打开第三方 iframe 或原生客服。
 */
function handleChatClick() {
  openOnlineCustomer()
}

function prepareTab(menu: (typeof menus.value)[number]) {
  if (menu.active) return
  preloadResumeAt = performance.now() + 500
  cancelScheduledPreload?.()
  cancelScheduledPreload = undefined
  scheduleNextPreload()
  // 在 click 之前利用按下手指到抬起的时间优先加载目标模块，客服仍按后台模式打开。
  if (menu.id !== 'chat-public') {
    void preloadBottomTabRoute(menu.route).catch(() => {})
  }
}

function handleTabClick(menu: (typeof menus.value)[number]) {
  // 重复点击当前 Tab 不再导航，也不重复请求客服模式。
  if (menu.active) return
  prepareTab(menu)
  menu.handler()
}

/**
 * 判断某个 path 是否激活
 * @param path 父路径，例如 '/a'
 * @param exact 是否精确匹配（默认 false）
 */
const isActive = (path: string, exact = false) => {
  if (exact) return currentPath.value === path
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: -2px;
  left: 0;
  right: 0;
  height: calc(v-bind('layoutStore.BOTTOM_TAB_HEIGHT + "px"'));
  padding-bottom: 16px;
  border-radius: 12px 12px 0 0;
  background: var(--color-background-level-2);
  border-top: 1px solid var(--color-background-level-3);
  z-index: 50;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 6px;
  color: var(--color-text-level-2);
  /* 图标与文字从按钮继承颜色，并在同一帧更新，避免一方渐变、一方立即变色。 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.tab-icon {
  color: inherit;
}

.tab-item.active {
  color: var(--color-theme-level-1);
}
</style>
