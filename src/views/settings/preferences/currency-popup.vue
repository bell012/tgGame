<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition :name="props.desktop ? 'popup-scale' : 'up-down'">
      <div
        v-show="visible"
        :class="
          props.desktop
            ? 'fixed inset-0 z-[999] pointer-events-none'
            : 'fixed bottom-0 left-0 z-[999] w-full'
        "
      >
        <div
          :style="props.desktop ? desktopPanelStyle : undefined"
          :class="
            props.desktop
              ? 'desktop-currency-panel pointer-events-auto overflow-hidden rounded-xl bg-bg-1 px-4 pb-4 pt-3'
              : 'currency-drawer flex flex-col overflow-hidden rounded-t-xl bg-bg-1 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2.5'
          "
        >
          <div v-if="!props.desktop" class="flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">Currency</div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-3 w-3 text-text-1" />
            </button>
          </div>

          <div :class="[props.desktop ? 'min-h-0 flex-1' : 'mt-5 min-h-0 flex-1']">
            <CurrencySelectorList
              :visible="props.visible"
              :options="listOptions"
              :selected-value="props.selectedCurrency"
              mode="balance"
              section-label="Cash"
              :list-class="
                props.desktop
                  ? 'max-h-[420px] overflow-y-auto overscroll-contain pr-0.5'
                  : 'min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 h-[100%]'
              "
              item-class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
              selected-item-class="bg-opacity-10"
              @select="handleSelect"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import CurrencySelectorList from '@/components/common/currency-selector/index.vue'
import CloseIcon from '@/static/svg/close.svg?component'

type PopupAnchorRect = {
  top: number
  left: number
  width: number
  height: number
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    selectedCurrency: string
    options: Array<{
      code: string
      icon: string
      balanceText: string
    }>
    desktop?: boolean
    desktopAnchor?: PopupAnchorRect | null
  }>(),
  {
    desktop: false,
    desktopAnchor: null
  }
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: string]
}>()

const listOptions = computed(() => {
  return props.options.map(item => ({
    value: item.code,
    label: item.code,
    icon: item.icon,
    trailingText: item.balanceText
  }))
})

const close = () => emit('update:visible', false)

const handleSelect = (value: string) => {
  emit('select', value)
  close()
}

const viewportTick = ref(0)
const refreshDesktopPosition = () => {
  viewportTick.value += 1
}

watch(
  () => props.visible,
  visible => {
    if (!props.desktop || !visible) {
      window.removeEventListener('resize', refreshDesktopPosition)
      return
    }

    window.addEventListener('resize', refreshDesktopPosition)
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshDesktopPosition)
})

const desktopPanelStyle = computed(() => {
  if (!props.desktop || typeof window === 'undefined') {
    return {}
  }

  // 触发 resize 时重新计算
  void viewportTick.value

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const sideGap = 16
  const panelWidth = Math.min(Math.max(viewportWidth - sideGap * 2, 300), 560)

  const anchor = props.desktopAnchor
  let left = anchor ? anchor.left + anchor.width - panelWidth : (viewportWidth - panelWidth) / 2
  left = Math.min(Math.max(left, sideGap), Math.max(viewportWidth - panelWidth - sideGap, sideGap))

  let top = anchor ? anchor.top + anchor.height + 8 : 120
  top = Math.min(Math.max(top, sideGap), Math.max(viewportHeight - 320, sideGap))

  return {
    width: `${panelWidth}px`,
    left: `${left}px`,
    top: `${top}px`,
    maxHeight: `calc(100vh - ${top + sideGap}px)`
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;

.currency-drawer {
  height: 55vh !important;
  max-height: 55vh !important;
}

.desktop-currency-panel {
  position: fixed;
  max-height: min(76vh, 620px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.4);
}

.popup-scale-enter-active,
.popup-scale-leave-active {
  transition: opacity 0.2s ease;
}

.popup-scale-enter-from,
.popup-scale-leave-to {
  opacity: 0;
}

.popup-scale-enter-active .desktop-currency-panel,
.popup-scale-leave-active .desktop-currency-panel {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}

.popup-scale-enter-from .desktop-currency-panel,
.popup-scale-leave-to .desktop-currency-panel {
  transform: translateY(10px) scale(0.96);
  opacity: 0;
}
</style>
