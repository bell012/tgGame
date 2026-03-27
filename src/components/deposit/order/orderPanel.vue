<template>
  <div
    class="relative w-full max-w-[480px] flex flex-col sm:rounded-xl modal-container bg-bg-2 font-['Inter']"
    :style="panelInlineStyle"
    :class="[panelHeightClass, panelBgClass, panelContainerClass]"
  >
    <div class="relative shrink-0 flex items-center justify-between h-14">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <template v-if="isMobile">
        <!-- 关闭按钮 -->
        <button
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <LeftArrowIcon class="w-4 h-4" />
        </button>
        <button
          class="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
          @click="handleClose"
        >
          <DetailsIcon class="w-4 h-4" />
        </button>
      </template>
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
    <template v-if="isCryptoOrder">
      <div
        v-show="isUploadNotStarted"
        class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[628px]"
      >
        <div ref="targetRef" class="w-full bg-bg-2 rounded-lg relative">
          <div class="relative flex items-center p-3 border-b border-input-1">
            <div class="w-5 mr-4">
              <CryptoOrderCountdownIcon class="w-5 h-5" />
            </div>
            <div class="flex items-center justify-between w-full overflow-hidden whitespace-nowrap">
              <p class="marquee">Please pay within and upload proof</p>
            </div>
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
          <orderAmountHeader
            :amount="orderInfo.amount"
            :method="orderInfo.method"
            :rate="cryptoRate"
          />
          <div class="w-full mt-6 flex justify-center">
            <canvas class="w-[153px]" ref="canvasRef" />
          </div>
          <div
            v-if="cryptoNetwork"
            class="w-full mt-4 px-3 text-theme-primary text-2xl font-bold leading-none capitalize text-center"
          >
            {{ cryptoNetwork }}
          </div>
          <div v-if="cryptoAddress" class="w-full p-3 mt-1.5">
            <div
              class="w-full p-4 rounded-lg bg-bg-4 text-text-1 text-base break-all leading-normal"
            >
              {{ cryptoAddress }}
            </div>
          </div>
          <div v-if="cryptoAddress" class="p-3 grid grid-cols-2 gap-2">
            <button
              @click.stop="doCapture"
              class="py-3 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal flex items-center justify-center"
            >
              Save QR Code
            </button>
            <button
              @click.stop="copyWord(cryptoAddress)"
              class="py-3 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal flex items-center justify-center"
            >
              Copy Address
            </button>
          </div>
        </div>
        <div class="mt-6 px-5 py-3 w-full bg-bg-2 rounded-lg relative grid gap-2">
          <orderDetailRows :rows="cryptoSummaryRows" @copy="copyWord" />
        </div>
        <button
          class="mt-6 w-full h-10 sm:h-12 rounded-lg text-text-4 text-[14px] font-bold flex items-center justify-center btn-primary"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof') }}
        </button>
        <button
          class="mt-3 w-full h-10 sm:h-12 rounded-lg bg-opacity-10 text-text-2 text-[14px] font-bold flex items-center justify-center"
          @click.stop="doCancelOrder"
        >
          {{ t('deposit.cancel_order_title') }}
        </button>
        <div class="mt-3 w-full text-center text-secondary-7 text-[14px] leading-normal">
          {{ t('deposit.deposit_order_bottom_tips') }}
        </div>
      </div>
      <div
        v-show="isUploadInProgress"
        class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[623px]"
      >
        <div class="w-full bg-bg-2 rounded-tl-lg rounded-tr-lg">
          <div class="flex items-center p-3 border-b border-input-1">
            <div class="w-5 mr-4">
              <CryptoOrderVerifyingIcon class="w-5 h-5" />
            </div>
            <div class="w-full overflow-hidden whitespace-nowrap">
              <p class="marquee">
                Payment received. Your order is being verified. Thank you for your patience.
              </p>
            </div>
          </div>
        </div>
        <div class="bg-bg-2 p-4 rounded-bl-lg rounded-br-lg">
          <orderAmountHeader
            :amount="orderInfo.amount"
            :method="orderInfo.method"
            :rate="cryptoRate"
            wrapper-class="pt-2"
          />
          <div class="mt-4 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid gap-2">
            <orderDetailRows :rows="cryptoSummaryRows" @copy="copyWord" />
          </div>
        </div>
        <button
          class="mt-6 w-full h-10 sm:h-12 rounded-lg text-text-4 text-[14px] font-bold flex items-center justify-center btn-primary"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof_again_btn_text') }}
        </button>
        <div class="bg-bg-2 mt-6 p-5 rounded-lg text-base font-normal leading-normal">
          <p class="text-[color:#F44854]">Reminder</p>
          <p class="text-text-3 mt-4">
            · To ensure funds are credited successfully, please upload the correct payment receipt.
          </p>
          <p class="text-text-3 mt-4">
            · If you have already uploaded the proof, please wait patiently. Verification usually
            takes 1–5 minutes.
          </p>
        </div>
      </div>
      <div
        v-show="isUploadCompleted"
        class="w-full flex-1 min-h-0 relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[506px]"
      >
        <div class="w-full bg-bg-2 rounded-lg pt-10 px-4 pb-8">
          <orderStatusResult :status="orderStatus" :title="completedStatusTitle" />
          <div class="mt-6 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid gap-3">
            <orderDetailRows :rows="cryptoCompletedRows" @copy="copyWord" />
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="isFiatOrder">
      <div
        class="w-full flex-1 min-h-0 p-3 rounded-bl-xl rounded-br-xl bg-bg-1 overflow-y-auto sm:max-h-[435px]"
      >
        <div class="w-full px-4 pt-8 pb-4 rounded-xl bg-bg-2">
          <div class="w-full flex items-center justify-center">
            <div class="w-4 mr-1">
              <FiatOrderAmountIcon class="w-4 h-[21px]" />
            </div>
            <p class="text-2xl font-bold leading-normal capitalize text-text-1">
              {{ orderInfo.amount }}
            </p>
          </div>
          <p class="mt-2 text-text-1 text-base leading-normal text-center">Deposit Amount</p>
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

  <cancelOrderPop v-if="cancelOrderPopShow" v-model="cancelOrderPopShow" />
  <uploadProofPop
    v-model="uploadPopShow"
    @close="handleUploadProofClose"
    @confirmUpload="handleConfirmUpload"
  />
</template>
<script setup lang="ts">
import { CountDown, showToast } from 'vant'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import CryptoOrderCountdownIcon from '@/static/svg/deposit/crypto-order-countdown.svg?component'
import CryptoOrderVerifyingIcon from '@/static/svg/deposit/crypto-order-verifying.svg?component'
import FiatOrderAmountIcon from '@/static/svg/deposit/fiat-order-amount.svg?component'
import LeftArrowIcon from '@/static/svg/left-icon.svg?component'
import DetailsIcon from '@/static/svg/deposit/order-details.svg?component'
import cancelOrderPop from './cancelOrderPop.vue'
import orderAmountHeader from './orderAmountHeader.vue'
import orderDetailRows from './orderDetailRows.vue'
import type { DetailRowItem } from './orderDetailRows.vue'
import orderStatusResult from './orderStatusResult.vue'
import uploadProofPop from '../uploadProof/uploadProofPop.vue'
import { CryptOrderType, FiatOrderType, OrderType } from './orderType'

const { t } = useI18n()
const isMobile = useIsMobile()

interface Props {
  orderInfo: OrderType
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

const compactRows = (rows: Array<DetailRowItem | null>) =>
  rows.filter((row): row is DetailRowItem => row !== null)

const isCryptoOrder = computed(() => props.orderInfo.type === 'Crypto')
const isFiatOrder = computed(() => props.orderInfo.type === 'Fiat')
const isUploadNotStarted = computed(() => confirmUploadStatus.value === 'not_started')
const isUploadInProgress = computed(() => confirmUploadStatus.value === 'in_progress')
const isUploadCompleted = computed(() => confirmUploadStatus.value === 'completed')
const isOrderCompleted = computed(() => orderStatus.value === 'Completed')

const cryptoOrderInfo = computed<CryptOrderType | null>(() =>
  props.orderInfo.type === 'Crypto' ? (props.orderInfo as CryptOrderType) : null
)
const fiatOrderInfo = computed<FiatOrderType | null>(() =>
  props.orderInfo.type === 'Fiat' ? (props.orderInfo as FiatOrderType) : null
)

const cryptoRate = computed(() => cryptoOrderInfo.value?.rate ?? '')
const cryptoNetwork = computed(() => cryptoOrderInfo.value?.network ?? '')
const cryptoAddress = computed(() => cryptoOrderInfo.value?.address_token ?? '')

const panelHeightClass = computed(() => {
  if (props.orderInfo.type === 'Fiat') return 'sm:max-h-[491px]'
  if (confirmUploadStatus.value === 'in_progress') return 'sm:max-h-[679px]'
  if (confirmUploadStatus.value === 'completed') return 'sm:max-h-[562px]'
  return 'sm:max-h-[684px]'
})

const panelBgClass = computed(() => (isFiatOrder.value ? 'bg-bg-1' : 'bg-bg-2'))

const panelContainerClass = computed(() => (isFiatOrder.value ? 'h-full sm:h-auto' : ''))

const panelInlineStyle = computed(() => ({
  height:
    isMobile.value || (props.orderInfo.type === 'Crypto' && !isUploadCompleted.value)
      ? '100%'
      : 'auto'
}))

const cryptoSummaryRows = computed<DetailRowItem[]>(() => {
  if (!cryptoOrderInfo.value) return []

  return compactRows([
    cryptoOrderInfo.value.network
      ? { label: 'Network', value: cryptoOrderInfo.value.network }
      : null,
    {
      label: 'Order No.',
      value: cryptoOrderInfo.value.order_no,
      copyValue: cryptoOrderInfo.value.order_no
    },
    {
      label: 'Created At',
      value: cryptoOrderInfo.value.created_at
    },
    {
      label: 'Deposit Method',
      value: cryptoOrderInfo.value.method,
      icon: cryptoOrderInfo.value.method_icon
    }
  ])
})

const cryptoCompletedRows = computed<DetailRowItem[]>(() => {
  if (!cryptoOrderInfo.value) return []

  return compactRows([
    {
      label: 'Total Payment',
      value: `${cryptoOrderInfo.value.amount}${cryptoOrderInfo.value.method}`
    },
    {
      label: 'Final Amount',
      value: `${cryptoOrderInfo.value.amount * 7.15}PHP`
    },
    {
      label: 'Exchange Rate',
      value: '1USDT≈7.15PHP'
    },
    cryptoOrderInfo.value.network
      ? { label: 'Network', value: cryptoOrderInfo.value.network }
      : null,
    {
      label: 'Order No.',
      value: cryptoOrderInfo.value.order_no,
      copyValue: cryptoOrderInfo.value.order_no
    },
    {
      label: 'Created At',
      value: cryptoOrderInfo.value.created_at
    },
    {
      label: 'Deposit Method',
      value: cryptoOrderInfo.value.method,
      icon: cryptoOrderInfo.value.method_icon
    }
  ])
})

const fiatSummaryRows = computed<DetailRowItem[]>(() => {
  if (!fiatOrderInfo.value) return []

  return compactRows([
    fiatOrderInfo.value.currency
      ? { label: 'Currency', value: fiatOrderInfo.value.currency }
      : null,
    {
      label: 'Payment Amount',
      value: fiatOrderInfo.value.amount
    },
    fiatOrderInfo.value.bonus ? { label: 'Deposit Bonus', value: fiatOrderInfo.value.bonus } : null,
    {
      label: 'Order Status',
      value: fiatOrderInfo.value.status,
      valueClass: 'text-theme-primary'
    },
    {
      label: 'Order No.',
      value: fiatOrderInfo.value.order_no,
      copyValue: fiatOrderInfo.value.order_no
    },
    {
      label: 'Created At',
      value: fiatOrderInfo.value.created_at
    },
    {
      label: 'Deposit Method',
      value: fiatOrderInfo.value.method,
      icon: fiatOrderInfo.value.method_icon
    }
  ])
})

const completedStatusTitle = computed(() =>
  isOrderCompleted.value ? 'Order Completed' : 'Order Cancelled'
)

const handleClose = () => {
  emit('close')
}

const handleUploadProofClose = () => {
  emit('hidden')
}

const handleConfirmUpload = () => {
  confirmUploadStatus.value = 'in_progress'
}

const openUploadPop = () => {
  emit('hidden')
  uploadPopShow.value = true
}

const renderQrCode = async () => {
  if (!canvasRef.value || !cryptoAddress.value) return

  await nextTick()
  if (!canvasRef.value) return

  QRCode.toCanvas(canvasRef.value, cryptoAddress.value, {
    width: 153,
    margin: 2
  })
}

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

const doCancelOrder = () => {
  cancelOrderPopShow.value = true
}

const copyWord = (word: string) => {
  navigator.clipboard.writeText(word)
  showToast({
    message: t('betDetails.copy'),
    type: 'success'
  })
}

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
