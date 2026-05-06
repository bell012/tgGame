<template>
  <div class="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header :title="$t('personalCenter.transactionDetails')" />

    <div class="transaction-details-mobile-scroll flex-1 min-h-0 overflow-y-auto bg-bg-1">
      <div class="py-3.5 px-3.5">
        <div class="bg-bg-2 rounded-lg px-3.5 pb-3.5 pt-[30px] flex flex-col items-center">
          <p class="text-[25px] font-[700] mb-2.5 text-text-1 flex items-center">
            <span :class="['mr-[2px]', detail.direction === 'dec' ? 'relative -top-0.5' : '']">{{
              detail.direction === 'add' ? '+' : '-'
            }}</span>
            <span>{{ detail.betAmount }}</span>
          </p>

          <h2 class="text-text-1 text-sm font-[700] mb-[30px]">{{ detail.gameName }}</h2>

          <!-- 详细信息列表 -->
          <div class="w-full space-y-5 bg-bg-4 rounded-lg p-3.5">
            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.currency') }}</span>
              <span class="text-text-1 text-sm">{{ detail.currency }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('transaction.amount') }}</span>
              <p class="text-text-1 text-sm flex items-center">
                <span>{{ detail.betAmount }}</span>
              </p>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.orderNo') }}</span>
              <div class="flex items-center gap-1 max-w-[75%]">
                <span class="text-text-1 text-sm truncate">{{ detail.orderNo }}</span>
                <button class="p-1" @click="copyOrderNo">
                  <CopyIcon class="w-4 h-4 text-text-2" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('betDetails.createdAt') }}</span>
              <span class="text-text-1 text-sm">{{ detail.createdAt }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-text-3 text-sm">{{ $t('personalCenter.remarks') }}</span>
              <span class="text-text-1 text-sm text-right break-all max-w-[60%]">- -</span>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import H5Header from '@/components/common/H5Header.vue'
import CopyIcon from '@/static/svg/copy.svg?component'
import { globalShowToast } from '@/utils/toast'
import { useI18n } from 'vue-i18n'
import { createEmptyTransactionItem, type Item } from '../transaction/shared'

const { t } = useI18n()
const router = useRouter()

const detail = ref<Item>(createEmptyTransactionItem())

onMounted(() => {
  const state = history.state as { data?: string }

  if (state?.data) {
    try {
      detail.value = JSON.parse(state.data) as Item
    } catch (error) {
      console.error(error)
      router.back()
    }
  } else {
    router.back()
  }
})

const copyOrderNo = () => {
  if (!detail.value.orderNo) return
  navigator.clipboard.writeText(detail.value.orderNo)
  globalShowToast(t('betDetails.copy'))
}
</script>

<style scoped lang="scss">
.transaction-details-mobile-scroll {
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
