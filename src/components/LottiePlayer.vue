<template>
  <div class="relative h-full w-full">
    <div
      v-show="!useFallback"
      ref="containerRef"
      class="h-full w-full [&_svg]:h-full [&_svg]:w-full"
      aria-hidden="true"
    />
    <img
      v-if="useFallback && fallbackSrc"
      :src="fallbackSrc"
      alt=""
      class="h-full w-full object-contain"
    />
  </div>
</template>

<script setup lang="ts">
import { useLottieAnimation } from '@/composables/useLottieAnimation'
import { computed, onMounted, ref, toRef, watch } from 'vue'

interface Props {
  path: string
  loop?: boolean
  autoplay?: boolean
  fallbackSrc?: string
  respectReducedMotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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

const { load, failed } = useLottieAnimation({
  container: containerRef,
  path: toRef(props, 'path'),
  loop: toRef(props, 'loop'),
  autoplay: autoplayEnabled,
  onFailed: () => {
    loadFailed.value = true
    emit('failed')
  }
})

watch(failed, value => {
  if (value) loadFailed.value = true
})

watch(
  () => props.path,
  () => {
    loadFailed.value = false
  }
)

onMounted(() => {
  if (props.respectReducedMotion && typeof window !== 'undefined') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  if (!useFallback.value && containerRef.value) load()
})
</script>
