<template>
  <!-- 法币订单弹窗主容器 -->
  <div
    class="relative w-full max-w-[480px] h-full sm:h-auto sm:max-h-[491px] flex flex-col sm:rounded-lg modal-container bg-bg-1 font-['Inter']"
    :style="panelInlineStyle"
  >
    <!-- 弹窗头部 -->
    <div
      class="relative shrink-0 flex items-center justify-between h-[49px] sm:h-14 sm:rounded-t-lg bg-bg-2"
    >
      <h2 class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-bold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 区块：template -->
      <template v-if="isMobile">
        <!-- 移动端返回按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[33px] h-[33px] bg-opacity-6 rounded-lg flex items-center justify-center z-10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <!-- 移动端详情按钮 -->
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-[33px] h-[33px] bg-opacity-6 rounded-lg flex items-center justify-center z-10"
          v-if="!embedded"
          @click="openDepositOrder"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
      <template v-else>
        <!-- 桌面端关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded flex items-center justify-center z-10"
          @click="handleClose"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </template>
    </div>

    <!-- 法币订单内容区域 -->
    <div
      class="w-full flex-1 min-h-0 p-[14px] sm:p-4 sm:rounded-b-lg bg-bg-1 overflow-y-auto sm:max-h-[435px]"
    >
      <!-- 法币订单信息卡片 -->
      <div
        class="w-full flex flex-col gap-[30px] sm:gap-8 px-[14px] sm:px-4 pt-[30px] pb-[14px] sm:pt-8 sm:pb-4 rounded-lg bg-bg-2"
      >
        <!-- 金额展示区域 -->
        <div class="flex flex-col items-center gap-[10px] sm:gap-2">
          <div class="flex items-center justify-center">
            <!-- 金额图标 -->
            <span
              class="mr-0.5 shrink-0 text-[20px] leading-[20px] sm:text-[24px] sm:leading-[24px] text-text-1"
            >
              {{ fiatCurrencySymbol }}
            </span>
            <p class="text-[25px] sm:text-2xl font-bold leading-normal capitalize text-text-1">
              {{ fiatDisplayAmount }}
            </p>
          </div>
          <p class="text-text-1 text-sm sm:text-base leading-normal text-center">
            {{ t('deposit.deposit_amount') }}
          </p>
        </div>
        <!-- 订单明细区域 -->
        <div
          class="w-full p-[14px] sm:px-5 sm:py-4 bg-bg-4 rounded-lg relative grid gap-5 sm:gap-4"
        >
          <orderDetailRows
            :rows="fiatSummaryRows"
            row-class="min-h-5 flex items-center justify-between gap-4"
            value-class="text-sm sm:text-base flex items-center text-text-1"
            icon-class="h-5 w-5 rounded-full mr-[5px] sm:w-auto sm:rounded-none sm:mr-1"
            copy-class="ml-[5px] sm:ml-2 shrink-0"
            copy-icon-class="w-4 h-4 sm:w-6 sm:h-6"
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
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { getCurrencySymbol } from '@/utils/locale'
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
  embedded?: boolean
  orderInfo: Partial<FiatOrderType>
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

// 过滤详情行中的空项
const compactRows = (rows: Array<DetailRowItem | null>) =>
  rows.filter((row): row is DetailRowItem => row !== null)

const fiatOrderInfo = computed(() => props.orderInfo)
const fiatDisplayAmount = computed(() => Number(fiatOrderInfo.value.amount ?? 0))
const fiatCurrencySymbol = computed(() => getCurrencySymbol(fiatOrderInfo.value.currency))

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
