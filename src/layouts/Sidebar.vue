<template>
  <aside
    class="sidebar"
    :style="{
      width: isCollapsed
        ? `${layoutStore.SIDEBAR_WIDTH_COLLAPSED}px`
        : `${layoutStore.SIDEBAR_WIDTH_EXPANDED}px`
    }"
  >
    <nav class="flex flex-col px-3 py-2 pb-3">
      <Menu :is-collapsed="isCollapsed" @open-language-modal="emit('open-language-modal')" />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Menu from '@/components/Menu.vue'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
const isCollapsed = ref(false)

const emit = defineEmits<{
  'open-language-modal': []
}>()

defineExpose({
  toggleCollapse: () => {
    isCollapsed.value = !isCollapsed.value
  }
})
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: v-bind('layoutStore.TOPNAV_HEIGHT + "px"');
  bottom: 0;
  background-color: var(--color-background-level-5);
  overflow-y: auto;
  overflow-x: visible;
  transition: width 0.3s ease;
  z-index: 100;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  // H5 隐藏侧边栏
  @media (max-width: v-bind('layoutStore.mobileBreakpointMedia')) {
    display: none;
  }
}
</style>
