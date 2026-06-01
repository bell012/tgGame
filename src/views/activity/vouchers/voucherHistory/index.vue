<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="voucherHistory-mobile-page fixed inset-0 bg-bg-1 sm:hidden flex flex-col overflow-hidden"
    >
      票卷记录H5布局
    </div>

    <WalletLayout v-else-if="isReady" current-tab="voucherHistory">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useIsMobile } from '@/composables/useMediaQuery'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'

const isMobile = useIsMobile()
const isReady = ref(false)

usePageScrollLock(() => isMobile.value)

onMounted(() => {
  isReady.value = true
})
</script>

<style scoped lang="scss">
.voucherHistory-mobile-page {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}
</style>
