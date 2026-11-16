<template>
  <div
    ref="surface"
    class="liquid-glass tg-glass-tokens pointer-events-none absolute inset-0 rounded-[inherit]"
    :style="filterStyle"
    aria-hidden="true"
  >
    <svg class="absolute h-0 w-0 overflow-hidden" focusable="false">
      <defs>
        <filter
          :id="filterId"
          x="0"
          y="0"
          :width="geometry.width"
          :height="geometry.height"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feImage
            :href="geometry.map"
            :width="geometry.width"
            :height="geometry.height"
            preserveAspectRatio="none"
            result="map"
          />
          <feGaussianBlur
            in="SourceGraphic"
            :stdDeviation="options.blur"
            edgeMode="duplicate"
            result="source"
          />
          <feDisplacementMap
            in="source"
            in2="map"
            xChannelSelector="R"
            yChannelSelector="G"
            :scale="options.strength"
            result="dr"
          />
          <feColorMatrix
            in="dr"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feDisplacementMap
            in="source"
            in2="map"
            xChannelSelector="R"
            yChannelSelector="G"
            :scale="options.strength * (1 - 0.07 * options.chroma)"
            result="dg"
          />
          <feColorMatrix
            in="dg"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="g"
          />
          <feDisplacementMap
            in="source"
            in2="map"
            xChannelSelector="R"
            yChannelSelector="G"
            :scale="options.strength * (1 - 0.14 * options.chroma)"
            result="db"
          />
          <feColorMatrix
            in="db"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="b"
          />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" result="rgb" />
          <feColorMatrix in="rgb" type="saturate" :values="String(options.saturation)" />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { createLiquidGlassMap } from './liquidGlassMap'

const surface = ref<HTMLElement | null>(null)
const filterId = `tg-glass-${useId().replace(/:/g, '-')}`
const enabled = ref(false)
const geometry = ref({ width: 1, height: 1, map: '' })
const options = ref({ strength: 0, blur: 0, chroma: 0, saturation: 1 })
const filterStyle = computed(() => {
  const value = enabled.value && geometry.value.map ? `url(#${filterId})` : undefined
  return { backdropFilter: value, WebkitBackdropFilter: value }
})

let observer: ResizeObserver | undefined
let themeObserver: MutationObserver | undefined
let preferences: MediaQueryList[] = []
let frame = 0

function update() {
  const element = surface.value
  if (!element) return
  enabled.value =
    /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent) &&
    !preferences.some(query => query.matches) &&
    document.documentElement.dataset.glassRefract !== 'off'
  if (!enabled.value || !element.offsetWidth || !element.offsetHeight) return
  const style = getComputedStyle(element)
  const read = (name: string, fallback: number) => {
    const value = Number.parseFloat(style.getPropertyValue(name))
    return Number.isFinite(value) ? value : fallback
  }
  // The project's PostCSS pipeline converts px tokens to rem; SVG expects CSS pixels.
  const readLength = (name: string, fallback: number) => {
    const raw = style.getPropertyValue(name).trim()
    const value = Number.parseFloat(raw)
    if (!Number.isFinite(value)) return fallback
    if (raw.endsWith('rem')) {
      return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    }
    if (raw.endsWith('em')) return value * Number.parseFloat(style.fontSize)
    return value
  }
  const strength = Math.max(0, read('--glass-refraction', 0))
  enabled.value = strength > 0
  if (!enabled.value) return
  options.value = {
    strength,
    blur: Math.max(0, readLength('--glass-blur', 13)),
    chroma: Math.min(1, Math.max(0, read('--glass-chroma', 0.9))),
    saturation: Math.max(0, read('--glass-saturation', 180) / 100)
  }
  const width = element.offsetWidth
  const height = element.offsetHeight
  geometry.value = {
    width,
    height,
    map: createLiquidGlassMap(
      width,
      height,
      Number.parseFloat(style.borderTopLeftRadius) || 20,
      readLength('--glass-bezel', 20)
    )
  }
}

function scheduleUpdate() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

onMounted(() => {
  preferences = [
    '(prefers-reduced-transparency: reduce)',
    '(prefers-contrast: more)',
    '(prefers-reduced-motion: reduce)',
    '(forced-colors: active)',
    '(pointer: coarse)'
  ].map(query => window.matchMedia(query))
  preferences.forEach(query => query.addEventListener('change', update))
  update()
  observer = new ResizeObserver(scheduleUpdate)
  if (surface.value) observer.observe(surface.value)
  themeObserver = new MutationObserver(scheduleUpdate)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-glass-refract']
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  themeObserver?.disconnect()
  preferences.forEach(query => query.removeEventListener('change', update))
})
</script>

<style scoped>
.liquid-glass {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(var(--glass-blur-fallback)) saturate(var(--glass-saturation));
  backdrop-filter: blur(var(--glass-blur-fallback)) saturate(var(--glass-saturation));
}

@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  .liquid-glass {
    background: var(--glass-solid-bg);
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    box-shadow: none;
  }
}

@media (prefers-contrast: more) {
  .liquid-glass {
    outline: 2px solid var(--glass-solid-text);
  }
}

@media (forced-colors: active) {
  .liquid-glass {
    outline: 1px solid CanvasText;
  }
}
</style>
