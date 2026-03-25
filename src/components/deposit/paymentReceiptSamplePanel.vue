<template>
  <div
    class="w-full max-w-[480px] h-2/3 sm:h-full sm:max-h-[712px] rounded-xl modal-container bg-bg-1"
  >
    <div
      class="relative flex items-center justify-between h-14 bg-bg-2 rounded-tl-xl rounded-tr-xl"
    >
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.upload_proof_title') }}
      </h2>
      <button
        class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>

    <div class="flex items-center justify-center">
      <img
        class="w-full sm:w-[386px]"
        :src="paymentReceiptSampleImage"
        alt="Payment Receipt Sample"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import paymentReceiptSampleImage from '@/static/img/payment/payment_receipt_sample.png'

const { t } = useI18n()
const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>
<style scoped lang="scss"></style>
