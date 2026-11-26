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
        </button>
      </div>
    </div>

    <div
      class="w-full flex-1 min-h-0 relative overflow-y-auto overscroll-contain"
      :class="contentClass"
    >
      <template v-if="props.mode === 'pc'">
        <DepositPcCryptoPanel
          v-if="props.modelValue === 'Crypto'"
          ref="activePanel"
          :embedded="embedded"
          :teleport-target="teleportTarget"
          :initial-method-code="props.initialMethodCode"
          @hidden="handleHidden"
        />
        <DepositPcFiatPanel
          v-else-if="props.modelValue === 'Fiat'"
          ref="activePanel"
          :embedded="embedded"
          :teleport-target="teleportTarget"
          :initial-method-code="props.initialMethodCode"
          @hidden="handleHidden"
        />
      </template>

      <template v-else>
        <DepositMobileCryptoPanel
          v-if="props.modelValue === 'Crypto'"
          ref="activePanel"
          :embedded="embedded"
          :teleport-target="teleportTarget"
          :initial-method-code="props.initialMethodCode"
          @hidden="handleHidden"
        />
        <DepositMobileFiatPanel
          v-else-if="props.modelValue === 'Fiat'"
          ref="activePanel"
          :embedded="embedded"
          :teleport-target="teleportTarget"
          :initial-method-code="props.initialMethodCode"
          @hidden="handleHidden"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PC_SEGMENTED_TABS_CLASS,
  PC_SEGMENTED_TAB_CLASS,
  getPcSegmentedTabStateClass
} from '@/components/common/pcSegmentedTabs'

import { computed, ref } from 'vue'
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
  initialMethodCode?: string
  embedded?: boolean
  teleportTarget?: HTMLElement | null
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
    ? ['w-full shrink-0 flex', PC_SEGMENTED_TABS_CLASS]
    : 'w-full shrink-0 flex flex-col bg-bg-1 px-4 pt-4'
)

const tabHeaderClass = computed(() =>
  props.mode === 'pc'
    ? ['flex w-full', PC_SEGMENTED_TABS_CLASS]
    : 'flex h-[39px] rounded-[8px] bg-bg-2'
)

const contentClass = computed(() =>
  props.mode === 'pc'
    ? 'mt-4 bg-bg-1 rounded-lg'
    : [panelMaxHeightClass.value, 'p-4 bg-bg-1 rounded-bl-lg rounded-br-lg']
)

const getTabClass = (tab: DepositTabType) => {
  const isActive = props.modelValue === tab

  if (props.mode === 'pc') {
    return ['text-sm py-3 font-bold', PC_SEGMENTED_TAB_CLASS, getPcSegmentedTabStateClass(isActive)]
  }

  return [
    'flex items-center justify-center rounded-[8px] font-bold',
    isActive ? 'bg-bg-3 text-sm text-text-1' : 'text-xs text-text-2'
  ]
}

const getTabLabel = (tab: DepositTabType) => t(getDepositTabI18nKey(tab))

const setActiveTab = (tab: DepositTabType) => {
  emit('update:modelValue', tab)
}

const handleHidden = (val: boolean) => {
  emit('hidden', val)
}

const activePanel = ref<
  | InstanceType<typeof DepositPcFiatPanel>
  | InstanceType<typeof DepositPcCryptoPanel>
  | InstanceType<typeof DepositMobileFiatPanel>
  | InstanceType<typeof DepositMobileCryptoPanel>
>()
defineExpose({ back: () => activePanel.value?.back() ?? false })
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}
</style>
