<template>
  <div class="flex min-h-screen">
    <!-- 顶部导航 -->
    <TopNav ref="topNavRef" @toggle-sidebar="toggleSidebar" v-if="!hideTopNav" />

    <!-- 侧边栏 -->
    <Sidebar
      v-if="!isMobile"
      class="hidden sm:flex"
      ref="sidebarRef"
      @open-language-modal="openLanguageModal"
      @collapse-change="handleCollapseChange"
    />

    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out" :style="mainStyle">
      <div class="p-0 sm:p-0 lg:p-4 px-[14px]">
        <router-view v-slot="{ Component, route: currentViewRoute }">
          <component
            v-if="shouldRenderCurrentRouteInMain(currentViewRoute)"
            :is="Component"
            :key="currentViewRoute.fullPath"
          />

          <router-view
            v-else-if="
              shouldRenderBackgroundRouteInMain(currentViewRoute) && backgroundRouteSnapshot
            "
            :route="backgroundRouteSnapshot"
            :key="backgroundRouteSnapshot.fullPath"
          />
        </router-view>
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
            :style="{ zIndex: 9999 + index }"
          >
            <router-view :route="item.route" :key="item.path" />
          </div>
        </transition>
      </template>
    </teleport>

    <!-- 底部Tab栏 -->
    <BottomTabBar class="sm:hidden" v-if="!hideBottomBar" />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import { getLocaleFromRouteParam, stripLocalePrefix, withLocalePrefix } from '@/utils/locale'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import BottomTabBar from './BottomTabBar.vue'
import Sidebar from './Sidebar.vue'
import TopNav from './TopNav.vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'

const layoutStore = useLayoutStore()
const topNavRef = ref<InstanceType<typeof TopNav> | null>(null)
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isSidebarCollapsed = ref(false)
const isMobile = useIsMobile()

const route = useRoute()
const router = useRouter()
const DRAWER_TRANSITION_MS = 350

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

const resolveRouteSnapshot = (fullPath: string) => {
  return router.resolve(fullPath) as RouteLocationNormalizedLoaded
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

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleCollapse()
  }
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

const hideBottomBar = computed(() => {
  return (route.meta?.mobile as MobileRouteMeta | undefined)?.hideBottomBar && isMobile.value
})

const hideTopNav = computed(() => {
  return (route.meta?.mobile as MobileRouteMeta | undefined)?.hideTopNav && isMobile.value
})
</script>
