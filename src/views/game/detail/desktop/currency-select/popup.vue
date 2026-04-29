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
      <div
        v-show="visible"
        class="fixed z-[9999] left-0 bottom-0 w-full lg:relative"
        :class="desktop ? 'tp-desktop-wrap' : ''"
      >
        <div
          class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5"
          :class="desktop ? 'tp-panel-desktop' : ''"
        >
          <div class="tp-header flex items-center justify-between mb-2.5" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">
              {{ t('customSelect.placeholder') }}
            </div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <CurrencySelectorList
            :visible="props.visible"
            :options="listOptions"
            :selected-value="selectedId"
            mode="radio"
            show-search
            :search-placeholder="t('home.search')"
            :list-class="desktopListClass"
            item-class="tp-item mb-2.5 flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left cursor-pointer"
            selected-item-class="bg-[var(--color-opacity-10)] tp-item-selected"
            label-class="text-[14px] text-[var(--color-text-level-1)]"
            @select="confirmByValue"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CurrencySelectorList from '@/components/common/currency-selector/index.vue'
import CloseIcon from '@/static/svg/close.svg?component'

type OptionItem = { value: string; label: string; icon: string }

const props = defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()
const { t } = useI18n()

// options数据
const selectOptions = inject('currency-select-options') as Ref<OptionItem[]>
// 选中那一条数据
const selectedId = inject('currency-select-selected-id') as Ref<string>
const onSelect = inject<(item: OptionItem) => void>('currency-select-on-select')

const listOptions = computed(() => {
  return selectOptions.value.map(item => ({
    value: item.value,
    label: item.label,
    icon: item.icon
  }))
})

const desktopListClass = computed(() => {
  if (props.desktop) {
    return 'tp-desktop-list max-h-[268px] overflow-y-auto pr-1 pb-2'
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
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;
/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid transparent;
}

.tp-desktop-wrap {
  top: 0;
  bottom: auto;
}

.tp-panel-desktop {
  padding: 10px;
  border-radius: 12px;
  border-color: var(--color-opacity-10);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.36);
}

.tp-desktop-list {
  scrollbar-gutter: stable;
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

:global(:root.light) .tp-panel {
  background: #f8fbff;
  border-color: rgba(95, 116, 145, 0.26);
  box-shadow:
    0 18px 44px rgba(27, 41, 66, 0.2),
    0 4px 14px rgba(27, 41, 66, 0.12);
}

:global(:root.light) .tp-panel.tp-panel-desktop {
  box-shadow:
    0 18px 44px rgba(27, 41, 66, 0.2),
    0 4px 14px rgba(27, 41, 66, 0.12);
}

:global(:root.light) .tp-panel input {
  background: #fff;
  border-color: rgba(95, 116, 145, 0.34);
}

:global(:root.light) .tp-panel input:focus {
  border-color: #23cf74;
  box-shadow: 0 0 0 3px rgba(35, 207, 116, 0.18);
}

:global(:root.light) .tp-panel .tp-item {
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

:global(:root.light) .tp-panel .tp-item:hover {
  background: rgba(88, 114, 152, 0.08);
}

:global(:root.light) .tp-panel .tp-item.tp-item-selected {
  background: rgba(35, 207, 116, 0.16);
  border-color: rgba(35, 207, 116, 0.36);
}
</style>
