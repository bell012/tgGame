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
          <h3 class="text-text-1 text-lg font-bold">Transaction Details</h3>
        </div>
      </div>

      <div class="p-4 flex flex-col items-center bg-bg-1">
        <div class="w-full h-full flex flex-col items-center bg-bg-2 rounded-lg p-4 pt-8">
          <p class="text-text-1 text-2xl font-bold mb-2">
            {{ betDetail.result === 'win' ? '+' : '-' }}{{ betDetail.amount }}
          </p>

          <h2 class="text-text-1 text-base mb-8">{{ betDetail.gameName }}</h2>

          <div class="w-full space-y-4 text-base bg-bg-4 rounded-lg px-5 py-4">
            <div class="flex items-center justify-between">
              <span class="text-text-3">Currency</span>
              <span class="text-text-1">
                {{ betDetail.currency }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">Actual Turnover</span>
              <span class="text-text-1">
                {{ betDetail.amount }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">Required Turnover</span>
              <span class="text-text-1">
                {{ betDetail.amount }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">Applicable Games</span>
              <span class="text-text-1"> All Games </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">Order Status</span>
              <div class="flex items-center">
                <span
                  :class="betDetail.status == 1 ? 'text-secondary-4' : 'text-secondary-2'"
                  class="font-[700] text-sm"
                >
                  {{
                    betDetail.status == 1
                      ? $t('transaction.completed')
                      : $t('transaction.notCompleted')
                  }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3">Created At</span>
              <span class="text-text-1">{{ betDetail.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Close from '@/static/svg/close.svg?component'

interface BetItem {
  id: number
  gameName: string
  gameIcon: string
  gameType: string
  time: string
  amount: number
  status: number
  result: 'win' | 'loss'
  currency: string
  orderNo: string
}

interface Props {
  modelValue: boolean
  bet: BetItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const betDetail = computed(() => props.bet)

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped></style>
