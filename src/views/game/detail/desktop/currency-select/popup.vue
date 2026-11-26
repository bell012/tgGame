<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed inset-0 bg-[var(--color-mask-60)]"
        :class="floating ? 'z-[10002]' : 'z-[9999]'"
        @click.self="close"
      />
    </transition>
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div
        v-show="visible"
        class="left-0 bottom-0 w-full"
        :class="[
          floating ? 'z-[10002]' : 'z-[9999]',
          desktop
            ? 'relative tp-desktop-wrap motion-reduce:!transition-none motion-reduce:!transform-none'
            : 'fixed'
        ]"
      >
        <div
          ref="panelRef"
          class="tp-panel rounded-t-xl"
          :class="
            desktop
              ? [
                  'tp-panel-desktop tg-glass-tokens relative',
                  floating ? '!rounded-[15px] p-3' : 'p-2'
                ]
              : 'bg-bg-2 pt-2.5 px-3.5 pb-[env(safe-area-inset-bottom)]'
          "
        >
          <LiquidGlass v-if="desktop" />
          <div
            v-if="floating"
            class="relative z-[1] mb-3 text-[13px] leading-5 font-extrabold text-text-1"
          >
            {{ t('gameDetail.selectCurrencyTitle') }}
          </div>
          <div class="tp-header flex items-center justify-between mb-[20px]" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-text-1">
              {{ t('customSelect.placeholder') }}
            </div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </div>
          </div>
          <CurrencySelectorList
            :disabled="disabled"
            :change-currency="changeCurrency"
            :class="desktop ? 'relative z-[1]' : ''"
            :visible="props.visible"
            :options="listOptions"
            :selected-value="selectedId"
            mode="balance"
            :list-class="desktopListClass"
            :item-class="
              'tp-item mb-2.5 flex w-full items-center justify-between rounded-lg text-left cursor-pointer ' +
              (floating ? 'h-10 px-3' : 'h-[42px] px-2.5') +
              (desktop ? ' last:mb-0 hover:bg-opacity-6' : '')
            "
            :selected-item-class="
              desktop
                ? 'bg-opacity-10 tp-item-selected'
                : 'bg-[var(--color-opacity-10)] tp-item-selected'
            "
            label-class="text-[14px] text-text-1 font-[700]"
            trailing-class="text-xs font-[700] text-text-1"
            @select="confirmByValue"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CurrencySelectorList from '@/components/common/currency-selector/index.vue'
import LiquidGlass from '@/components/common/LiquidGlass.vue'
import CloseIcon from '@/static/svg/close.svg?component'

type OptionItem = { value: string; label: string; icon: string }
type BalanceOptionItem = { code: string; icon: string; balanceText: string }

const props = defineProps<{
  visible: boolean
  desktop?: boolean
  floating?: boolean
  disabled?: boolean
  changeCurrency?: (value: string) => Promise<boolean>
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()
const { t } = useI18n()
const panelRef = ref<HTMLElement | null>(null)

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

const desktopListClass = computed(() => {
  if (props.floating) {
    return 'tp-desktop-list max-h-[min(236px,max(0px,calc(var(--floating-popup-space,294px)-58px)))] overflow-y-auto'
  }
  if (props.desktop) {
    return 'tp-desktop-list max-h-[236px] overflow-y-auto'
  }
  return 'max-h-[368px] overflow-y-auto'
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

const handleDocumentPointerDown = (event: MouseEvent) => {
  if (!props.desktop || !props.visible) {
    return
  }

  const target = event.target as Node | null
  if (!target) {
    return
  }

  if (panelRef.value?.contains(target)) {
    return
  }

  close()
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentPointerDown, true)
})
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;
/* 面板 */
.tp-panel {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid transparent;
}

.tp-desktop-wrap {
  top: 0;
  bottom: auto;
}

.tp-panel-desktop {
  border-radius: 12px;
  box-shadow: var(--glass-shadow);
}

.tp-desktop-list::-webkit-scrollbar {
  width: 6px;
}

.tp-desktop-list::-webkit-scrollbar-thumb {
  background: var(--color-opacity-20);
  border-radius: 999px;
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
