<template>
  <div class="relative h-full w-full">
    <div
      v-show="!useFallback"
      ref="containerRef"
      class="h-full w-full [&_svg]:h-full [&_svg]:w-full"
      aria-hidden="true"
    />
    <Transition
      leave-active-class="transition-opacity duration-150 ease-out motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <img
        v-if="showPoster"
        :src="fallbackSrc"
        alt=""
        class="absolute inset-0 h-full w-full object-contain"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useLottieAnimation } from '@/composables/useLottieAnimation'
import type { LottieData } from '@/utils/lottie-data-cache'
import { computed, nextTick, onMounted, ref, toRef, watch } from 'vue'

interface Props {
  path: string
  animationData?: LottieData | null
  loop?: boolean
  autoplay?: boolean
  fallbackSrc?: string
  respectReducedMotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animationData: null,
  loop: true,
  autoplay: true,
  fallbackSrc: undefined,
  respectReducedMotion: true
})

const emit = defineEmits<{
  failed: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const loadFailed = ref(false)

const prefersReducedMotion = ref(false)

const useFallback = computed(
  () => loadFailed.value || (props.respectReducedMotion && prefersReducedMotion.value)
)

const autoplayEnabled = computed(() => props.autoplay && !useFallback.value)

const { load, failed, ready } = useLottieAnimation({
  container: containerRef,
  path: toRef(props, 'path'),
  animationData: toRef(props, 'animationData'),
  loop: toRef(props, 'loop'),
  autoplay: autoplayEnabled,
  onFailed: () => {
    loadFailed.value = true
    emit('failed')
  }
})

// 动画首帧上屏前用兜底图占位，避免出现空白。
const showPoster = computed(() => Boolean(props.fallbackSrc) && (useFallback.value || !ready.value))

watch(failed, value => {
  if (value) loadFailed.value = true
})

watch(
  () => props.path,
  () => {
    loadFailed.value = false
  }
)

onMounted(async () => {
  if (props.respectReducedMotion && typeof window !== 'undefined') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  await nextTick()
  if (!useFallback.value && containerRef.value) load()
})
</script>
