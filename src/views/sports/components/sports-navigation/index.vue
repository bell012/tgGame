<template>
  <div
    class="sports-navigation w-full"
    :class="isMobile ? 'min-h-full bg-bg-1 pl-[14px]' : 'px-[24px] pt-4'"
    :style="pageStyle"
  >
    <SportsNavigationH5 v-if="isMobile" v-bind="$attrs" />
    <SportsNavigationPc v-else v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useIsMobile } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'

import SportsNavigationH5 from './h5.vue'
import SportsNavigationPc from './pc.vue'

const isMobile = useIsMobile()
const layoutStore = useLayoutStore()

const pageStyle = computed(() => {
  if (!isMobile.value) {
    return undefined
  }

  return {
    paddingTop: `${layoutStore.TOPNAV_HEIGHT + 10}px`,
    paddingBottom: `12px`
  }
})
</script>
