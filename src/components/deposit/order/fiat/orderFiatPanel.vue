<template>
  <!-- 法币订单弹窗主容器 -->
  <div
    class="relative w-full max-w-[480px] h-full sm:h-auto sm:max-h-[491px] flex flex-col sm:rounded-xl modal-container bg-bg-1 font-['Inter']"
    :style="panelInlineStyle"
  >
    <!-- 弹窗头部 -->
    <div class="relative shrink-0 flex items-center justify-between h-14 rounded-t-lg bg-bg-2">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-semibold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 区块：template -->
      <template v-if="isMobile">
        <!-- 移动端返回按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <!-- 移动端详情按钮 -->
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="openDepositOrder"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
      <template v-else>
        <!-- 桌面端关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </template>
    </div>

    <!-- 法币订单内容区域 -->
    <div
      class="w-full flex-1 min-h-0 p-3 rounded-bl-xl rounded-br-xl bg-bg-1 overflow-y-auto sm:max-h-[435px]"
    >
      <!-- 法币订单信息卡片 -->
      <div class="w-full px-4 pt-8 pb-4 rounded-xl bg-bg-2">
        <!-- 金额展示区域 -->
        <div class="w-full flex items-center justify-center">
          <!-- 金额图标 -->
          <div class="w-4 mr-1">
            <FiatOrderAmountIcon class="w-4 h-[21px]" />
          </div>
          <p class="text-2xl font-bold leading-normal capitalize text-text-1">
            {{ fiatDisplayAmount }}
          </p>
        </div>
        <p class="mt-2 text-text-1 text-sm sm:text-base leading-normal text-center">
          {{ t('deposit.deposit_amount') }}
        </p>
        <!-- 订单明细区域 -->
        <div class="mt-8 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid gap-4">
          <orderDetailRows
            :rows="fiatSummaryRows"
            row-class="h-5 flex items-center justify-between"
            value-class="text-base flex items-center text-text-1"
            icon-class="h-5 mr-1"
            @copy="copyWord"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { getOrderStatusColorStyle, getOrderStatusText } from '@/constants/orderStatus'
import CloseIcon from '@/static/svg/close.svg?component'
import FiatOrderAmountIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateToName } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DetailRowItem } from '../orderDetailRows.vue'
import orderDetailRows from '../orderDetailRows.vue'
import type { FiatOrderType } from '../orderType'

const { t } = useI18n()
const isMobile = useIsMobile()

interface Props {
  orderInfo: Partial<FiatOrderType>
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

// 过滤详情行中的空项
const compactRows = (rows: Array<DetailRowItem | null>) =>
  rows.filter((row): row is DetailRowItem => row !== null)

const fiatOrderInfo = computed(() => props.orderInfo)
const fiatDisplayAmount = computed(() => Number(fiatOrderInfo.value.amount ?? 0))

// 获取法币订单状态样式
const getFiatStatusStyle = (status: number | string | undefined) =>
  getOrderStatusColorStyle('deposit', status)

const panelInlineStyle = computed(() => ({
  height: isMobile.value ? '100%' : 'auto'
}))

// 组装法币订单明细行
const fiatSummaryRows = computed<DetailRowItem[]>(() => {
  const fiatStatus = getOrderStatusText('deposit', fiatOrderInfo.value.status, t)

  return compactRows([
    fiatOrderInfo.value.currency
      ? { label: t('deposit.order_currency'), value: fiatOrderInfo.value.currency }
      : null,
    {
      label: t('deposit.order_payment_amount'),
      value: fiatOrderInfo.value.amount ?? 0
    },
    fiatOrderInfo.value.bonus
      ? { label: t('deposit.order_deposit_bonus'), value: fiatOrderInfo.value.bonus }
      : null,
    {
      label: t('deposit.order_status'),
      value: fiatStatus,
      valueStyle: getFiatStatusStyle(fiatOrderInfo.value.status)
    },
    {
      label: t('deposit.order_no'),
      value: fiatOrderInfo.value.order_no ?? '',
      copyValue: fiatOrderInfo.value.order_no ?? ''
    },
    {
      label: t('deposit.order_created_at'),
      value: fiatOrderInfo.value.created_at ?? ''
    },
    {
      label: t('deposit.order_deposit_method'),
      value: fiatOrderInfo.value.method ?? '',
      icon: fiatOrderInfo.value.method_icon
    }
  ])
})

// 关闭订单弹窗
const handleClose = () => {
  emit('close')
}

// 复制文本到剪贴板
const copyWord = async (word: string) => {
  const copied = await copyTextWithFallback(word)
  globalShowToast({
    message: copied ? t('deposit.copy_success') : t('deposit.copy_failed'),
    type: copied ? 'success' : 'fail'
  })
}

const openDepositOrder = () => {
  emit('close')
  requestAnimationFrame(() => {
    void navigateToName('my-orders')
  })
}
</script>
