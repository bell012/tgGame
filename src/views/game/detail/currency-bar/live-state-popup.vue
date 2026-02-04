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
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Live Stats</div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <div
            class="bg-[var(--color-background-level-3)] rounded-[10px] py-[12px] px-[8px] mb-[12px]"
          >
            <div class="flex justify-between border-b border-[var(--color-opacity-30)] pb-[12px]">
              <div>Bet</div>
              <RefreshIcon class="size-[20px]" />
            </div>
            <div
              class="flex bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
            >
              <div class="flex-1 border-r border-[var(--color-opacity-30)]">
                <div class="text-[14px] text-[var(--color-text-level-2)]">Profit</div>
                <div class="flex items-center gap-[8px]">
                  <section class="relative w-[20px] h-[20px] overflow-hidden">
                    <img
                      class="w-[20px] min-w-[20px] absolute"
                      alt="countries"
                      src="@/static/img/explore/countries.png"
                      :style="`top: -20px`"
                    />
                  </section>
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">₱0.00</div>
                </div>

                <div class="text-[14px] text-[var(--color-text-level-2)] mt-[20px]">Wagered</div>
                <div class="flex items-center gap-[8px]">
                  <section class="relative w-[20px] h-[20px] overflow-hidden">
                    <img
                      class="w-[20px] min-w-[20px] absolute"
                      alt="countries"
                      src="@/static/img/explore/countries.png"
                      :style="`top: -20px`"
                    />
                  </section>
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">₱0.00</div>
                </div>
              </div>
              <div class="flex-1 pl-[12px]">
                <div class="text-[14px] text-[var(--color-text-level-2)]">WIN</div>
                <div class="flex items-center gap-[8px]">
                  <div class="text-[15px]">0</div>
                </div>
                <div class="text-[14px] text-[var(--color-text-level-2)] mt-[20px]">LOSE</div>
                <div class="flex items-center gap-[8px]">
                  <div class="text-[15px]">0</div>
                </div>
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
import RefreshIcon from '@/static/svg/game/detail/refresh.svg?component'

defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

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
