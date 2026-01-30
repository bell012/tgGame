<template>
  <div class="flex min-h-screen">
    <!-- 顶部导航 -->
    <TopNav ref="topNavRef" @toggle-sidebar="toggleSidebar" />

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
        <router-view />
      </div>
    </main>

    <!-- 底部Tab栏 -->
    <BottomTabBar class="sm:hidden" />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import { computed, ref } from 'vue'
import BottomTabBar from './BottomTabBar.vue'
import Sidebar from './Sidebar.vue'
import TopNav from './TopNav.vue'

const layoutStore = useLayoutStore()
const topNavRef = ref<InstanceType<typeof TopNav> | null>(null)
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isSidebarCollapsed = ref(false)

const isMobile = useIsMobile()
const mainStyle = computed(() => {
  if (isMobile.value) {
    return {
      marginTop: `${layoutStore.TOPNAV_HEIGHT}px`,
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
</script>
