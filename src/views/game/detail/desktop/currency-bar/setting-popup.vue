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
        <div
          class="bg-[var(--color-background-level-2)] rounded-t-xl p-[16px] rounded-lg text-[14px]"
        >
          <div class="flex flex-col gap-[16px]">
            <div class="flex items-center gap-[8px] cursor-pointer" @click="toggleLove">
              <img alt="" class="size-[16px]" :src="loveActived ? LoveActiveIcon : LoveIcon" />
              <div>Like</div>
            </div>
            <div class="flex items-center gap-[8px] cursor-pointer" @click="shareClick">
              <img alt="" class="size-[16px]" :src="TgIcon" />
              <div>Share</div>
            </div>
            <div class="flex items-center gap-[8px] cursor-pointer">
              <img alt="" class="size-[16px]" :src="TgIcon" />
              <div>Movie Mode</div>
            </div>
            <div class="flex items-center gap-[8px] cursor-pointer">
              <img alt="" class="size-[16px]" :src="TgIcon" />
              <div>Full Screen</div>
            </div>
            <div class="flex items-center gap-[8px] cursor-pointer">
              <img alt="" class="size-[16px]" :src="TgIcon" />
              <div>Float Mode</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import TgIcon from '@/static/svg/game/detail/tg.svg?url'
import LoveIcon from '@/static/svg/game/detail/love.svg?url'
import LoveActiveIcon from '@/static/svg/game/detail/love_active.svg?url'
import { ref } from 'vue'

defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const loveActived = ref(false)

const emit = defineEmits<{
  'update:visible': [val: boolean]
  share: []
}>()

const toggleLove = () => {
  loveActived.value = !loveActived.value
}

// 关闭popup
const close = () => {
  emit('update:visible', false)
}

const shareClick = () => {
  close()
  emit('share')
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
