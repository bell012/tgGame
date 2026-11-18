<template>
  <!-- 飞筹码动画 -->
  <span
    ref="chip"
    class="fixed z-[1300] pointer-events-none will-change-transform"
    aria-hidden="true"
    :style="{
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${size * 0.34}px`
    }"
  >
    <BetChip :amount="origin.amount" :filter="origin.filter" />
  </span>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BetChip from './BetChip.vue'
import type { ChipOrigin } from './chipMotion'

const props = defineProps<{
  origin: ChipOrigin
  x: number
  y: number
  size: number
}>()
const emit = defineEmits<{ (event: 'finish'): void }>()
const chip = ref<HTMLElement>()
let animation: Animation | undefined
let fallbackTimer: number | undefined

onMounted(() => {
  const element = chip.value
  if (!element) return

  const dx = props.origin.x - props.x
  const dy = props.origin.y - props.y
  // 飞行与落位使用同一枚透视筹码，动画结束时回到水平角度。
  const start = `translate3d(${dx}px, ${dy}px, 0) scale(${props.origin.size / props.size}) rotate(-6deg)`
  const end = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
  const reducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reducedMotion ? 0 : 560

  if (typeof element.animate === 'function') {
    animation = element.animate([{ transform: start }, { transform: end }], {
      duration,
      easing: 'cubic-bezier(.22, .61, .36, 1)',
      fill: 'both'
    })
    animation.onfinish = () => emit('finish')
    return
  }

  element.style.transform = start
  requestAnimationFrame(() => {
    if (!chip.value) return
    chip.value.style.transition = `transform ${duration}ms cubic-bezier(.22, .61, .36, 1)`
    chip.value.style.transform = end
    fallbackTimer = window.setTimeout(() => emit('finish'), duration)
  })
})

onBeforeUnmount(() => {
  if (animation) {
    animation.onfinish = null
    animation.cancel()
  }
  if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer)
})
</script>
