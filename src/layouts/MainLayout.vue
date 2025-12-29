<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <TopNav />

    <!-- PC布局 (>640px) -->
    <div class="hidden sm:flex">
      <!-- 侧边栏 -->
      <Sidebar />

      <!-- 主内容区 -->
      <main class="main-content pc">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>

    <!-- H5布局 (<=640px) -->
    <div class="sm:hidden">
      <!-- 主内容区 -->
      <main class="main-content mobile">
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
import TopNav from './TopNav.vue'
import Sidebar from './Sidebar.vue'
import BottomTabBar from './BottomTabBar.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background-color: var(--color-background-level-2);
}

.main-content {
  overflow-y: auto;
}

.main-content.pc {
  flex: 1;
  margin-left: 16rem;
  margin-top: 4rem;
}

.main-content.mobile {
  margin-top: 4rem;
  margin-bottom: 4rem;
}
</style>
