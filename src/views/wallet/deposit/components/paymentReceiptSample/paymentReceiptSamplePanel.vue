<template>
  <div
    class="w-full max-w-[480px] max-h-[66%] sm:max-h-[612px] overflow-hidden rounded-t-xl sm:rounded-lg modal-container bg-bg-1 sm:h-[612px] font-['Inter'] flex flex-col"
  >
    <div
      class="relative shrink-0 flex items-center justify-between h-12 sm:h-14 bg-bg-2 rounded-t-xl sm:rounded-t-lg"
    >
      <h2
        class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-bold text-text-1 whitespace-nowrap"
      >
        {{ t('deposit.payment_receipt_sample_title') }}
      </h2>

      <button
        class="absolute top-[10px] right-[14px] sm:top-4 sm:right-4 w-7 h-7 sm:w-6 sm:h-6 bg-opacity-10 rounded-md sm:rounded flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="h-2.5 w-2.5 text-text-1" />
      </button>
    </div>

    <div
      class="flex-1 min-h-0 overflow-y-auto px-[14px] pt-[10px] pb-[14px] sm:px-12 sm:pt-6 sm:pb-6"
    >
      <div class="flex items-start justify-center">
        <img
          class="w-full sm:w-[384px] rounded-[20px] sm:rounded-[26px] overflow-hidden"
          :src="paymentReceiptSampleImage"
          :alt="t('deposit.payment_receipt_sample_alt')"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import paymentReceiptSampleImage from '@/static/img/payment/payment_receipt_sample.png'
import CloseIcon from '@/static/svg/close.svg?component'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['close'])

// 处理关闭事件
const handleClose = () => {
  emit('close')
}
</script>
<style scoped lang="scss"></style>
