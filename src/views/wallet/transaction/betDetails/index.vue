<template>
  <div class="bg-bg-1">
    <H5Header :title="'Transaction Details'" />

    <div class="py-3.5">
      <div class="max-w-[520px] mx-auto">
        <!-- 顶部金额卡片 -->
        <div class="bg-bg-2 rounded-lg py-8 flex flex-col items-center justify-center">
          <div class="text-text-1 text-[34px] leading-[34px] font-[700]">
            {{ detail.sign }}{{ detail.amount }}
          </div>
          <div class="text-text-2 text-sm mt-3">
            {{ detail.typeLabel }}
          </div>
          <!-- 详情信息卡片 -->
          <div class="mt-5 bg-bg-4 rounded-lg p-3.5 w-[91%]">
            <div class="flex flex-col gap-5">
              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Currency</span>
                <span class="text-text-1 text-sm">{{ detail.currency }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Amount</span>
                <span class="text-text-1 text-sm">{{ detail.amount }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Order No.</span>
                <div class="flex items-center gap-2 justify-end flex-1">
                  <span class="text-text-1 text-sm truncate text-right flex-1 min-w-0">
                    {{ detail.orderNo }}
                  </span>
                  <button
                    class="size-[20px] bg-[var(--color-opacity-10)] hover:bg-opacity-15 rounded-md flex items-center justify-center"
                    @click="copyOrderNo"
                  >
                    <CopyIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Created At</span>
                <span class="text-text-1 text-sm truncate text-right max-w-[230px]">
                  {{ detail.createdAt }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Remarks</span>
                <span class="text-text-1 text-sm">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import CopyIcon from '@/static/svg/copy.svg?component'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

interface TransactionDetail {
  sign: '+' | '-'
  amount: string
  typeLabel: string
  currency: string
  orderNo: string
  createdAt: string
}

const detail = reactive<TransactionDetail>({
  sign: '+',
  amount: '1000',
  typeLabel: 'Deposit',
  currency: 'PHP',
  orderNo: '',
  createdAt: ''
})

onMounted(() => {
  try {
    const idParam = Number(route.params.id)
    console.log('route.params.id--->', idParam)
  } catch (error) {
    console.error(error)
    router.back()
  }
})

const copyOrderNo = async () => {
  try {
    await navigator.clipboard.writeText(detail.orderNo)
    showToast({
      message: t('locales.betDetails.copy'),
      type: 'success'
    })
  } catch (error) {
    console.error(error)
    showToast({
      message: t('locales.betDetails.copy'),
      type: 'fail'
    })
  }
}
</script>
