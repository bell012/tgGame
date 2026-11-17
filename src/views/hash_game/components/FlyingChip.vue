<template>
  <!-- 飞筹码动画 -->
  <span
    ref="chip"
    class="fixed z-[1300] grid place-items-center pointer-events-none will-change-transform [transform-style:preserve-3d] [filter:drop-shadow(0_7px_0_rgb(0_0_0_/_38%))_drop-shadow(0_10px_8px_rgb(0_0_0_/_24%))] after:content-[''] after:absolute after:inset-[2px_0_-7px] after:z-0 after:rounded-full after:bg-[linear-gradient(180deg,rgb(86_94_94_/_90%),rgb(31_36_36_/_94%))] after:shadow-[0_5px_0_rgb(0_0_0_/_28%)] after:[transform:translateZ(-1px)]"
    aria-hidden="true"
    :style="{
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${size * 0.52}px`
    }"
  >
    <img
      :src="origin.image"
      alt=""
      class="absolute inset-0 z-[1] size-full rounded-full"
      :style="{ filter: origin.filter }"
    />
    <b
      class="relative z-[1] font-['Baloo_2'] font-bold leading-none text-[var(--Color-game-white)]"
    >
      {{ origin.amount }}
    </b>
  </span>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
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
  const start = `translate(${dx}px, ${dy}px) scale(${props.origin.size / props.size}) perspective(600px) rotateZ(-12deg) rotateX(24deg) rotateY(-10deg)`
  const end =
    'translate(0, 0) scale(1) perspective(420px) rotateZ(0deg) rotateX(0deg) rotateY(0deg)'
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
