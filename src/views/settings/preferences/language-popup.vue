<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        :class="props.desktop ? 'fixed inset-0 z-[999]' : 'fixed inset-0 z-[999] bg-mask-60-1'"
        @click.self="close"
      />
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
              ? 'desktop-language-panel pointer-events-auto overflow-hidden rounded-xl bg-bg-1 px-4 pb-4 pt-3'
              : 'rounded-t-xl bg-bg-1 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2.5'
          "
        >
          <div v-if="!props.desktop" class="mb-3.5 flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">
              {{ t('preferencesSettings.languagePopupTitle') }}
            </div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </div>

          <div
            :class="
              props.desktop ? 'space-y-2 max-h-[320px] overflow-y-auto pr-0.5' : 'space-y-2.5'
            "
          >
            <button
              v-for="item in options"
              :key="item.code"
              type="button"
              class="flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
              :class="item.code === selectedLanguage ? 'bg-opacity-10' : ''"
              @click="handleSelect(item.code)"
            >
              <span class="text-sm font-[700] text-text-1">{{ item.label }}</span>
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full border"
                :class="
                  item.code === selectedLanguage
                    ? 'border-theme-primary bg-theme-primary'
                    : 'border-opacity-30'
                "
              >
                <span
                  v-if="item.code === selectedLanguage"
                  class="h-2.5 w-2.5 rounded-full bg-common-100"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Locale } from '@/utils/locale'
import { useI18n } from 'vue-i18n'
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
    selectedLanguage: Locale
    options: Array<{ code: Locale; label: string }>
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
  select: [value: Locale]
}>()
const { t } = useI18n()

const close = () => emit('update:visible', false)

const handleSelect = (value: Locale) => {
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
      window.removeEventListener('scroll', refreshDesktopPosition, true)
      return
    }

    window.addEventListener('resize', refreshDesktopPosition)
    window.addEventListener('scroll', refreshDesktopPosition, true)
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshDesktopPosition)
  window.removeEventListener('scroll', refreshDesktopPosition, true)
})

const desktopPanelStyle = computed(() => {
  if (!props.desktop || typeof window === 'undefined') {
    return {}
  }

  void viewportTick.value

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const sideGap = 16
  const panelWidth = 240

  const anchor = props.desktopAnchor
  let left = anchor ? anchor.left + anchor.width - panelWidth : (viewportWidth - panelWidth) / 2
  left = Math.min(Math.max(left, sideGap), Math.max(viewportWidth - panelWidth - sideGap, sideGap))

  let top = anchor ? anchor.top + anchor.height + 8 : 120
  top = Math.min(Math.max(top, sideGap), Math.max(viewportHeight - 280, sideGap))

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

.desktop-language-panel {
  position: fixed;
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

.popup-scale-enter-active .desktop-language-panel,
.popup-scale-leave-active .desktop-language-panel {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}

.popup-scale-enter-from .desktop-language-panel,
.popup-scale-leave-to .desktop-language-panel {
  transform: translateY(10px) scale(0.96);
  opacity: 0;
}
</style>
