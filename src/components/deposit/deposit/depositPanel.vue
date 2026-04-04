<template>
  <div
    class="relative w-full max-w-[480px] h-full flex flex-col overflow-hidden sm:rounded-xl modal-container bg-bg-1 font-['Inter']"
    :class="{
      'sm:max-h-[684px]': modelValue === 'Crypto',
      'sm:max-h-[595px]': modelValue === 'Fiat'
    }"
  >
    <div
      class="relative flex items-center justify-between h-12 sm:h-14 sm:rounded-tl-xl sm:rounded-tr-xl bg-bg-2"
    >
      <h2 class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-semibold text-text-1">
        {{ t('deposit.title') }}
      </h2>

      <!-- 区块：template -->
      <template v-if="isMobile">
        <!-- 关闭按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4 text-icon-1" />
        </button>

        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <DetailsIcon class="w-4 h-4 text-icon-1" />
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
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import { useI18n } from 'vue-i18n'
import depositContentPanel, { type DepositTabType } from './depositContentPanel.vue'

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

// 设置激活状态标签页
const setActiveTab = (tab: DepositTabType) => {
  emit('update:modelValue', tab)
}

// 处理关闭事件
const handleClose = () => {
  emit('close')
}

// 处理隐藏状态事件
const handleHidden = (val: boolean) => {
  emit('hidden', val)
}
</script>
