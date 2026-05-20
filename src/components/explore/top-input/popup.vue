<template>
  <div>
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed inset-0 z-[9999] bg-mask-60-1"
        @click.self="close"
      />
    </transition>
    <!-- 面板 -->
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel bg-bg-1 rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-[20px]" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <div
              @click="close"
              class="w-7 h-7 rounded-[8px] bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </div>
          </div>
          <!-- 选择的内容 -->
          <div class="flex flex-col">
            <div
              v-for="(item, inx) in typeList"
              :key="inx"
              class="tp-item mb-[20px] px-2.5 flex items-center justify-between h-[42px] rounded-[8px] cursor-pointer"
              :class="isSelected(item) ? 'bg-[var(--color-opacity-10)]' : ''"
              @click="confirm(item)"
            >
              <div class="font-[700]">{{ item.name }}</div>
              <span
                class="relative box-border inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border"
                :class="
                  isSelected(item)
                    ? 'border-theme-primary bg-theme-primary'
                    : 'border-[var(--color-opacity-10)] bg-transparent'
                "
              >
                <span
                  v-if="isSelected(item)"
                  class="h-[10px] w-[10px] rounded-full"
                  :class="isDarkTheme ? 'bg-black' : 'bg-white'"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'

type OptionItem = { id: string; name: string }

const props = defineProps<{
  visible: boolean
  typeList: OptionItem[]
  selectedId?: string
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: [val: OptionItem]
}>()

const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.theme === 'dark')

const close = () => emit('update:visible', false)

const isSelected = (item: OptionItem) => item.id === props.selectedId

const confirm = (item: OptionItem) => {
  emit('confirm', item)
  close()
}
</script>

<style scoped lang="scss">
@use '../../../styles/mixins' as *;
/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px;
}

@media (max-width: 767px) {
  .tp-panel {
    border-radius: 10px 10px 0 0;
  }
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
