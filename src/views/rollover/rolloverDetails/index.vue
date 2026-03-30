<template>
  <div class="bg-bg-1">
    <H5Header :title="'Rollover Details'" />

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
                <span class="text-text-3 text-sm opacity-60">Actual Turnover</span>
                <span class="text-text-1 text-sm">{{ detail.amount }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Required Turnover</span>
                <span class="text-text-1 text-sm truncate text-right max-w-[230px]">
                  {{ detail.amount }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Applicable Games</span>
                <span class="text-text-1 text-sm truncate text-right max-w-[230px]">
                  {{ detail.amount }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Order Status</span>
                <span
                  class="text-sm truncate text-right max-w-[230px] text-[var(--color-secondary-level-4)]"
                >
                  Completed
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-text-3 text-sm opacity-60">Created At</span>
                <span class="text-text-1 text-sm">12/18/2026 11:14:15 AM</span>
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
import H5Header from '@/components/common/H5Header.vue'

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
</script>
