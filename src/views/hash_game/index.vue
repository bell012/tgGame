<template>
  <div class="w-full h-full">
    <HashGameH5 v-if="isMobile" :page="page" />
    <HashGamePc v-else :page="page" />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import HashGameH5 from './h5.vue'
import HashGamePc from './pc.vue'
import { useHashGamePage } from './index'

const page = useHashGamePage()
const isMobile = useIsMobile()
</script>
