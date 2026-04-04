<template>
  <!-- 订单弹窗主容器 -->
  <div
    class="relative w-full max-w-[480px] flex flex-col sm:rounded-xl modal-container bg-bg-2 font-['Inter']"
    :style="panelInlineStyle"
    :class="[panelHeightClass, panelBgClass, panelContainerClass]"
  >
    <!-- 订单弹窗头部 -->
    <div class="relative shrink-0 flex items-center justify-between h-14">
      <!-- 订单标题 -->
      <h2 class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-semibold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 移动端头部操作区 -->
      <template v-if="isMobile">
        <!-- 关闭按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <!-- 订单详情按钮 -->
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
      <!-- 桌面端头部操作区 -->
      <template v-else>
        <!-- 关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md sm:flex items-center justify-center z-10"
          @click="handleClose"
        >
          <CloseIcon class="w-4 h-4 fill-none" />
        </button>
      </template>
    </div>
    <!-- 数字币订单内容区 -->
    <template v-if="isCryptoOrder">
      <!-- 数字币待上传凭证状态区域 -->
      <div
        v-show="isUploadNotStarted"
        class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[628px]"
      >
        <!-- 数字币待支付卡片 -->
        <div ref="targetRef" class="w-full bg-bg-2 rounded-lg relative">
          <!-- 倒计时与提示区域 -->
          <div class="relative flex items-center p-3 border-b border-input-1">
            <!-- 倒计时图标容器 -->
            <div class="w-5 mr-4">
              <CryptoOrderCountdownIcon class="w-5 h-5" />
            </div>
            <!-- 跑马灯提示文案区域 -->
            <div class="flex items-center justify-between w-full overflow-hidden whitespace-nowrap">
              <p class="marquee">Please pay within and upload proof</p>
            </div>
            <!-- 倒计时展示区域 -->
            <div class="mx-1 bg-bg-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <CountDown :time="countdownTime">
                <template #default="timeData">
                  <span class="led-font text-secondary-7 text-[33px] font-bold leading-none">{{
                    timeData.minutes
                  }}</span>
                  <span class="led-font text-secondary-7 text-[33px] font-bold leading-none"
                    >:</span
                  >
                  <span class="led-font text-secondary-7 text-[33px] font-bold leading-none">{{
                    timeData.seconds
                  }}</span>
                </template>
              </CountDown>
            </div>
          </div>
          <!-- 数字币金额头部组件 -->
          <orderAmountHeader
            :amount="cryptoDisplayAmount"
            :method="cryptoDisplayMethod"
            :rate="cryptoRate"
          />
          <!-- 二维码展示区域 -->
          <div class="w-full mt-6 flex justify-center">
            <canvas class="w-[153px]" ref="canvasRef" />
          </div>
          <!-- 网络名称区域 -->
          <div
            v-if="cryptoNetwork"
            class="w-full mt-4 px-3 text-theme-primary text-sm sm:text-2xl font-bold leading-none capitalize text-center"
          >
            {{ cryptoNetwork }}
          </div>
          <!-- 地址文本区域 -->
          <div v-if="cryptoAddress" class="w-full p-3 mt-1.5">
            <div
              class="w-full p-4 rounded-lg bg-bg-4 text-text-1 text-sm sm:text-base break-all leading-normal"
            >
              {{ cryptoAddress }}
            </div>
          </div>
          <!-- 地址操作按钮区域 -->
          <div v-if="cryptoAddress" class="p-3 grid grid-cols-2 gap-2">
            <button
              @click.stop="doCapture"
              class="py-3 bg-theme-3 rounded-lg text-theme-primary text-sm sm:text-base font-bold leading-normal flex items-center justify-center"
            >
              Save QR Code
            </button>
            <button
              @click.stop="copyWord(cryptoAddress)"
              class="py-3 bg-theme-3 rounded-lg text-theme-primary text-sm sm:text-base font-bold leading-normal flex items-center justify-center"
            >
              Copy Address
            </button>
          </div>
        </div>
        <!-- 数字币订单摘要区域 -->
        <div class="mt-6 px-5 py-3 w-full bg-bg-2 rounded-lg relative grid gap-2">
          <orderDetailRows :rows="cryptoSummaryRows" @copy="copyWord" />
        </div>
        <!-- 上传凭证按钮 -->
        <button
          class="mt-6 w-full h-10 sm:h-12 rounded-lg text-text-4 text-sm font-bold flex items-center justify-center btn-primary"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof') }}
        </button>
        <!-- 取消订单按钮 -->
        <button
          class="mt-3 w-full h-10 sm:h-12 rounded-lg bg-opacity-10 text-text-2 text-sm font-bold flex items-center justify-center"
          @click.stop="doCancelOrder"
        >
          {{ t('deposit.cancel_order_title') }}
        </button>
        <!-- 底部提示文案 -->
        <div class="mt-3 w-full text-center text-secondary-7 text-xs sm:text-sm leading-normal">
          {{ t('deposit.deposit_order_bottom_tips') }}
        </div>
      </div>
      <!-- 数字币上传中状态区域 -->
      <div
        v-show="isUploadInProgress"
        class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[623px]"
      >
        <!-- 上传中提示卡片 -->
        <div class="w-full bg-bg-2 rounded-tl-lg rounded-tr-lg">
          <!-- 上传中提示头部 -->
          <div class="flex items-center p-3 border-b border-input-1">
            <!-- 上传中图标容器 -->
            <div class="w-5 mr-4">
              <CryptoOrderVerifyingIcon class="w-5 h-5" />
            </div>
            <!-- 上传中跑马灯文案 -->
            <div class="w-full overflow-hidden whitespace-nowrap">
              <p class="marquee">
                Payment received. Your order is being verified. Thank you for your patience.
              </p>
            </div>
          </div>
        </div>
        <!-- 上传中详情卡片 -->
        <div class="bg-bg-2 p-4 rounded-bl-lg rounded-br-lg">
          <orderAmountHeader
            :amount="cryptoDisplayAmount"
            :method="cryptoDisplayMethod"
            :rate="cryptoRate"
            wrapper-class="pt-2"
          />
          <!-- 上传中订单摘要区域 -->
          <div class="mt-4 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid gap-2">
            <orderDetailRows :rows="cryptoSummaryRows" @copy="copyWord" />
          </div>
        </div>
        <!-- 重新上传按钮 -->
        <button
          class="mt-6 w-full h-10 sm:h-12 rounded-lg text-text-4 text-sm font-bold flex items-center justify-center btn-primary"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof_again_btn_text') }}
        </button>
        <!-- 上传中提醒文案区域 -->
        <div class="bg-bg-2 mt-6 p-5 rounded-lg text-sm sm:text-base font-normal sm:leading-normal">
          <!-- 提醒标题 -->
          <p class="text-[color:#F44854]">Reminder</p>
          <!-- 提醒内容第一条 -->
          <p class="text-text-3 mt-4">
            · To ensure funds are credited successfully, please upload the correct payment receipt.
          </p>
          <!-- 提醒内容第二条 -->
          <p class="text-text-3 mt-4">
            · If you have already uploaded the proof, please wait patiently. Verification usually
            takes 1–5 minutes.
          </p>
        </div>
      </div>
      <!-- 数字币上传完成状态区域 -->
      <div
        v-show="isUploadCompleted"
        class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[506px]"
      >
        <!-- 上传完成结果卡片 -->
        <div class="w-full bg-bg-2 rounded-lg pt-10 px-4 pb-8">
          <orderStatusResult :status="orderStatus" :title="completedStatusTitle" />
          <!-- 上传完成订单详情区域 -->
          <div class="mt-6 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid gap-3">
            <orderDetailRows :rows="cryptoCompletedRows" @copy="copyWord" />
          </div>
        </div>
      </div>
    </template>
    <!-- 法币订单内容区 -->
    <template v-else-if="isFiatOrder">
      <!-- 法币订单容器 -->
      <div
        class="w-full flex-1 min-h-0 p-3 rounded-bl-xl rounded-br-xl bg-bg-1 overflow-y-auto sm:max-h-[435px]"
      >
        <!-- 法币订单卡片 -->
        <div class="w-full px-4 pt-8 pb-4 rounded-xl bg-bg-2">
          <!-- 法币金额展示区域 -->
          <div class="w-full flex items-center justify-center">
            <!-- 法币金额图标容器 -->
            <div class="w-4 mr-1">
              <FiatOrderAmountIcon class="w-4 h-[21px]" />
            </div>
            <p class="text-2xl font-bold leading-normal capitalize text-text-1">
              {{ fiatDisplayAmount }}
            </p>
          </div>
          <!-- 法币金额说明文案 -->
          <p class="mt-2 text-text-1 text-sm sm:text-base leading-normal text-center">
            Deposit Amount
          </p>
          <!-- 法币订单详情区域 -->
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
    </template>
  </div>

  <!-- 取消订单弹窗 -->
  <cancelOrderPop v-if="cancelOrderPopShow" v-model="cancelOrderPopShow" />
  <!-- 上传凭证弹窗 -->
  <uploadProofPop
    v-model="uploadPopShow"
    @close="handleUploadProofClose"
    @confirmUpload="handleConfirmUpload"
  />
</template>
<script setup lang="ts">
import type { QueryPayOrderByOrderIdResult } from '@/api/interface/wallet'
import { useIsMobile } from '@/composables/useMediaQuery'
import { getOrderStatusText, normalizeOrderStatusCode } from '@/constants/orderStatus'
import CloseIcon from '@/static/svg/close.svg?component'
import CryptoOrderCountdownIcon from '@/static/svg/deposit/crypto-order-countdown.svg?component'
import CryptoOrderVerifyingIcon from '@/static/svg/deposit/crypto-order-verifying.svg?component'
import FiatOrderAmountIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'

import DetailsIcon from '@/static/svg/deposit/record.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { CountDown, showToast } from 'vant'
import type { CSSProperties } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import uploadProofPop from '../uploadProof/uploadProofPop.vue'
import cancelOrderPop from './cancelOrderPop.vue'
import orderAmountHeader from './orderAmountHeader.vue'
import type { DetailRowItem } from './orderDetailRows.vue'
import orderDetailRows from './orderDetailRows.vue'
import orderStatusResult from './orderStatusResult.vue'
import type { CryptOrderType, FiatOrderType, OrderType } from './orderType'

const { t } = useI18n()
const isMobile = useIsMobile()

type PopupOrderInfo = OrderType | Partial<QueryPayOrderByOrderIdResult>

interface Props {
  orderInfo: PopupOrderInfo
}
const props = defineProps<Props>()
const emit = defineEmits(['close', 'hidden'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const targetRef = ref<HTMLElement | null>(null)
const countdownTime = ref(15 * 60 * 1000)
const cancelOrderPopShow = ref<boolean>(false)
const uploadPopShow = ref<boolean>(false)
const confirmUploadStatus = ref<'not_started' | 'in_progress' | 'completed'>('not_started')
const orderStatus = ref<'Completed' | 'Cancelled'>('Completed')

// 过滤详情行数组中的空项，保证渲染数据类型稳定
const compactRows = (rows: Array<DetailRowItem | null>) =>
  rows.filter((row): row is DetailRowItem => row !== null)

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

const parseNetworkName = (subColumnName?: unknown) => {
  if (typeof subColumnName !== 'string' || !subColumnName) return ''

  try {
    return JSON.parse(subColumnName)?.zh || subColumnName
  } catch {
    return subColumnName
  }
}

const rawOrderInfo = computed(() => props.orderInfo as Partial<QueryPayOrderByOrderIdResult>)
const legacyCryptoOrderInfo = computed(() => props.orderInfo as Partial<CryptOrderType>)
const legacyFiatOrderInfo = computed(() => props.orderInfo as Partial<FiatOrderType>)
const orderType = computed(() => (props.orderInfo as Partial<OrderType>).type)
const hasCryptoFields = computed(
  () =>
    !!(
      rawOrderInfo.value.accountAmount !== undefined ||
      rawOrderInfo.value.accountCurrency ||
      rawOrderInfo.value.accountNo ||
      rawOrderInfo.value.accountName
    )
)
const isCryptoOrder = computed(
  () => orderType.value === 'Crypto' || (orderType.value !== 'Fiat' && hasCryptoFields.value)
)
const isFiatOrder = computed(() => !isCryptoOrder.value)
const isUploadNotStarted = computed(() => confirmUploadStatus.value === 'not_started')
const isUploadInProgress = computed(() => confirmUploadStatus.value === 'in_progress')
const isUploadCompleted = computed(() => confirmUploadStatus.value === 'completed')
const isOrderCompleted = computed(() => orderStatus.value === 'Completed')

const fiatOrderInfo = computed<Partial<FiatOrderType> | null>(() =>
  isFiatOrder.value ? legacyFiatOrderInfo.value : null
)
const cryptoDisplayAmount = computed(() => {
  const amount = Number(
    rawOrderInfo.value.accountAmount !== undefined
      ? rawOrderInfo.value.accountAmount
      : (legacyCryptoOrderInfo.value.amount ?? 0)
  )
  return Number.isFinite(amount) ? amount : 0
})
const fiatDisplayAmount = computed(() => Number(fiatOrderInfo.value?.amount ?? 0))
const cryptoDisplayMethod = computed(
  () => rawOrderInfo.value.accountCurrency ?? legacyCryptoOrderInfo.value.method ?? ''
)
const cryptoAddress = computed(
  () => rawOrderInfo.value.accountNo ?? legacyCryptoOrderInfo.value.address_token ?? ''
)
const cryptoOrderNo = computed(() =>
  String(rawOrderInfo.value.orderId ?? legacyCryptoOrderInfo.value.order_no ?? '')
)
const cryptoCreatedAt = computed(() => {
  if (rawOrderInfo.value.createTime) {
    return formatTimestamp(rawOrderInfo.value.createTime)
  }

  return legacyCryptoOrderInfo.value.created_at ?? ''
})
const cryptoNetwork = computed(
  () =>
    rawOrderInfo.value.accountName ||
    parseNetworkName(rawOrderInfo.value.subColumnName) ||
    legacyCryptoOrderInfo.value.network ||
    ''
)
const cryptoMethodIcon = computed(() => legacyCryptoOrderInfo.value.method_icon ?? '')
const cryptoRate = computed(() => {
  const legacyRate = legacyCryptoOrderInfo.value.rate
  if (legacyRate) return legacyRate

  const accountAmount = Number(rawOrderInfo.value.accountAmount)
  const busiAmount = Number(rawOrderInfo.value.busiAmount)
  if (!Number.isFinite(accountAmount) || !Number.isFinite(busiAmount) || accountAmount === 0) {
    return ''
  }

  const rateValue = (busiAmount / accountAmount).toFixed(2)
  const accountCurrency = rawOrderInfo.value.accountCurrency ?? ''
  const currency = rawOrderInfo.value.currency ?? ''

  if (!accountCurrency || !currency) return rateValue
  return `1${accountCurrency}≈${rateValue}${currency}`
})
const fiatStatusStyleMap: Record<number, CSSProperties> = {
  1: { color: 'var(--color-assist-green)' },
  2: { color: 'var(--color-assist-red)' }
}

// 根据法币订单状态返回对应的文字样式
const getFiatStatusStyle = (status: number | string | undefined) => {
  const normalizedStatus = normalizeOrderStatusCode('deposit', status)
  if (normalizedStatus !== undefined && fiatStatusStyleMap[normalizedStatus]) {
    return fiatStatusStyleMap[normalizedStatus]
  }
  return { color: 'var(--color-assist-blue)' }
}

const panelHeightClass = computed(() => {
  if (isFiatOrder.value) return 'sm:max-h-[491px]'
  if (confirmUploadStatus.value === 'in_progress') return 'sm:max-h-[679px]'
  if (confirmUploadStatus.value === 'completed') return 'sm:max-h-[562px]'
  return 'sm:max-h-[684px]'
})

const panelBgClass = computed(() => (isFiatOrder.value ? 'bg-bg-1' : 'bg-bg-2'))

const panelContainerClass = computed(() => (isFiatOrder.value ? 'h-full sm:h-auto' : ''))

const panelInlineStyle = computed(() => ({
  height: isMobile.value || (isCryptoOrder.value && !isUploadCompleted.value) ? '100%' : 'auto'
}))

const cryptoSummaryRows = computed<DetailRowItem[]>(() => {
  if (!isCryptoOrder.value) return []

  return compactRows([
    cryptoNetwork.value ? { label: 'Network', value: cryptoNetwork.value } : null,
    {
      label: 'Order No.',
      value: cryptoOrderNo.value,
      copyValue: cryptoOrderNo.value
    },
    {
      label: 'Created At',
      value: cryptoCreatedAt.value
    },
    {
      label: 'Deposit Method',
      value: cryptoDisplayMethod.value,
      icon: cryptoMethodIcon.value
    }
  ])
})

const cryptoCompletedRows = computed<DetailRowItem[]>(() => {
  if (!isCryptoOrder.value) return []

  const busiAmount = Number(rawOrderInfo.value.busiAmount)
  const finalAmount = Number.isFinite(busiAmount)
    ? `${busiAmount}${rawOrderInfo.value.currency ?? ''}`
    : `${cryptoDisplayAmount.value * 7.15}PHP`

  return compactRows([
    {
      label: 'Total Payment',
      value: `${cryptoDisplayAmount.value}${cryptoDisplayMethod.value}`
    },
    {
      label: 'Final Amount',
      value: finalAmount
    },
    {
      label: 'Exchange Rate',
      value: cryptoRate.value || '1USDT≈7.15PHP'
    },
    cryptoNetwork.value ? { label: 'Network', value: cryptoNetwork.value } : null,
    {
      label: 'Order No.',
      value: cryptoOrderNo.value,
      copyValue: cryptoOrderNo.value
    },
    {
      label: 'Created At',
      value: cryptoCreatedAt.value
    },
    {
      label: 'Deposit Method',
      value: cryptoDisplayMethod.value,
      icon: cryptoMethodIcon.value
    }
  ])
})

const fiatSummaryRows = computed<DetailRowItem[]>(() => {
  if (!fiatOrderInfo.value) return []

  const fiatStatus = getOrderStatusText('deposit', fiatOrderInfo.value.status, t)

  return compactRows([
    fiatOrderInfo.value.currency
      ? { label: 'Currency', value: fiatOrderInfo.value.currency }
      : null,
    {
      label: 'Payment Amount',
      value: fiatOrderInfo.value.amount ?? 0
    },
    fiatOrderInfo.value.bonus ? { label: 'Deposit Bonus', value: fiatOrderInfo.value.bonus } : null,
    {
      label: 'Order Status',
      value: fiatStatus,
      valueStyle: getFiatStatusStyle(fiatOrderInfo.value.status)
    },
    {
      label: 'Order No.',
      value: fiatOrderInfo.value.order_no ?? '',
      copyValue: fiatOrderInfo.value.order_no ?? ''
    },
    {
      label: 'Created At',
      value: fiatOrderInfo.value.created_at ?? ''
    },
    {
      label: 'Deposit Method',
      value: fiatOrderInfo.value.method ?? '',
      icon: fiatOrderInfo.value.method_icon
    }
  ])
})

const completedStatusTitle = computed(() =>
  isOrderCompleted.value ? 'Order Completed' : 'Order Cancelled'
)

// 关闭订单弹窗
const handleClose = () => {
  emit('close')
}

// 关闭上传凭证弹窗时同步通知父组件隐藏外层弹窗
const handleUploadProofClose = () => {
  emit('hidden')
}

// 上传凭证确认后切换到“上传中”状态
const handleConfirmUpload = () => {
  confirmUploadStatus.value = 'in_progress'
}

// 打开上传凭证弹窗并先隐藏当前弹窗
const openUploadPop = () => {
  emit('hidden')
  uploadPopShow.value = true
}

// 渲染充值地址二维码到 canvas
const renderQrCode = async () => {
  if (!canvasRef.value || !cryptoAddress.value) return

  await nextTick()
  if (!canvasRef.value) return

  QRCode.toCanvas(canvasRef.value, cryptoAddress.value, {
    width: 153,
    margin: 2
  })
}

// 截图当前支付信息区域并复制图片到剪贴板
const doCapture = async () => {
  const el = targetRef.value
  if (!el) return

  await document.fonts.ready
  const canvas = await html2canvas(el, {
    scale: window.devicePixelRatio || 2,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    backgroundColor: '#fff'
  })

  canvas.toBlob(async blob => {
    if (!blob) return
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    showToast({
      message: t('betDetails.copy'),
      type: 'success'
    })
  })
}

// 打开取消订单确认弹窗
const doCancelOrder = () => {
  cancelOrderPopShow.value = true
}

// 复制文本内容到剪贴板并给出提示
const copyWord = (word: string) => {
  navigator.clipboard.writeText(word)
  showToast({
    message: t('betDetails.copy'),
    type: 'success'
  })
}

// 监听二维码画布与地址变化，自动重绘二维码
watch(
  [canvasRef, cryptoAddress],
  () => {
    renderQrCode()
  },
  { immediate: true, flush: 'post' }
)
</script>
<style scoped lang="scss">
@font-face {
  font-family: 'FX-LED';
  src: url('@/static/fonts/FX-LED.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.led-font {
  font-family: 'FX-LED', monospace;
}

.marquee {
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
