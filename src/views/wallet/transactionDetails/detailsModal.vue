<template>
  <!-- PC-详情弹窗 -->
  <div
    v-if="modelValue && detail"
    class="hidden sm:flex fixed inset-0 bg-mask-60-1 z-50 items-center justify-center"
    @click.self="closeModal"
  >
    <div class="bg-bg-1 rounded-lg w-[480px] overflow-hidden">
      <div class="relative h-[56px] bg-bg-2 rounded-lg-t rounded-lg-r">
        <button
          class="absolute top-4 right-4 bg-opacity-10 w-6 h-6 rounded flex items-center justify-center"
          @click="closeModal"
        >
          <Close class="w-3 h-3 text-text-1" />
        </button>

        <div class="flex items-center justify-center w-full h-full">
          <h3 class="text-text-1 text-lg font-bold">
            {{ $t('personalCenter.transactionDetails') }}
          </h3>
        </div>
      </div>

      <div class="p-4 flex flex-col items-center bg-bg-1">
        <div class="w-full h-full flex flex-col items-center bg-bg-2 rounded-lg p-4 pt-8">
          <p class="text-[24px] font-[700] text-text-1 mb-2 flex items-center">
            <span :class="['mr-[2px]', detail.direction === 'dec' ? 'relative -top-0.5' : '']">{{
              detail.direction === 'add' ? '+' : '-'
            }}</span>
            <span>{{ detail.betAmount }}</span>
          </p>

          <h2 class="text-text-1 text-base font-[400] mb-[32px]">{{ detail.gameName }}</h2>

          <div class="w-full space-y-4 text-base bg-bg-4 rounded-lg px-5 py-4">
            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betDetails.currency') }}</span>
              <span class="text-text-1">{{ detail.currency }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('transaction.amount') }}</span>
              <p class="text-text-1 inline-flex items-center">
                <span>{{ detail.betAmount }}</span>
              </p>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betDetails.orderNo') }}</span>
              <div class="flex items-center max-w-[75%]">
                <span class="text-text-1 truncate">{{ detail.orderNo }}</span>
                <button class="p-1" @click="copyOrderNo">
                  <CopyIcon class="w-6 h-6 text-text-2" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betDetails.createdAt') }}</span>
              <span class="text-text-1">{{ detail.createdAt }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('personalCenter.remarks') }}</span>
              <span class="text-text-1 text-sm text-right break-all max-w-[60%]">-</span>
              <!-- <span class="text-text-1 text-sm text-right break-all max-w-[60%]">{{
                detail.remarks
              }}</span> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalShowToast } from '@/utils/toast'
import CopyIcon from '@/static/svg/copy.svg?component'
import Close from '@/static/svg/close.svg?component'
import type { Item } from '../transaction/shared'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  data: Item | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const detail = computed(() => props.data)

const closeModal = () => {
  emit('update:modelValue', false)
}

const copyOrderNo = () => {
  if (detail.value?.orderNo) {
    navigator.clipboard.writeText(detail.value.orderNo)
    globalShowToast(t('betDetails.copy'))
  }
}
</script>

<style scoped></style>
