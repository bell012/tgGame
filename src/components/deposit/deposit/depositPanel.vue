<template>
  <div
    class="relative w-full max-w-[480px] h-full flex flex-col overflow-hidden sm:rounded-xl modal-container bg-bg-1 font-['Inter']"
    :class="{
      'sm:max-h-[684px]': modelValue === 'Crypto',
      'sm:max-h-[595px]': modelValue === 'Fiat'
    }"
  >
    <div
      class="relative flex items-center justify-between h-12 sm:h-14 rounded-tl-xl rounded-tr-xl bg-bg-2"
    >
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.title') }}
      </h2>

      <template v-if="isMobile">
        <!-- 关闭按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
      <template v-else>
        <!-- 关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
          @click="handleClose"
        >
          <CloseIcon class="w-4 h-4 fill-none" />
        </button>
      </template>
    </div>

    <depositContentPanel
      :model-value="modelValue"
      @update:model-value="setActiveTab"
      @hidden="handleHidden"
    />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import DetailsIcon from '@/static/svg/deposit/order-details.svg?component'
import depositContentPanel, { type DepositTabType } from './depositContentPanel.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const { t } = useI18n()
const isMobile = useIsMobile()
interface Props {
  modelValue: DepositTabType
}
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: DepositTabType]
  close: []
  hidden: [val: boolean]
}>()

const setActiveTab = (tab: DepositTabType) => {
  emit('update:modelValue', tab)
}

const handleClose = () => {
  emit('close')
}

const handleHidden = (val: boolean) => {
  emit('hidden', val)
}
</script>
