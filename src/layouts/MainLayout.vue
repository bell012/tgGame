<template>
  <div class="flex min-h-screen">
    <!-- 顶部导航 -->
    <TopNav
      v-if="showTopNav"
      ref="topNavRef"
      :sidebar-collapsed="isSidebarCollapsed"
      :style="topNavStyle"
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
    <main
      ref="mainContentRef"
      class="main-layout-content flex-1 overflow-y-auto bg-bg-1 sm:bg-bg-1"
      :class="{ 'transition-all duration-300 ease-in-out': !isMobile }"
      :style="mainStyle"
    >
      <!-- 主内容容器 -->
      <div :class="isFullscreenRoute ? 'min-h-full' : 'flex min-h-full items-start gap-4'">
        <!-- 路由内容区域 -->
        <section class="min-w-0 flex-1" :class="{ 'mobile-tab-stage': isMobile }">
          <!-- 主内容区：滑动路由场景下优先渲染背景页，避免 keep-alive 在双 router-view 间切换失效 -->
          <router-view
            v-if="mainAreaRoute"
            :route="mainAreaRoute"
            v-slot="{ Component, route: viewRoute }"
          >
            <template v-if="isMobile">
              <!-- 缓存容器保持稳定，Tab 切换只激活页面，不重建整棵组件树。 -->
              <!-- 登录身份变化时清理缓存，避免复用上一账号的页面数据。 -->
              <Transition
                name="bottom-tab"
                :css="isBottomTabTransition"
                @after-enter="finishBottomTabTransition"
              >
                <KeepAlive :key="mobileCacheScope" :max="8">
                  <component
                    :is="Component"
                    v-if="shouldCacheMobileRoute(viewRoute)"
                    :key="getMainRouteViewKey(viewRoute)"
                  />
                </KeepAlive>
              </Transition>
              <Transition
                name="bottom-tab"
                :css="isBottomTabTransition"
                @after-enter="finishBottomTabTransition"
              >
                <component
                  :is="Component"
                  v-if="!shouldCacheMobileRoute(viewRoute)"
                  :key="getMainRouteViewKey(viewRoute)"
                />
              </Transition>
            </template>
            <template v-else>
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
            </template>
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

    <!-- PC 客服独立占据页面最右侧，不参与主内容区的文档流。 -->
    <transition name="notification-panel">
      <aside
        v-if="isDesktopOverlayRoute && !isFullscreenRoute"
        class="fixed right-0 top-0 z-40 h-screen w-[380px] overflow-hidden"
      >
        <router-view :route="route" />
      </aside>
    </transition>

    <!-- 滑动路由层  -->
    <teleport to="body" v-if="isMobile && slideRouteStack.length > 0">
      <!-- 渲染所有滑动路由栈 -->
      <template v-for="(item, index) in slideRouteStack" :key="item.path">
        <transition
          name="drawer-slide"
          :css="item.animate"
          @after-leave="removeClosedDrawer(item.path)"
        >
          <div
            v-if="item.showDrawer"
            data-route-drawer
            class="fixed inset-0 overflow-hidden bg-bg-1"
            :style="{ zIndex: 99 + index }"
          >
            <router-view :route="item.route" :key="item.path" />
          </div>
        </transition>
      </template>
    </teleport>

    <!-- 底部Tab栏 -->
    <BottomTabBar class="sm:hidden" v-if="isMobile && !hideBottomBar" />

    <CheckInPopup v-model="checkInVisible" auto-popup-only />

    <!-- PC 右下角红包面板 -->
    <transition name="notification-panel">
      <RedPacketPanel
        v-if="redPacketPanelVisible && !isMobile"
        display-mode="pc"
        class="fixed bottom-[16px] right-[16px] z-40"
        :style="redPacketPanelStyle"
        @close="redPacketPanelStore.close()"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useNativeHistoryTransition } from '@/composables/useNativeHistoryTransition'
import { useCheckInModalStore } from '@/stores/checkInModal'
import { useLayoutStore } from '@/stores/layout'
import { usePromotionsStore } from '@/stores/promotions'
import { useRedPacketPanelStore } from '@/stores/redPacketPanel'
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
import {
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Component as VueComponent
} from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import BottomTabBar from './BottomTabBar.vue'
import Sidebar from './Sidebar.vue'
import TopNav from './TopNav.vue'
import { CheckInPopup, useCheckInAutoPopup } from '@/views/activity/check-in'
import { RedPacketPanel } from '@/views/activity/red-packet'
import { globalTicketToastState } from '@/views/activity/ticket/shell/ticketToast'

const layoutStore = useLayoutStore()
const { isSidebarCollapsed } = storeToRefs(layoutStore)
const redPacketPanelStore = useRedPacketPanelStore()
const { visible: redPacketPanelVisible } = storeToRefs(redPacketPanelStore)
const redPacketPanelStyle = computed(() => ({
  height: `min(780px, calc(100vh - ${layoutStore.TOPNAV_HEIGHT}px - 32px))`
}))
const promotionsStore = usePromotionsStore()
const checkInModalStore = useCheckInModalStore()
const userStore = useUserStore()
const mobileCacheScope = computed(() => userStore.userInfo?.tradeToken || 'guest')
const { visible: checkInVisible } = storeToRefs(checkInModalStore)
const topNavRef = ref<InstanceType<typeof TopNav> | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const showNotificationPanel = ref(false)
const activeNotificationDetail = ref<NotificationPanelDetail | null>(null)
const isMobile = useIsMobile()
const lastResolvedDeviceMode = ref<boolean | null>(null)
const hasViewportModeInitialized = ref(false)

const route = useRoute()
const router = useRouter()
const isBottomTabTransition = ref(false)
const removeBottomTabTransitionGuard = router.beforeEach((to, from) => {
  const fromRoute = from as RouteLocationNormalizedLoaded
  const toRoute = to as RouteLocationNormalizedLoaded
  isBottomTabTransition.value =
    isMobile.value &&
    (isBottomTabRoute(fromRoute) || isMobileMenuRoute(fromRoute)) &&
    (isBottomTabRoute(toRoute) || isMobileMenuRoute(toRoute)) &&
    getBottomTabIndex(fromRoute) !== getBottomTabIndex(toRoute) &&
    fromRoute.meta?.slideTransition !== true &&
    toRoute.meta?.slideTransition !== true
})
const removeBottomTabTransitionAfterEach = router.afterEach((_to, _from, failure) => {
  if (failure) isBottomTabTransition.value = false
})
const finishBottomTabTransition = () => {
  isBottomTabTransition.value = false
}
onBeforeUnmount(() => {
  removeBottomTabTransitionGuard()
  removeBottomTabTransitionAfterEach()
})
const consumeNativeHistoryTransition = useNativeHistoryTransition(
  router,
  () => isMobile.value && route.meta?.slideTransition === true
)

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
  animate: boolean
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

// 以真实退场结束事件清理，仅删除仍处于关闭状态的项，快速返回时保留已重新打开的抽屉。
const removeClosedDrawer = (path: string) => {
  slideRouteStack.value = slideRouteStack.value.filter(
    item => item.path !== path || item.showDrawer
  )
}

// 主区域当前应该显示的根背景页
const backgroundRouteSnapshot = shallowRef<RouteLocationNormalizedLoaded | null>(null)

const BOTTOM_TAB_ROUTE_NAMES = ['Home', 'explore', 'casino', 'sports', 'chat-public']
const getBottomTabIndex = (currentRoute: RouteLocationNormalizedLoaded) => {
  const name = String(currentRoute.name || '').replace(/^Locale/, '')
  return BOTTOM_TAB_ROUTE_NAMES.indexOf(name === 'casinoTabKey' ? 'casino' : name)
}
const isBottomTabRoute = (currentRoute: RouteLocationNormalizedLoaded) =>
  getBottomTabIndex(currentRoute) >= 0
const isMobileMenuRoute = (currentRoute: RouteLocationNormalizedLoaded) =>
  String(currentRoute.name || '').replace(/^Locale/, '') === 'menu'

const shouldCacheMobileRoute = (currentRoute: RouteLocationNormalizedLoaded) =>
  isBottomTabRoute(currentRoute) || currentRoute.meta?.keepAlive === true

// 判断是否应该使用滑动过渡动画
const shouldUseSlideTransition = (currentRoute: RouteLocationNormalizedLoaded) => {
  // 尊重路由配置，chat-public 与其他 slideTransition 页面使用同一套抽屉动画。
  return currentRoute.meta?.slideTransition === true
}

const shouldRenderCurrentRouteInMain = (currentRoute: RouteLocationNormalizedLoaded) => {
  if (!isMobile.value && currentRoute.meta?.desktopOverlay === true) {
    return false
  }

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
  if (!isMobile.value && currentRoute.meta?.desktopOverlay === true) {
    return !!backgroundRouteSnapshot.value
  }

  return isMobile.value && shouldUseSlideTransition(currentRoute) && !!backgroundRouteSnapshot.value
}

const mainAreaRoute = computed(() => {
  const currentRoute = route

  if (
    shouldRenderBackgroundRouteInMain(currentRoute) &&
    backgroundRouteSnapshot.value &&
    !shouldRenderCurrentRouteInMain(currentRoute)
  ) {
    return backgroundRouteSnapshot.value
  }

  if (shouldRenderCurrentRouteInMain(currentRoute)) {
    return currentRoute
  }

  return null
})

/** 判断当前路由是否应在 PC 端作为右侧客服面板展示。 */
const isDesktopOverlayRoute = computed(() => !isMobile.value && route.meta?.desktopOverlay === true)

const getMainRouteViewKey = (currentRoute: RouteLocationNormalizedLoaded) => {
  const routeName = String(currentRoute.name || '')
  const localeKey = String(currentRoute.params.locale || DEFAULT_LOCALE)
  const tabKey = String(currentRoute.params.tabKey || '')

  // 球种路由由体育首页监听切换，不因 URL 变化重建页面及轮询。
  if (routeName === 'sports' || routeName === 'Localesports') {
    return `sports-${localeKey}`
  }

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

  // 搜索页会同步筛选条件到 query；查询参数变化只更新页面，不创建新的缓存实例。
  if (isMobile.value && isBottomTabRoute(currentRoute)) {
    return `bottom-tab-${routeName}-${localeKey}`
  }

  return currentRoute.fullPath
}

// 缓存页面各自保留滚动位置，在 DOM 更新后、浏览器绘制前恢复，避免先露出错误位置再跳动。
const mobileScrollPositions = new Map<string, { windowTop: number; mainTop: number }>()
watch(
  () => {
    const currentRoute = mainAreaRoute.value
    return isMobile.value && currentRoute ? getMainRouteViewKey(currentRoute) : ''
  },
  async (key, previousKey) => {
    if (!key) return
    if (previousKey) {
      mobileScrollPositions.set(previousKey, {
        windowTop: window.scrollY,
        mainTop: mainContentRef.value?.scrollTop ?? 0
      })
    }
    if (!mainAreaRoute.value || !isBottomTabRoute(mainAreaRoute.value)) return

    await nextTick()
    const position = mobileScrollPositions.get(key)
    mainContentRef.value?.scrollTo({ top: position?.mainTop ?? 0, behavior: 'instant' })
    window.scrollTo({ top: position?.windowTop ?? 0, behavior: 'instant' })
  },
  { immediate: true }
)
const resolveRouteSnapshot = (fullPath: string) => {
  return markRaw(router.resolve(fullPath) as RouteLocationNormalizedLoaded)
}
/** 预加载左侧背景页，避免首次直达客服页时将异步组件错误渲染为 Promise。 */
const preloadRouteComponents = async (targetRoute: RouteLocationNormalizedLoaded) => {
  await Promise.all(
    targetRoute.matched.map(async record => {
      const routeComponent = record.components?.default
      if (typeof routeComponent !== 'function') {
        return
      }

      const loader = routeComponent as () => Promise<{ default: VueComponent }>
      const loadedModule = await loader()
      if (record.components) {
        record.components.default = loadedModule.default
      }
    })
  )
}

// PC/H5 视口模式切换时回到首页，并清理只属于当前布局的临时状态；登录态保持不变。
const redirectViewportModeChangeToHome = (localeParam?: string) => {
  const targetLocale = getLocaleFromRouteParam(localeParam)
  const targetHomePath = withLocalePrefix('/', targetLocale)

  showNotificationPanel.value = false
  activeNotificationDetail.value = null
  slideRouteStack.value = []
  backgroundRouteSnapshot.value = resolveRouteSnapshot(targetHomePath)

  if (route.fullPath !== targetHomePath) {
    void router.replace(targetHomePath)
  }
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
    // iOS 右滑已由浏览器完成动画，此次仅同步抽屉栈；按钮返回仍播放 CSS 动画。
    const animateDrawer = !consumeNativeHistoryTransition(newPath)
    const currentRouteSnapshot = resolveRouteSnapshot(newPath)
    const previousRouteSnapshot = previousValue?.fullPath
      ? resolveRouteSnapshot(String(previousValue.fullPath))
      : null
    const shouldSlide = shouldUseSlideTransition(currentRouteSnapshot)

    // PC 打开客服时保留进入前页面；直接访问客服页时在左侧显示首页。
    if (!isMobileDevice && currentRouteSnapshot.meta?.desktopOverlay === true) {
      if (
        !backgroundRouteSnapshot.value ||
        backgroundRouteSnapshot.value.fullPath === currentRouteSnapshot.fullPath
      ) {
        const locale = getLocaleFromRouteParam(
          currentRouteSnapshot.params.locale as string | undefined
        )
        const fallbackRoute = resolveRouteSnapshot(withLocalePrefix('/', locale))
        await preloadRouteComponents(fallbackRoute)
        backgroundRouteSnapshot.value = fallbackRoute
      }
      return
    }

    if (!shouldSlide || !isMobileDevice) {
      backgroundRouteSnapshot.value = currentRouteSnapshot

      if (!animateDrawer) {
        // 原生返回直接卸载整个过渡组件，避免旧抽屉节点再走一轮 leave。
        slideRouteStack.value = []
        return
      }

      if (slideRouteStack.value.length === 0) {
        return
      }

      for (const item of slideRouteStack.value) {
        item.animate = animateDrawer
        item.showDrawer = false
      }

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
      if (!animateDrawer) {
        slideRouteStack.value = []
        return
      }

      if (slideRouteStack.value.length === 0) {
        return
      }

      for (const item of slideRouteStack.value) {
        item.animate = animateDrawer
        item.showDrawer = false
      }

      return
    }

    const existingIndex = slideRouteStack.value.findIndex(item => item.path === newPath)

    if (!animateDrawer) {
      // 原生历史动画已经展示目标页：一次渲染内还原栈，直接移除其上的过渡组件。
      // 目标不在当前栈时直接以打开状态挂载，不再先隐藏、nextTick 后再触发入场。
      if (existingIndex === -1) {
        slideRouteStack.value = [
          { path: newPath, route: currentRouteSnapshot, showDrawer: true, animate: false }
        ]
      } else {
        const targetItem = slideRouteStack.value[existingIndex]
        targetItem.route = currentRouteSnapshot
        targetItem.showDrawer = true
        targetItem.animate = false
        slideRouteStack.value = slideRouteStack.value.slice(0, existingIndex + 1)
      }
      return
    }

    if (existingIndex === -1) {
      const newItem: SlideRouteItem = {
        path: newPath,
        route: currentRouteSnapshot,
        showDrawer: false,
        animate: animateDrawer
      }

      slideRouteStack.value.push(newItem)

      await nextTick()

      const targetItem = slideRouteStack.value.find(item => item.path === newPath)
      if (targetItem && route.fullPath === newPath && isMobile.value) {
        targetItem.showDrawer = true
      } else if (targetItem && !targetItem.showDrawer) {
        // 尚未显示就被新导航取代的项没有 after-leave，直接清理以免残留在栈中。
        removeClosedDrawer(newPath)
      }
    } else {
      slideRouteStack.value[existingIndex].route = currentRouteSnapshot
      slideRouteStack.value[existingIndex].animate = animateDrawer
      slideRouteStack.value[existingIndex].showDrawer = true

      const itemsToRemove = slideRouteStack.value.slice(existingIndex + 1)
      for (const item of itemsToRemove) {
        item.animate = animateDrawer
        item.showDrawer = false
      }
    }
  },
  // 渲染前确定背景页与抽屉层，避免客服先在主区域挂载，再移到抽屉中挂载第二次。
  { immediate: true, flush: 'pre' }
)

const mainStyle = computed(() => {
  if (isFullscreenRoute.value) {
    return {}
  }

  if (isMobile.value) {
    return {
      marginBottom: `calc(${layoutStore.BOTTOM_TAB_HEIGHT}px + var(--app-shell-bottom-safe-offset))`
    }
  }

  return {
    marginTop: `${layoutStore.TOPNAV_HEIGHT}px`,
    marginLeft: isSidebarCollapsed.value
      ? `${layoutStore.SIDEBAR_WIDTH_COLLAPSED}px`
      : `${layoutStore.SIDEBAR_WIDTH_EXPANDED}px`,
    marginRight: isDesktopOverlayRoute.value ? '380px' : undefined
  }
})

/** PC 打开客服时，顶部导航仅占据左侧页面区域。 */
const topNavStyle = computed(() => ({
  right: isDesktopOverlayRoute.value ? '380px' : undefined
}))

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

const showTopNav = computed(() => {
  if (isFullscreenRoute.value) {
    return false
  }

  return !hideTopNav.value || (isMobile.value && slideRouteStack.value.length > 0)
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
    redirectViewportModeChangeToHome(route.params.locale as string | undefined)
  }
)
</script>

<style scoped>
/* 横向入场时裁掉溢出的边缘，避免出现横向滚动条。 */
.mobile-tab-stage {
  overflow-x: clip;
}

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
