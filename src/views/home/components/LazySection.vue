<template>
  <div ref="containerRef" class="w-full">
    <slot v-if="shouldRender"></slot>
    <slot v-else name="placeholder"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const props = withDefaults(
  defineProps<{
    rootMargin?: string
    threshold?: number | number[]
    eager?: boolean
  }>(),
  {
    rootMargin: '300px 0px',
    threshold: 0,
    eager: false
  }
)

const containerRef = ref<HTMLElement | null>(null)
const shouldRender = ref(props.eager)

const observer = useIntersectionObserver({
  target: containerRef,
  rootMargin: props.rootMargin,
  threshold: props.threshold,
  enabled: computed(() => !shouldRender.value),
  once: true,
  onChange: ({ isIntersecting }) => {
    if (isIntersecting) {
      shouldRender.value = true
    }
  }
})

if (!observer.isSupported) {
  shouldRender.value = true
}
</script>
