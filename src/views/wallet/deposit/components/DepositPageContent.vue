<template>
  <div class="flex flex-1 min-h-0 flex-col">
    <div :class="tabHeaderWrapperClass">
      <div :class="tabHeaderClass">
        <button
          v-for="tab in depositTabs"
          :key="tab"
          class="relative flex-1 transition-all duration-200 tab-button-new"
          :class="getTabClass(tab)"
          @click.stop="setActiveTab(tab)"
        >
          <span>{{ getTabLabel(tab) }}</span>

          <div
            v-if="props.mode === 'mobile' && props.modelValue === tab"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-theme-primary rounded-t-full"
          ></div>
        </button>
      </div>
    </div>

    <div
      class="w-full flex-1 min-h-0 relative overflow-y-auto overscroll-contain"
      :class="contentClass"
    >
      <template v-if="props.mode === 'pc'">
        <DepositPcCryptoPanel v-if="props.modelValue === 'Crypto'" @hidden="handleHidden" />
        <DepositPcFiatPanel v-else-if="props.modelValue === 'Fiat'" @hidden="handleHidden" />
      </template>

      <template v-else>
        <DepositMobileCryptoPanel v-if="props.modelValue === 'Crypto'" @hidden="handleHidden" />
        <DepositMobileFiatPanel v-else-if="props.modelValue === 'Fiat'" @hidden="handleHidden" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DEPOSIT_TABS,
  getDepositTabI18nKey,
  type DepositPageMode,
  type DepositTabType
} from '../shared'
import DepositMobileCryptoPanel from './DepositMobileCryptoPanel.vue'
import DepositMobileFiatPanel from './DepositMobileFiatPanel.vue'
import DepositPcCryptoPanel from './DepositPcCryptoPanel.vue'
import DepositPcFiatPanel from './DepositPcFiatPanel.vue'

interface Props {
  mode: DepositPageMode
  modelValue: DepositTabType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: DepositTabType]
  hidden: [val: boolean]
}>()

const { t } = useI18n()
const depositTabs = DEPOSIT_TABS

const panelMaxHeightClass = computed(() =>
  props.modelValue === 'Crypto' ? 'sm:max-h-[598px]' : 'sm:max-h-[499px]'
)

const tabHeaderWrapperClass = computed(() =>
  props.mode === 'pc'
    ? 'w-full shrink-0 flex bg-bg-2 dark:bg-bg-8 rounded-lg'
    : 'w-full shrink-0 flex flex-col bg-bg-2'
)

const tabHeaderClass = computed(() =>
  props.mode === 'pc' ? 'flex w-full bg-bg-2 dark:bg-bg-8 rounded-lg' : 'flex bg-bg-2 dark:bg-bg-8'
)

const contentClass = computed(() =>
  props.mode === 'pc'
    ? 'mt-4 bg-bg-1 rounded-lg'
    : [panelMaxHeightClass.value, 'p-4 bg-bg-1 rounded-bl-lg rounded-br-lg']
)

const getTabClass = (tab: DepositTabType) => {
  const isActive = props.modelValue === tab

  if (props.mode === 'pc') {
    return [
      'text-sm py-3 font-bold rounded-lg',
      isActive ? 'text-text-1 bg-bg-7' : 'text-text-2 bg-bg-8'
    ]
  }

  return ['text-sm sm:text-base font-[800]', isActive ? 'text-text-1 pb-1.5' : 'text-text-2 pb-1.5']
}

const getTabLabel = (tab: DepositTabType) => t(getDepositTabI18nKey(tab))

const setActiveTab = (tab: DepositTabType) => {
  emit('update:modelValue', tab)
}

const handleHidden = (val: boolean) => {
  emit('hidden', val)
}
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
