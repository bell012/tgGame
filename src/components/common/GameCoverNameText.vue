<template>
  <span
    ref="textRef"
    class="w-full min-w-0 line-clamp-2 break-words text-center font-impact-infoma-ultra text-common-100"
    :style="textStyle"
  >
    {{ name ?? '' }}
  </span>
</template>

<script setup lang="ts">
import {
  resolveGameCoverNameTypography,
  type ResolvedGameCoverNameTypography
} from '@/utils/gameCoverNameTypography'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    name?: string | null
  }>(),
  {
    name: ''
  }
)

const textRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)

const DEFAULT_TYPOGRAPHY: ResolvedGameCoverNameTypography = {
  tier: 'max',
  fontSize: 24,
  lineHeight: 24,
  fontWeight: 400
}

const typography = ref<ResolvedGameCoverNameTypography>(DEFAULT_TYPOGRAPHY)

let resizeObserver: ResizeObserver | null = null

const updateContainerWidth = () => {
  containerWidth.value = textRef.value?.clientWidth ?? 0
}

const updateTypography = () => {
  if (!containerWidth.value) {
    typography.value = DEFAULT_TYPOGRAPHY
    return
  }

  typography.value = resolveGameCoverNameTypography(props.name ?? '', containerWidth.value)
}

const textStyle = computed(() => ({
  fontSize: `${typography.value.fontSize}px`,
  lineHeight: `${typography.value.lineHeight}px`,
  fontWeight: typography.value.fontWeight
}))

watch([() => props.name, containerWidth], () => {
  updateTypography()
})

onMounted(async () => {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }

  updateContainerWidth()
  updateTypography()

  if (typeof ResizeObserver === 'undefined' || !textRef.value) {
    return
  }

  resizeObserver = new ResizeObserver(() => {
    updateContainerWidth()
  })
  resizeObserver.observe(textRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
