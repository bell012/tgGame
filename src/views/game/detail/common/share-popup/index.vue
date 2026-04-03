<template>
  <div>
    <transition name="popup-fade">
      <div v-show="props.visible" class="fixed inset-0 z-[9999] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition :name="props.desktop ? 'desktop-up-down' : 'up-down'">
      <div
        v-show="props.visible"
        :class="
          props.desktop
            ? 'z-[10000] w-full pointer-events-none relative'
            : 'fixed inset-x-0 bottom-0 z-[10000] w-full pointer-events-none'
        "
      >
        <div
          :class="
            props.desktop
              ? 'tp-panel pointer-events-auto w-full max-w-[520px] rounded-[12px] bg-[var(--color-background-level-2)]'
              : 'tp-panel pointer-events-auto w-full max-w-none rounded-t-[12px] rounded-b-0 bg-[var(--color-background-level-2)]'
          "
          @click.stop
        >
          <div class="tp-header h-[64px] px-5 flex items-center justify-between">
            <div class="w-7 h-7" />
            <div class="text-[16px]/[24px] text-[var(--color-text-level-1)] font-bold">
              Share This Game
            </div>
            <button
              type="button"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
              @click="close"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </button>
          </div>
          <div class="px-4 pb-4">
            <div class="tp-content rounded-[10px] px-4 py-[18px]">
              <div class="text-[14px]/[20px] text-[var(--color-text-level-1)]">
                Invite friends using the options below
              </div>
              <div class="grid grid-cols-5 gap-x-5 mt-3.5">
                <div
                  v-for="item in shareList"
                  :key="item.label"
                  class="flex flex-col items-center min-w-0"
                >
                  <component :is="item.icon" class="size-[54px]" />
                  <div class="text-[11px]/[14px] mt-2 text-[var(--color-text-level-1)] text-center">
                    {{ item.label }}
                  </div>
                </div>
              </div>
              <div class="text-[14px]/[20px] mt-4 text-[var(--color-text-level-1)] font-medium">
                Share via web link
              </div>
              <div
                class="mt-2.5 h-[56px] rounded-[10px] border border-[var(--color-opacity-20)] bg-[var(--color-background-level-4)] px-3 flex items-center justify-between gap-3"
              >
                <div class="text-[11px]/[14px] text-[var(--color-text-level-2)] truncate">
                  {{ shareUrl }}
                </div>
                <button
                  type="button"
                  class="h-[40px] min-w-[86px] rounded-[10px] bg-[var(--color-opacity-10)] text-[14px]/[20px] text-[var(--color-primary)] font-bold"
                  @click="handleCopy"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import tiktokIcon from '@/static/svg/game/detail/share/d.svg?component'
import facebookIcon from '@/static/svg/game/detail/share/f.svg?component'
import linkIcon from '@/static/svg/game/detail/share/l.svg?component'
import telegramIcon from '@/static/svg/game/detail/share/t.svg?component'
import whatsappIcon from '@/static/svg/game/detail/share/w.svg?component'
import { shallowRef } from 'vue'

const props = defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

const shareList = shallowRef([
  {
    icon: linkIcon,
    label: 'Mais'
  },
  {
    icon: facebookIcon,
    label: 'Facebook'
  },
  {
    icon: whatsappIcon,
    label: 'Whatsapp'
  },
  {
    icon: telegramIcon,
    label: 'Telegram'
  },
  {
    icon: tiktokIcon,
    label: 'Tiktok'
  }
])

const shareUrl =
  typeof window !== 'undefined' ? window.location.href : 'https://translate.google.com'

const close = () => {
  emit('update:visible', false)
}

const handleCopy = async () => {
  if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
    return
  }
  try {
    await navigator.clipboard.writeText(shareUrl)
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.tp-panel {
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
}

.tp-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.tp-content {
  background: rgba(255, 255, 255, 0.06);
}

@include popup-transition;

.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}

.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
