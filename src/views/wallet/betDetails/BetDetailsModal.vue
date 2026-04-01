<template>
  <!-- PC-详情弹窗 -->
  <div
    v-if="modelValue && betDetail"
    class="hidden md:flex fixed inset-0 bg-mask-60-1 z-50 items-center justify-center"
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
          <h3 class="text-text-1 text-lg font-bold">{{ $t('betDetails.title') }}</h3>
        </div>
      </div>

      <div class="p-4 flex flex-col items-center bg-bg-1">
        <div class="w-full h-full flex flex-col items-center bg-bg-2 rounded-lg p-4 pt-8">
          <div class="w-[52px] h-[68px] rounded-lg overflow-hidden mb-2">
            <img :src="betDetail.gameIcon" alt="" class="w-full h-full object-cover" />
          </div>

          <p class="text-text-1 text-2xl font-bold mb-2">{{ betDetail.gameType }}</p>

          <h2 class="text-text-1 text-base mb-8">{{ betDetail.gameName }}</h2>

          <div class="w-full flex items-center justify-between bg-bg-4 rounded-lg p-3 mb-4">
            <span
              :class="[
                'text-base',
                betDetail.result === 'win' ? 'text-secondary-2' : 'text-secondary-4'
              ]"
            >
              {{ betDetail.result === 'win' ? $t('betHistory.win') : $t('betHistory.loss') }}
            </span>
            <span
              :class="[
                'text-base font-bold',
                betDetail.result === 'win' ? 'text-secondary-2' : 'text-secondary-4'
              ]"
            >
              {{ betDetail.result === 'win' ? '+' : '-' }}{{ betDetail.resultAmount }}
            </span>
          </div>

          <div class="w-full space-y-4 text-base bg-bg-4 rounded-lg px-5 py-4">
            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betDetails.currency') }}</span>
              <span class="text-text-1">{{ betDetail.currency }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betHistory.betAmount') }}</span>
              <span class="text-text-1">{{ betDetail.betAmount }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3"
                >{{ $t('betHistory.win') }}/{{ $t('betHistory.loss') }}</span
              >
              <span class="text-text-1">
                {{ betDetail.result === 'win' ? '+' : '-' }}{{ betDetail.resultAmount }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betDetails.orderNo') }}</span>
              <div class="flex items-center">
                <span class="text-text-1">{{ betDetail.orderNo }}</span>
                <button class="p-1" @click="copyOrderNo">
                  <CopyIcon class="w-6 h-6 text-text-2" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">{{ $t('betDetails.createdAt') }}</span>
              <span class="text-text-1">{{ betDetail.createdAt }}</span>
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
import { showToast } from 'vant'
import CopyIcon from '@/static/svg/copy.svg?component'
import Close from '@/static/svg/close.svg?component'
import type { Item } from '../betHistory/shared'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  bet: Item | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const betDetail = computed(() => props.bet)

const closeModal = () => {
  emit('update:modelValue', false)
}

const copyOrderNo = () => {
  if (betDetail.value?.orderNo) {
    navigator.clipboard.writeText(betDetail.value.orderNo)
    showToast({
      message: t('betDetails.copy'),
      type: 'success'
    })
  }
}
</script>

<style scoped></style>
