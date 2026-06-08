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
          :class="
            desktop
              ? 'tp-panel--desktop explore-select-panel--desktop'
              : 'rounded-t-xl bg-bg-1 px-3.5 pt-2.5'
          "
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
              class="tp-item explore-select-item flex items-center justify-between"
              :class="[
                desktop ? '' : 'mb-[20px] h-[42px] px-2.5',
                isSelected(item) ? 'explore-select-item--selected' : ''
              ]"
              @click="confirm(item)"
            >
              <div
                :class="[
                  desktop ? 'explore-select-item-label' : 'font-[700] text-text-1',
                  desktop && isSelected(item) ? 'explore-select-item-label--selected' : ''
                ]"
              >
                {{ item.name }}
              </div>
              <component
                :is="isSelected(item) ? RadioCheckedIcon : RadioUncheckedIcon"
                :class="[
                  'explore-select-radio',
                  isSelected(item)
                    ? 'explore-select-radio--checked'
                    : 'explore-select-radio--unchecked'
                ]"
              />
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

const close = () => emit('update:visible', false)

const isSelected = (item: OptionItem) => item.id === props.selectedId

const confirm = (item: OptionItem) => {
  emit('confirm', item)
  close()
}
</script>

<style scoped lang="scss">
@use '../../../styles/mixins' as *;
@use '../explore-select-icons.scss';
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
