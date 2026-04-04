<template>
  <!-- 数字币订单结果弹窗主容器 -->
  <div
    class="relative w-full max-w-[481px] h-full sm:h-auto sm:max-h-[562px] flex flex-col sm:rounded-lg modal-container bg-[#242626] overflow-hidden font-['Inter']"
  >
    <!-- 数字币订单结果头部 -->
    <div class="relative shrink-0 h-14 bg-[#323738]">
      <h2
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base sm:text-lg font-bold text-white"
      >
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 移动端操作按钮区域 -->
      <template v-if="isMobile">
        <!-- 移动端返回按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center z-10 bg-white/10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <!-- 移动端详情按钮 -->
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center z-10 bg-white/10"
          @click="handleClose"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
      <!-- 桌面端关闭按钮区域 -->
      <template v-else>
        <!-- 桌面端关闭按钮 -->
        <button
          class="absolute right-4 top-4 w-6 h-6 rounded bg-white/10 flex items-center justify-center z-10"
          @click="handleClose"
        >
          <CloseIcon class="w-3 h-3 fill-none" />
        </button>
      </template>
    </div>

    <!-- 数字币订单结果内容区域 -->
    <div class="flex-1 min-h-0 p-4 overflow-y-auto bg-[#242626]">
      <!-- 数字币订单结果卡片 -->
      <div
        class="w-full min-h-full sm:min-h-0 rounded-lg bg-[#323738] px-4 py-8 flex flex-col items-center gap-6"
      >
        <!-- 订单状态展示区域 -->
        <div class="flex flex-col items-center gap-4">
          <orderStatusResult :status="displayStatus" :title="displayTitle" />
        </div>

        <!-- 订单明细区域 -->
        <div class="w-full rounded-lg bg-[#2D3131] px-5 py-4">
          <orderDetailRows
            :rows="detailRows"
            row-class="min-h-5 py-2 flex items-center justify-between gap-4"
            value-class="max-w-[240px] text-base text-white flex items-center justify-end text-right break-all"
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
import { showToast } from 'vant'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DetailRowItem } from '../orderDetailRows.vue'
import orderDetailRows from '../orderDetailRows.vue'
import orderStatusResult from '../orderStatusResult.vue'

interface Props {
  orderInfo: Partial<QueryPayOrderByOrderIdResult>
  methodIcon?: string
  orderStatus?: 'Completed' | 'Cancelled'
}

const props = withDefaults(defineProps<Props>(), {
  methodIcon: '',
  orderStatus: 'Completed'
})

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
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
    return parsedName?.zh || parsedName?.eng || parsedName?.en || subColumnName
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
  displayStatus.value === 'Cancelled' ? 'Order Cancelled' : 'Order Completed'
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
      label: 'Total Payment',
      value: totalPaymentText.value
    },
    {
      label: 'Final Amount',
      value: finalAmountText.value
    },
    {
      label: 'Exchange Rate',
      value: exchangeRateText.value
    },
    networkName.value
      ? {
          label: 'Network',
          value: networkName.value
        }
      : null,
    {
      label: 'Order No.',
      value: orderNo.value,
      copyValue: orderNo.value
    },
    {
      label: 'Created At',
      value: createdAt.value
    },
    {
      label: 'Deposit Method',
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
const copyWord = (word: string) => {
  navigator.clipboard.writeText(word)
  showToast({
    message: t('betDetails.copy'),
    type: 'success'
  })
}
</script>
