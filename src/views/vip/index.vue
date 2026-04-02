<template>
  <div>
    <MobileLayout v-if="isReady && isMobile" />
    <PcLayout v-else-if="isReady" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import MobileLayout from './mobile.vue'
import PcLayout from './pc-layout.vue'

const isMobile = useIsMobile()
const isReady = ref(false)

onMounted(() => {
  isReady.value = true
})
</script>
