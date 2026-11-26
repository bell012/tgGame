<template>
  <div
    v-show="active"
    class="pointer-events-none fixed inset-0 z-[1]"
    style="--game-floating-orb: rgba(0, 0, 0, 0.5)"
    :style="{
      '--game-floating-bg': isMobile ? 'rgba(27,29,30,.8)' : 'rgba(0,0,0,.6)',
      '--game-floating-border': isMobile ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.15)'
    }"
  >
    <button
      v-if="expanded"
      type="button"
      class="pointer-events-auto absolute inset-0 size-full"
      :aria-label="t('common.cancel')"
      @click="expanded = false"
    />
    <div
      ref="bounds"
      class="absolute bottom-[calc(env(safe-area-inset-bottom)+12px)] left-[calc(env(safe-area-inset-left)+12px)] right-[calc(env(safe-area-inset-right)+12px)] top-[calc(env(safe-area-inset-top)+12px)] sm:inset-8"
    >
      <div
        ref="control"
        class="absolute size-[50px] sm:size-[72px]"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      >
        <Transition
          enter-active-class="transition-[opacity,transform] duration-200 motion-reduce:transition-none"
          leave-active-class="transition-[opacity,transform] duration-200 motion-reduce:transition-none"
          :enter-from-class="menuHiddenClass"
          :leave-to-class="menuHiddenClass"
        >
          <div
            v-if="expanded"
            class="pointer-events-auto absolute top-2 flex h-[34px] w-[227px] max-w-[calc(100vw-env(safe-area-inset-left)-env(safe-area-inset-right)-86px)] items-center gap-[15px] sm:top-2.5 sm:h-[52px] sm:w-[334px] sm:gap-5"
            :class="
              side === 'right'
                ? 'right-[62px] sm:right-[92px] origin-right'
                : 'left-[62px] sm:left-[92px] origin-left'
            "
          >
            <CurrencySelect
              floating
              class="min-w-0 flex-1"
              :disabled="disabled || frameLoading"
              :change-currency="changeCurrency"
              @deposit="emit('deposit')"
            />
            <div class="flex shrink-0 gap-[7px] sm:gap-3">
              <button
                type="button"
                class="flex size-[34px] items-center justify-center rounded-[10px] border border-[var(--game-floating-border)] bg-[var(--game-floating-bg)] disabled:opacity-50 sm:size-[52px] sm:rounded-xl"
                :aria-label="t('gameDetail.exitGame')"
                :disabled="disabled"
                @click="activate('exit')"
              >
                <img :src="exitIcon" alt="" class="size-3.5 sm:size-[21.41px]" />
              </button>
              <button
                type="button"
                class="flex size-[34px] items-center justify-center rounded-[10px] border border-[var(--game-floating-border)] bg-[var(--game-floating-bg)] disabled:opacity-50 sm:size-[52px] sm:rounded-xl"
                :aria-label="t('gameDetail.collapseGame')"
                :disabled="disabled"
                @click="activate('collapse')"
              >
                <img :src="collapseIcon" alt="" class="size-[18px] sm:size-[27.53px]" />
              </button>
            </div>
          </div>
        </Transition>
        <button
          ref="toggle"
          type="button"
          class="pointer-events-auto relative flex size-[50px] touch-none select-none items-center justify-center rounded-full transition-opacity duration-300 motion-reduce:transition-none sm:size-[72px]"
          :class="[
            expanded
              ? 'border border-[var(--game-floating-border)] bg-[var(--game-floating-bg)]'
              : 'bg-[var(--game-floating-orb)]',
            idle ? 'opacity-30' : 'opacity-100'
          ]"
          :aria-label="t(expanded ? 'common.cancel' : 'bottom_tab_bar.menu')"
          :aria-expanded="expanded"
          @pointerdown="startDrag"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @lostpointercapture="endDrag"
          @dragstart.prevent
          @click="toggleMenu"
          @keydown.esc="expanded = false"
          @focus="wake"
          @blur="scheduleIdle"
        >
          <CloseIcon v-if="expanded" class="size-3.5 text-common-100 sm:size-9" />
          <template v-else>
            <span
              class="pointer-events-none absolute size-[35.67px] rounded-full bg-common-100 opacity-[0.18] sm:size-[51.36px]"
            />
            <span
              class="pointer-events-none absolute size-[28.33px] rounded-full bg-common-100 opacity-[0.24] sm:size-[40.8px]"
            />
            <span
              class="pointer-events-none absolute size-[21px] rounded-full bg-common-100 opacity-50 sm:size-[30.24px]"
            />
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import exitIcon from '@/static/svg/game/detail/top/floating-exit.svg?url'
import collapseIcon from '@/static/svg/game/detail/top/floating-collapse.svg?url'
import CurrencySelect from '../h5/currency-select/index.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const props = defineProps<{
  active: boolean
  disabled: boolean
  frameLoading: boolean
  changeCurrency: (value: string) => Promise<boolean>
}>()
const emit = defineEmits<{ exit: []; collapse: []; deposit: [] }>()
const isMobile = useIsMobile()
const { t } = useI18n()
const bounds = ref<HTMLElement>()
const control = ref<HTMLElement>()
const toggle = ref<HTMLButtonElement>()
const expanded = ref(false)
const idle = ref(false)
const side = ref<'left' | 'right'>('right')
const position = ref({ x: 0, y: isMobile.value ? 8 : 0 })
const menuHiddenClass = computed(() =>
  side.value === 'right' ? 'translate-x-2 scale-95 opacity-0' : '-translate-x-2 scale-95 opacity-0'
)
let observer: ResizeObserver | undefined
let idleTimer: ReturnType<typeof setTimeout> | undefined
let snapAnimation: Animation | undefined
let suppressClick = false
let drag:
  { id: number; x: number; y: number; originX: number; originY: number; moved: boolean } | undefined

const wake = () => {
  clearTimeout(idleTimer)
  idleTimer = undefined
  idle.value = false
}
const scheduleIdle = () => {
  wake()
  if (props.active && !expanded.value && !drag)
    idleTimer = setTimeout(() => {
      idle.value = true
    }, 5000)
}
const limits = () => ({
  x: Math.max(0, (bounds.value?.clientWidth ?? 0) - (control.value?.offsetWidth ?? 50)),
  y: Math.max(0, (bounds.value?.clientHeight ?? 0) - (control.value?.offsetHeight ?? 50))
})
const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max))
const releaseDrag = () => {
  const pointer = drag
  drag = undefined
  if (pointer && toggle.value?.hasPointerCapture(pointer.id))
    toggle.value.releasePointerCapture(pointer.id)
}
const fitToViewport = () => {
  if (!props.active) return
  releaseDrag()
  snapAnimation?.cancel()
  snapAnimation = undefined
  const max = limits()
  position.value = { x: side.value === 'right' ? max.x : 0, y: clamp(position.value.y, max.y) }
  scheduleIdle()
}
const startDrag = (event: PointerEvent) => {
  if (!event.isPrimary || event.button !== 0 || drag) return
  wake()
  suppressClick = false
  if (expanded.value) return
  // 中断吸边时从当前视觉位置继续拖动，避免按钮跳到动画终点。
  if (snapAnimation && control.value && bounds.value) {
    position.value.x =
      control.value.getBoundingClientRect().left - bounds.value.getBoundingClientRect().left
    snapAnimation.cancel()
    snapAnimation = undefined
  }
  drag = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    originX: position.value.x,
    originY: position.value.y,
    moved: false
  }
  toggle.value?.setPointerCapture(event.pointerId)
}
const moveDrag = (event: PointerEvent) => {
  if (!drag || event.pointerId !== drag.id) return
  const dx = event.clientX - drag.x
  const dy = event.clientY - drag.y
  if (!drag.moved && Math.hypot(dx, dy) < 6) return
  drag.moved = true
  suppressClick = true
  const max = limits()
  position.value = { x: clamp(drag.originX + dx, max.x), y: clamp(drag.originY + dy, max.y) }
}
const endDrag = (event: PointerEvent) => {
  if (!drag || event.pointerId !== drag.id) return
  const moved = drag.moved
  releaseDrag()
  const from = position.value.x
  const maxX = limits().x
  if (moved) side.value = from > maxX / 2 ? 'right' : 'left'
  position.value.x = side.value === 'right' ? maxX : 0
  // 轻点或取消指针也恢复被中断的吸边，只有实际拖动才重新选择左右边缘。
  if (from !== position.value.x && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    snapAnimation = control.value?.animate(
      [{ transform: `translateX(${from - position.value.x}px)` }, { transform: 'translateX(0)' }],
      { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    )
  scheduleIdle()
}
const toggleMenu = (event: MouseEvent) => {
  if (suppressClick && event.detail !== 0) {
    suppressClick = false
    return
  }
  // 菜单必须从已贴边的位置展开，避免吸边中的视觉位移将它带出屏幕。
  if (!expanded.value) fitToViewport()
  expanded.value = !expanded.value
}
const activate = (action: 'exit' | 'collapse') => {
  expanded.value = false
  if (action === 'exit') emit('exit')
  else emit('collapse')
}
watch(expanded, scheduleIdle)
watch(
  () => props.disabled,
  disabled => {
    if (disabled) expanded.value = false
  }
)
watch(
  () => props.active,
  active => {
    expanded.value = false
    releaseDrag()
    snapAnimation?.cancel()
    wake()
    if (active) {
      fitToViewport()
    }
  },
  { flush: 'post' }
)
onMounted(() => {
  observer = new ResizeObserver(fitToViewport)
  if (bounds.value) observer.observe(bounds.value)
  fitToViewport()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  releaseDrag()
  snapAnimation?.cancel()
  wake()
})
</script>
