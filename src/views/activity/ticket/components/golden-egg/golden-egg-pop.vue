<template>
  <LottiePlayer
    :path="popupAnimationPath"
    :autoplay="true"
    loop
    :respect-reduced-motion="false"
    class="golden-egg-popup-animation"
  />
</template>

<script setup lang="ts">
import LottiePlayer from '@/components/LottiePlayer.vue'
import { createBundledLottiePath } from '../../shared/lottieBundled'
import { onUnmounted } from 'vue'
import popupAnimation from './pop-up/pop-up.json'

const popupImages = import.meta.glob('./pop-up/images/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const popupAnimationPath = createBundledLottiePath(popupAnimation, popupImages)

onUnmounted(() => {
  URL.revokeObjectURL(popupAnimationPath)
})
</script>

<style scoped lang="scss">
.golden-egg-popup-animation {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  pointer-events: none;
}
</style>
