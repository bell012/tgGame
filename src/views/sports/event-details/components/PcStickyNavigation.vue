<template>
  <div ref="anchorRef" :style="{ height: `${height}px` }">
    <div
      ref="contentRef"
      class="fixed z-20 bg-bg-1"
      :style="{ top: `${layoutStore.TOPNAV_HEIGHT}px`, left: `${left}px`, width: `${width}px` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useLayoutStore } from '@/stores/layout'

const emit = defineEmits<{ heightChange: [height: number] }>()
const layoutStore = useLayoutStore()
const anchorRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const height = ref(0)
const left = ref(0)
const width = ref(0)
let observer: ResizeObserver | undefined

// 占位跟随导航高度，固定层跟随内容列宽度，兼容侧栏展开及窗口缩放。
function updatePosition() {
  if (!anchorRef.value || !contentRef.value) return
  const rect = anchorRef.value.getBoundingClientRect()
  left.value = rect.left
  width.value = rect.width
  height.value = contentRef.value.getBoundingClientRect().height
  emit('heightChange', height.value)
}

onMounted(() => {
  observer = new ResizeObserver(updatePosition)
  if (anchorRef.value) observer.observe(anchorRef.value)
  if (contentRef.value) observer.observe(contentRef.value)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  updatePosition()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>
