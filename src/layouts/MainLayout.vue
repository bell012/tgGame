<template>
  <div class="min-h-screen bg-bg-3">
    <!-- 顶部导航 -->
    <TopNav ref="topNavRef" @toggle-sidebar="toggleSidebar" />

    <!-- PC布局 (>640px) -->
    <div class="hidden sm:flex">
      <!-- 侧边栏 -->
      <Sidebar ref="sidebarRef" @open-language-modal="openLanguageModal" />

      <!-- 主内容区 -->
      <main
        class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out"
        :style="{
          marginTop: `${layoutStore.TOPNAV_HEIGHT}px`,
          marginLeft: isSidebarCollapsed
            ? `${layoutStore.SIDEBAR_WIDTH_COLLAPSED}px`
            : `${layoutStore.SIDEBAR_WIDTH_EXPANDED}px`
        }"
      >
        <div class="p-2">
          <router-view />
        </div>
      </main>
    </div>

    <!-- H5布局 (<=640px) -->
    <div class="sm:hidden">
      <!-- 主内容区 -->
      <main :class="[layoutStore.mainMarginTopClass, layoutStore.mainMarginBottomClass]">
        <div class="p-4">
          <router-view />
        </div>
      </main>

      <!-- 底部Tab栏 -->
      <BottomTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopNav from './TopNav.vue'
import Sidebar from './Sidebar.vue'
import BottomTabBar from './BottomTabBar.vue'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
const topNavRef = ref<InstanceType<typeof TopNav> | null>(null)
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleCollapse()
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }
}

const openLanguageModal = () => {
  if (topNavRef.value) {
    topNavRef.value.openLanguageModal()
  }
}
</script>


