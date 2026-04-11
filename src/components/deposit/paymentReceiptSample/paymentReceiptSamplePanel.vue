<template>
  <div
    class="w-full max-w-[480px] max-h-[66%] sm:max-h-[612px] overflow-hidden rounded-xl modal-container bg-bg-1 sm:h-[612px] font-['Inter'] flex flex-col"
  >
    <div
      class="relative shrink-0 flex items-center justify-between h-14 bg-bg-2 rounded-tl-xl rounded-tr-xl"
    >
      <h2
        class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg sm:font-semibold text-text-1 whitespace-nowrap"
      >
        {{ t('deposit.payment_receipt_sample_title') }}
      </h2>

      <button
        class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto p-4">
      <div class="flex items-start justify-center">
        <img
          class="w-full sm:w-[386px]"
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
