<template>
  <div>
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-if="!desktop"
        v-show="visible"
        class="tp-mask fixed inset-0 z-[9999] bg-mask-60-1"
        @click.self="close"
      />
    </transition>
    <!-- 面板 -->
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div
          class="tp-panel"
          :class="desktop ? 'tp-panel--desktop' : 'rounded-t-xl bg-bg-1 px-3.5 pt-2.5'"
        >
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
              class="tp-item flex cursor-pointer items-center justify-between rounded-lg"
              :class="[
                desktop ? 'h-[44px] px-3' : 'mb-[20px] h-[42px] px-2.5',
                isSelected(item)
                  ? desktop
                    ? 'tp-item--selected-desktop'
                    : 'bg-[var(--color-opacity-10)]'
                  : ''
              ]"
              @click="confirm(item)"
            >
              <div :class="desktop ? itemTextClass(item) : 'font-[700] text-text-1'">
                {{ item.name }}
              </div>
              <component
                v-if="desktop"
                :is="isSelected(item) ? RadioCheckedIcon : RadioUncheckedIcon"
                :class="[
                  'tp-radio-icon h-4 w-4 shrink-0',
                  isSelected(item) ? 'tp-radio-icon--checked' : 'tp-radio-icon--unchecked'
                ]"
              />
              <span
                v-else
                class="tp-checkbox box-border inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border"
                :class="isSelected(item) ? 'tp-checkbox--checked' : 'tp-checkbox--unchecked'"
              >
                <span
                  v-if="isSelected(item)"
                  class="tp-checkbox-mark text-[12px] font-bold leading-none"
                >
                  ✓
                </span>
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
import RadioCheckedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

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
const isLightTheme = computed(() => themeStore.theme === 'light')

const close = () => emit('update:visible', false)

const isSelected = (item: OptionItem) => item.id === props.selectedId

const itemTextClass = (item: OptionItem) => {
  if (isLightTheme.value) {
    return 'text-[13px] font-normal leading-none text-text-1'
  }

  return isSelected(item)
    ? 'text-[13px] font-bold leading-none text-text-1'
    : 'text-[13px] font-normal leading-none text-text-1'
}

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

.tp-panel--desktop {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-opacity-6);
  background: var(--color-background-level-5);
}

.tp-item--selected-desktop {
  background-color: var(--color-background-level-3);
}

:global(:root.light) .tp-item--selected-desktop {
  background-color: var(--color-theme-level-3);
}

.tp-radio-icon--unchecked :deep(circle),
.tp-radio-icon--unchecked :deep(rect) {
  stroke: var(--color-opacity-6);
  fill: none;
}

.tp-radio-icon--checked :deep(rect) {
  stroke: var(--color-theme-level-1);
  fill: none;
}

.tp-checkbox--unchecked {
  border-color: var(--color-icon-level-3);
  background: transparent;
}

.tp-checkbox--checked {
  border-color: var(--color-theme-level-1);
  background-color: var(--color-theme-level-1);
}

.tp-checkbox-mark {
  color: #ffffff;
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
