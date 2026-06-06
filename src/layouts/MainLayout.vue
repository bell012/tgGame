<template>
  <div class="flex min-h-screen">
    <!-- 顶部导航 -->
    <TopNav
      v-if="!hideTopNav && !isFullscreenRoute"
      ref="topNavRef"
      :sidebar-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      @notification-click="handleNotificationClick"
    />

    <!-- 侧边栏 -->
    <Sidebar
      v-if="!isMobile && !isFullscreenRoute"
      class="hidden sm:flex"
      ref="sidebarRef"
      @open-language-modal="openLanguageModal"
      @collapse-change="handleCollapseChange"
    />

    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out" :style="mainStyle">
      <!-- 主内容容器 -->
      <div :class="isFullscreenRoute ? 'min-h-full' : 'flex min-h-full items-start gap-4'">
        <!-- 路由内容区域 -->
        <section class="min-w-0 flex-1">
          <!-- 主内容背景页 -->
          <router-view
            v-if="shouldRenderBackgroundRouteInMain(route) && backgroundRouteSnapshot"
            :route="backgroundRouteSnapshot"
            :key="backgroundRouteSnapshot.fullPath"
          />

          <!-- 主内容当前页 -->
          <router-view
            v-if="shouldRenderCurrentRouteInMain(route)"
            v-slot="{ Component, route: viewRoute }"
          >
            <KeepAlive>
              <component
                :is="Component"
                v-if="viewRoute.meta?.keepAlive"
                :key="getMainRouteViewKey(viewRoute)"
              />
            </KeepAlive>
            <component
              :is="Component"
              v-if="!viewRoute.meta?.keepAlive"
              :key="getMainRouteViewKey(viewRoute)"
            />
          </router-view>
        </section>

        <!-- PC 端通知面板占位列 -->
        <div
          v-if="showNotificationPanel && !isMobile && !isFullscreenRoute"
          class="w-[312px] shrink-0"
        ></div>

        <!-- PC 端通知侧边面板 -->
        <transition name="notification-panel">
          <aside
            v-if="showNotificationPanel && !isMobile && !isFullscreenRoute"
            class="fixed z-40 w-[312px] overflow-hidden bg-bg-1"
            :style="notificationPanelStyle"
          >
            <NotificationDetailPage
              v-if="activeNotificationDetail"
              panel-mode
              :detail-data="activeNotificationDetail"
              @back="handleNotificationDetailBack"
              @close="handleNotificationPanelClose"
            />
            <NotificationListPage
              v-else
              panel-mode
              @open-detail="handleNotificationDetailOpen"
              @close="handleNotificationPanelClose"
            />
          </aside>
        </transition>
      </div>
    </main>

    <!-- 滑动路由层  -->
    <teleport to="body" v-if="isMobile && slideRouteStack.length > 0">
      <!-- 渲染所有滑动路由栈 -->
      <template v-for="(item, index) in slideRouteStack" :key="item.path">
        <transition name="drawer-slide">
          <div
            v-if="item.showDrawer"
            class="fixed inset-0 overflow-hidden bg-bg-1"
            :style="{ zIndex: 99 + index }"
          >
            <router-view :route="item.route" :key="item.path" />
          </div>
        </transition>
      </template>
    </teleport>

    <!-- 底部Tab栏 -->
    <BottomTabBar class="sm:hidden" v-if="!hideBottomBar" />

    <CheckInPopup v-model="checkInVisible" auto-popup-only />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useCheckInModalStore } from '@/stores/checkInModal'
import { useLayoutStore } from '@/stores/layout'
import { usePromotionsStore } from '@/stores/promotions'
import { useUserStore } from '@/stores/user'
import {
  DEFAULT_LOCALE,
  getLocaleFromRouteParam,
  stripLocalePrefix,
  withLocalePrefix
} from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import NotificationDetailPage from '@/views/menu/notifications/detail/index.vue'
import NotificationListPage from '@/views/menu/notifications/index.vue'
import { storeToRefs } from 'pinia'
import { computed, markRaw, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import BottomTabBar from './BottomTabBar.vue'
import Sidebar from './Sidebar.vue'
import TopNav from './TopNav.vue'
import { CheckInPopup, useCheckInAutoPopup } from '@/views/activity/check-in'
import { globalTicketToastState } from '@/views/activity/ticket/shell/ticketToast'

const layoutStore = useLayoutStore()
const userStore = useUserStore()
const promotionsStore = usePromotionsStore()
const checkInModalStore = useCheckInModalStore()
const { visible: checkInVisible } = storeToRefs(checkInModalStore)
const topNavRef = ref<InstanceType<typeof TopNav> | null>(null)
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isSidebarCollapsed = ref(false)
const showNotificationPanel = ref(false)
const activeNotificationDetail = ref<NotificationPanelDetail | null>(null)
const isMobile = useIsMobile()
const lastResolvedDeviceMode = ref<boolean | null>(null)
const hasViewportModeInitialized = ref(false)

const route = useRoute()
const router = useRouter()
const DRAWER_TRANSITION_MS = 350

useCheckInAutoPopup()

const redirectMobileOnlyRouteToHome = (localeParam?: string) => {
  const targetLocale = getLocaleFromRouteParam(localeParam)
  const targetHomePath = withLocalePrefix('/', targetLocale)

  if (route.fullPath !== targetHomePath) {
    void router.replace(targetHomePath)
  }
}

// 滑动路由栈项的类型定义
interface SlideRouteItem {
  path: string
  route: RouteLocationNormalizedLoaded
  showDrawer: boolean
}

interface NotificationPanelDetail {
  category: 'promotions' | 'transactions' | 'system'
  createTime: number
  isImage: number
  linkUrl: string
  noticeText: string
  noticeTitle: string
  rowId: number
}

// 滑动路由栈
const slideRouteStack = ref<SlideRouteItem[]>([])

// 主区域当前应该显示的根背景页
const backgroundRouteSnapshot = shallowRef<RouteLocationNormalizedLoaded | null>(null)

// 判断是否应该使用滑动过渡动画
const shouldUseSlideTransition = (currentRoute: RouteLocationNormalizedLoaded) => {
  return currentRoute.meta?.slideTransition === true
}

const shouldRenderCurrentRouteInMain = (currentRoute: RouteLocationNormalizedLoaded) => {
  if (!shouldUseSlideTransition(currentRoute)) {
    return true
  }

  if (!isMobile.value) {
    return true
  }

  return (
    !backgroundRouteSnapshot.value ||
    (backgroundRouteSnapshot.value.fullPath === currentRoute.fullPath &&
      slideRouteStack.value.length === 0)
  )
}

const shouldRenderBackgroundRouteInMain = (currentRoute: RouteLocationNormalizedLoaded) => {
  return isMobile.value && shouldUseSlideTransition(currentRoute) && !!backgroundRouteSnapshot.value
}

const getMainRouteViewKey = (currentRoute: RouteLocationNormalizedLoaded) => {
  const routeName = String(currentRoute.name || '')
  const localeKey = String(currentRoute.params.locale || DEFAULT_LOCALE)
  const tabKey = String(currentRoute.params.tabKey || '')

  if (routeName === 'casino' || routeName === 'casinoTabKey') {
    return `casino-${localeKey}`
  }

  if (routeName === 'Localecasino' || routeName === 'LocalecasinoTabKey') {
    return `casino-${localeKey}`
  }

  if (routeName === 'gameList') {
    return `gamelist-${localeKey}-${tabKey}`
  }

  if (routeName === 'LocalegameList') {
    return `gamelist-${localeKey}-${tabKey}`
  }

  return currentRoute.fullPath
}

const resolveRouteSnapshot = (fullPath: string) => {
  return markRaw(router.resolve(fullPath) as RouteLocationNormalizedLoaded)
}

const isLocaleOnlyRouteChange = (
  previousRoute: RouteLocationNormalizedLoaded | null,
  nextRoute: RouteLocationNormalizedLoaded
) => {
  if (!previousRoute) {
    return false
  }

  const previousName = String(previousRoute.name || '').replace(/^Locale/, '')
  const nextName = String(nextRoute.name || '').replace(/^Locale/, '')

  return (
    previousName === nextName &&
    stripLocalePrefix(previousRoute.path) === stripLocalePrefix(nextRoute.path) &&
    previousRoute.hash === nextRoute.hash &&
    JSON.stringify(previousRoute.query || {}) === JSON.stringify(nextRoute.query || {})
  )
}

watch(
  () => ({
    fullPath: route.fullPath,
    isMobileDevice: isMobile.value,
    localeParam: route.params.locale as string | undefined,
    mobileOnly: route.meta?.mobileOnly === true
  }),
  ({ isMobileDevice, localeParam, mobileOnly }) => {
    if (!isMobileDevice && mobileOnly) {
      redirectMobileOnlyRouteToHome(localeParam)
    }
  },
  { immediate: true }
)

// 控制滑动动画
watch(
  () => ({ fullPath: route.fullPath, isMobileDevice: isMobile.value }),
  async ({ fullPath, isMobileDevice }, previousValue) => {
    const newPath = String(fullPath)
    const currentRouteSnapshot = resolveRouteSnapshot(newPath)
    const previousRouteSnapshot = previousValue?.fullPath
      ? resolveRouteSnapshot(String(previousValue.fullPath))
      : null
    const shouldSlide = shouldUseSlideTransition(currentRouteSnapshot)

    if (!shouldSlide || !isMobileDevice) {
      backgroundRouteSnapshot.value = currentRouteSnapshot

      if (slideRouteStack.value.length === 0) {
        return
      }

      for (const item of slideRouteStack.value) {
        item.showDrawer = false
      }

      setTimeout(() => {
        if (!shouldUseSlideTransition(route) || !isMobile.value) {
          slideRouteStack.value = []
        }
      }, DRAWER_TRANSITION_MS)

      return
    }

    if (isLocaleOnlyRouteChange(previousRouteSnapshot, currentRouteSnapshot)) {
      const previousFullPath = previousRouteSnapshot?.fullPath
      const currentSlideIndex = previousFullPath
        ? slideRouteStack.value.findIndex(item => item.path === previousFullPath)
        : -1

      if (currentSlideIndex !== -1) {
        slideRouteStack.value[currentSlideIndex] = {
          ...slideRouteStack.value[currentSlideIndex],
          path: newPath,
          route: currentRouteSnapshot,
          showDrawer: true
        }
      } else {
        backgroundRouteSnapshot.value = currentRouteSnapshot
      }

      return
    }

    if (!backgroundRouteSnapshot.value) {
      backgroundRouteSnapshot.value = currentRouteSnapshot
      slideRouteStack.value = []
      return
    }

    if (backgroundRouteSnapshot.value.fullPath === newPath) {
      if (slideRouteStack.value.length === 0) {
        return
      }

      for (const item of slideRouteStack.value) {
        item.showDrawer = false
      }

      setTimeout(() => {
        if (route.fullPath === newPath) {
          slideRouteStack.value = []
        }
      }, DRAWER_TRANSITION_MS)

      return
    }

    const existingIndex = slideRouteStack.value.findIndex(item => item.path === newPath)

    if (existingIndex === -1) {
      const newItem: SlideRouteItem = {
        path: newPath,
        route: currentRouteSnapshot,
        showDrawer: false
      }

      slideRouteStack.value.push(newItem)

      await nextTick()

      const targetItem = slideRouteStack.value.find(item => item.path === newPath)
      if (targetItem) {
        targetItem.showDrawer = true
      }
    } else {
      slideRouteStack.value[existingIndex].route = currentRouteSnapshot

      const itemsToRemove = slideRouteStack.value.slice(existingIndex + 1)
      for (const item of itemsToRemove) {
        item.showDrawer = false
      }

      setTimeout(() => {
        if (route.fullPath === newPath) {
          slideRouteStack.value = slideRouteStack.value.slice(0, existingIndex + 1)
        }
      }, DRAWER_TRANSITION_MS)
    }
  },
  { immediate: true, flush: 'post' }
)

const mainStyle = computed(() => {
  if (isFullscreenRoute.value) {
    return {}
  }

  if (isMobile.value) {
    return {
      marginBottom: `${layoutStore.BOTTOM_TAB_HEIGHT}px`
    }
  }

  return {
    marginTop: `${layoutStore.TOPNAV_HEIGHT}px`,
    marginLeft: isSidebarCollapsed.value
      ? `${layoutStore.SIDEBAR_WIDTH_COLLAPSED}px`
      : `${layoutStore.SIDEBAR_WIDTH_EXPANDED}px`
  }
})

const notificationPanelStyle = computed(() => ({
  top: `${layoutStore.TOPNAV_HEIGHT}px`,
  right: '16px',
  height: `calc(100vh - ${layoutStore.TOPNAV_HEIGHT}px)`
}))

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleCollapse()
  }
}

// 处理顶部导航通知按钮点击。
const handleNotificationClick = () => {
  if (isMobile.value) {
    navigateTo('/menu/notifications')
    return
  }

  if (showNotificationPanel.value) {
    activeNotificationDetail.value = null
  }

  showNotificationPanel.value = !showNotificationPanel.value
}

// 打开通知面板详情视图。
const handleNotificationDetailOpen = (detail: NotificationPanelDetail) => {
  activeNotificationDetail.value = detail
}

// 返回通知面板列表视图。
const handleNotificationDetailBack = () => {
  activeNotificationDetail.value = null
}

// 关闭通知侧边面板并重置详情状态。
const handleNotificationPanelClose = () => {
  showNotificationPanel.value = false
  activeNotificationDetail.value = null
}

const handleCollapseChange = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed
}

const openLanguageModal = () => {
  if (topNavRef.value) {
    topNavRef.value.openLanguageModal()
  }
}

interface MobileRouteMeta {
  hideBottomBar?: boolean
  hideTopNav?: boolean
}

const isFullscreenRoute = computed(() => route.meta?.fullScreen === true)

onMounted(() => {
  lastResolvedDeviceMode.value = isMobile.value
  hasViewportModeInitialized.value = true
  // 进站即拉分组，侧栏 Promotions 子菜单
  void promotionsStore.loadGroups()
})

const hideBottomBar = computed(() => {
  if (globalTicketToastState.visible && isMobile.value) {
    return true
  }

  return (route.meta?.mobile as MobileRouteMeta | undefined)?.hideBottomBar && isMobile.value
})

const hideTopNav = computed(() => {
  return (route.meta?.mobile as MobileRouteMeta | undefined)?.hideTopNav && isMobile.value
})

watch(
  () => isMobile.value,
  mobile => {
    if (mobile) {
      showNotificationPanel.value = false
      activeNotificationDetail.value = null
    }

    if (!hasViewportModeInitialized.value) {
      return
    }

    if (lastResolvedDeviceMode.value === null) {
      lastResolvedDeviceMode.value = mobile
      return
    }

    if (mobile === lastResolvedDeviceMode.value) {
      return
    }

    lastResolvedDeviceMode.value = mobile
    userStore.logout()
  }
)
</script>

<style scoped>
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
