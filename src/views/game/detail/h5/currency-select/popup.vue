<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-mask-60-1"
        @click.self="close"
      />
    </transition>
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel rounded-t-xl bg-bg-1 px-3 pb-2.5 pt-2.5">
          <div class="tp-header flex items-center justify-between mb-5" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-text-1">Select Currency</div>
            <button
              @click="close"
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
            >
              <CloseIcon class="h-3 w-3 text-text-1" />
            </button>
          </div>
          <CurrencySelectorList
            :visible="props.visible"
            :options="listOptions"
            :selected-value="selectedId"
            mode="balance"
            section-label="Cash"
            list-class="max-h-[55vh] overflow-y-auto overscroll-contain pr-0.5"
            item-class="tp-item mb-2.5 flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left"
            selected-item-class="bg-opacity-10 tp-item-selected"
            label-class="text-sm font-[700] text-text-1"
            trailing-class="text-xs font-[700] text-text-1"
            @select="confirmByValue"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue'
import CurrencySelectorList from '@/components/common/currency-selector/index.vue'
import CloseIcon from '@/static/svg/close.svg?component'

type OptionItem = { value: string; label: string; icon: string }
type BalanceOptionItem = { code: string; icon: string; balanceText: string }

const props = defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

// options数据
const selectOptions = inject('currency-select-options') as Ref<OptionItem[]>
const balanceOptions = inject<Ref<BalanceOptionItem[]>>('currency-select-balance-options')
// 选中那一条数据
const selectedId = inject('currency-select-selected-id') as Ref<string>
const onSelect = inject<(item: OptionItem) => void>('currency-select-on-select')

const listOptions = computed(() => {
  const balanceMap = new Map(
    (balanceOptions?.value ?? []).map(item => [item.code, item.balanceText] as const)
  )

  return selectOptions.value.map(item => ({
    value: item.value,
    label: item.label,
    icon: item.icon,
    trailingText: balanceMap.get(item.value) ?? `${item.value} 0.00`
  }))
})

// 关闭popup
const close = () => {
  emit('update:visible', false)
}

const confirmByValue = (value: string) => {
  const item = selectOptions.value.find(option => option.value === value)
  if (!item) {
    return
  }

  if (onSelect) {
    onSelect(item)
  } else {
    selectedId.value = value
  }
  close()
}
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;
/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px 10px 0 0;
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
.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
}
</style>
