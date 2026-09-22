<template>
  <!-- 根据断点选择 H5 或 PC 客服布局。 -->
  <H5Layout v-if="isMobile" />
  <PcLayout v-else />
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Layout from './h5-layout.vue'
import PcLayout from './pc-layout.vue'

const isMobile = useIsMobile()
</script>
