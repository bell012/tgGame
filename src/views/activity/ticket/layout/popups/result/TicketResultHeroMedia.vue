<template>
  <div
    v-if="media.kind !== 'none'"
    class="my-4 flex items-center justify-center"
    :class="sizeClass"
  >
    <component :is="media.component" v-if="media.kind === 'component'" class="h-full w-full" />
    <LottiePlayer
      v-else-if="media.kind === 'lottie'"
      :path="media.path"
      :loop="media.loop"
      :fallback-src="media.fallbackSrc"
      :autoplay="playing"
      class="h-full w-full"
    />
    <img
      v-else-if="media.kind === 'image'"
      :src="media.src"
      alt=""
      class="h-full w-full object-contain"
    />
  </div>
</template>

<script setup lang="ts">
import LottiePlayer from '@/components/LottiePlayer.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { HeroMedia } from './heroMedia'
import { computed } from 'vue'

interface Props {
  media: HeroMedia
  playing: boolean
}

const props = defineProps<Props>()

const isMobile = useIsMobile()

const sizeClass = computed(() => {
  if (props.media.kind === 'none') return ''

  const isLarge = props.media.size === 'lg'
  if (isLarge) {
    return isMobile.value ? 'h-[231px] w-[231px]' : 'h-[280px] w-[280px]'
  }

  return isMobile.value ? 'h-[160px] w-[160px]' : 'h-[200px] w-[200px]'
})
</script>
