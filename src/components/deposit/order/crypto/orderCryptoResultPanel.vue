<template>
  <!-- 数字币订单结果弹窗主容器 -->
  <div
    class="relative w-full max-w-[481px] h-full sm:h-auto sm:max-h-[562px] flex flex-col sm:rounded-lg modal-container bg-bg-1 overflow-hidden font-['Inter']"
  >
    <!-- 数字币订单结果头部 -->
    <div class="relative shrink-0 h-14 bg-bg-2">
      <h2
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base sm:text-lg font-bold text-text-1"
      >
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 移动端操作按钮区域 -->
      <template v-if="isMobile">
        <!-- 移动端返回按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-opacity-10 text-text-1"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <!-- 移动端详情按钮 -->
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-opacity-10 text-text-1"
          @click="handleClose"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
      <!-- 桌面端关闭按钮区域 -->
      <template v-else>
        <!-- 桌面端关闭按钮 -->
        <button
          class="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded bg-opacity-10 text-text-1"
          @click="handleClose"
        >
          <CloseIcon class="w-3 h-3 fill-none" />
        </button>
      </template>
    </div>

    <!-- 数字币订单结果内容区域 -->
    <div class="flex-1 min-h-0 overflow-y-auto bg-bg-1 p-4">
      <!-- 数字币订单结果卡片 -->
      <div
        class="flex min-h-full w-full flex-col items-center gap-6 rounded-lg bg-bg-2 px-4 py-8 sm:min-h-0"
      >
        <!-- 订单状态展示区域 -->
        <div class="flex flex-col items-center gap-4">
          <orderStatusResult :status="displayStatus" :title="displayTitle" />
        </div>

        <!-- 订单明细区域 -->
        <div class="w-full rounded-lg bg-bg-4 px-5 py-4">
          <orderDetailRows
            :rows="detailRows"
            row-class="min-h-5 py-2 flex items-center justify-between gap-4"
            value-class="max-w-[240px] text-base text-text-1 flex items-center justify-end text-right break-all"
            icon-class="w-5 h-5 mr-1"
            @copy="copyWord"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QueryPayOrderByOrderIdResult } from '@/api/interface/wallet'
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { showToast } from 'vant'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DetailRowItem } from '../orderDetailRows.vue'
import orderDetailRows from '../orderDetailRows.vue'
import orderStatusResult from '../orderStatusResult.vue'

interface Props {
  orderInfo: Partial<QueryPayOrderByOrderIdResult>
  methodIcon?: string
  orderStatus?: 'Completed' | 'Cancelled' | 'Failed'
}

const props = withDefaults(defineProps<Props>(), {
  methodIcon: '',
  orderStatus: 'Completed'
})

const emit = defineEmits<{
  close: []
}>()

const { t, locale } = useI18n()
const isMobile = useIsMobile()

// 过滤空明细项，保证明细列表结构稳定
const compactRows = (rows: Array<DetailRowItem | null>) =>
  rows.filter((row): row is DetailRowItem => row !== null)

// 格式化时间戳为本地时间文本
const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

// 解析网络名称，兼容纯文本与 JSON 字符串
const parseNetworkName = (subColumnName?: unknown) => {
  if (typeof subColumnName !== 'string' || !subColumnName) return ''

  try {
    const parsedName = JSON.parse(subColumnName)
    const localeKey = String(locale.value || 'eng')

    return (
      parsedName?.[localeKey] ||
      parsedName?.eng ||
      parsedName?.en ||
      parsedName?.zh ||
      subColumnName
    )
  } catch {
    return subColumnName
  }
}

// 拼接金额与币种展示文本
const formatAmountText = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return '--'
  return `${amount}${currency ?? ''}`
}

const displayStatus = computed(() => props.orderStatus)

const displayTitle = computed(() =>
  displayStatus.value === 'Cancelled'
    ? t('deposit.order_cancelled')
    : displayStatus.value === 'Failed'
      ? t('deposit.order_failed')
      : t('deposit.order_completed')
)

const totalPaymentText = computed(() =>
  formatAmountText(props.orderInfo.accountAmount, props.orderInfo.accountCurrency)
)

const finalAmountText = computed(() =>
  formatAmountText(props.orderInfo.busiAmount, props.orderInfo.currency)
)

const exchangeRateText = computed(() => {
  const accountAmount = Number(props.orderInfo.accountAmount)
  const busiAmount = Number(props.orderInfo.busiAmount)
  const accountCurrency = props.orderInfo.accountCurrency ?? ''
  const currency = props.orderInfo.currency ?? ''

  if (!Number.isFinite(accountAmount) || !Number.isFinite(busiAmount) || accountAmount === 0) {
    return '--'
  }

  const rateValue = (busiAmount / accountAmount).toFixed(2)

  if (!accountCurrency || !currency) {
    return rateValue
  }

  return `1 ${accountCurrency} = ${rateValue}${currency}`
})

const networkName = computed(
  () =>
    props.orderInfo.accountName ||
    parseNetworkName(props.orderInfo.subColumnName) ||
    props.orderInfo.platformName ||
    ''
)

const orderNo = computed(() => String(props.orderInfo.orderId ?? ''))
const createdAt = computed(() => formatTimestamp(props.orderInfo.createTime))
const depositMethod = computed(
  () => props.orderInfo.accountCurrency || props.orderInfo.platformName || ''
)

// 组装数字币订单结果明细
const detailRows = computed<DetailRowItem[]>(() =>
  compactRows([
    {
      label: t('deposit.order_total_payment'),
      value: totalPaymentText.value
    },
    {
      label: t('deposit.order_final_amount'),
      value: finalAmountText.value
    },
    {
      label: t('deposit.order_exchange_rate'),
      value: exchangeRateText.value
    },
    networkName.value
      ? {
          label: t('deposit.order_network'),
          value: networkName.value
        }
      : null,
    {
      label: t('deposit.order_no'),
      value: orderNo.value,
      copyValue: orderNo.value
    },
    {
      label: t('deposit.order_created_at'),
      value: createdAt.value
    },
    {
      label: t('deposit.order_deposit_method'),
      value: depositMethod.value,
      icon: props.methodIcon
    }
  ])
)

// 关闭数字币订单结果弹窗
const handleClose = () => {
  emit('close')
}

// 复制明细内容到剪贴板
const copyWord = async (word: string) => {
  const copied = await copyTextWithFallback(word)
  showToast({
    message: copied ? t('deposit.copy_success') : t('deposit.copy_failed'),
    type: copied ? 'success' : 'fail'
  })
}
</script>
