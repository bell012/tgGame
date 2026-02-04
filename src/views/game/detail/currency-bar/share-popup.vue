<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-[var(--color-mask-60)]"
        @click.self="close"
      />
    </transition>
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-2.5" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Share This Game</div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="text-[14px] text-[var(--color-text-level-2)]">Share via social media</div>
            <div class="flex justify-center items-center flex-wrap gap-[28px] mt-[14px]">
              <div v-for="item in shareList" :key="item.label">
                <component :is="item.icon" class="size-[44px]" />
                <div class="text-[12px] text-center mt-[4px]">{{ item.label }}</div>
              </div>
            </div>
          </div>
          <div class="text-[14px] text-[var(--color-text-level-2)] my-[10px]">
            Share via social media
          </div>
          <div
            class="flex justify-between items-center border border-[var(--color-opacity-30)] py-[8px] px-[12px] rounded-[10px] mb-[20px]"
          >
            <div class="text-[var(--color-theme-level-1)] text-[12px]">
              https://translate.google.com
            </div>
            <div class="bg-[var(--color-opacity-10)] text-[12px] rounded-[10px] py-[8px] px-[12px]">
              Copy
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import emailIcon from '@/static/svg/game/detail/share/email.svg?component'
import facebookIcon from '@/static/svg/game/detail/share/facebook.svg?component'
import inIcon from '@/static/svg/game/detail/share/in.svg?component'
import lineIcon from '@/static/svg/game/detail/share/line.svg?component'
import linkIcon from '@/static/svg/game/detail/share/link.svg?component'
import sIcon from '@/static/svg/game/detail/share/s.svg?component'
import telegramIcon from '@/static/svg/game/detail/share/telegram.svg?component'
import whatsappIcon from '@/static/svg/game/detail/share/whatsapp.svg?component'
import xIcon from '@/static/svg/game/detail/share/x.svg?component'
import { ref } from 'vue'

defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

const shareList = ref([
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
    icon: emailIcon,
    label: 'Email'
  },
  {
    icon: lineIcon,
    label: 'Line'
  },
  {
    icon: xIcon,
    label: 'X'
  },
  {
    icon: sIcon,
    label: 'Skype'
  },
  {
    icon: inIcon,
    label: 'Linkedin'
  }
])

// 关闭popup
const close = () => {
  emit('update:visible', false)
}
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;
/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px;
}
@include popup-transition;
// 设置的弹窗打开关闭的过渡动画
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
