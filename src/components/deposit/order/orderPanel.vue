<template>
  <div
    class="relative w-full max-w-[480px] flex flex-col rounded-xl modal-container bg-bg-2"
    :style="panelInlineStyle"
    :class="panelHeightClass"
  >
    <div class="shrink-0 flex items-center justify-between h-14">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>
    <template v-if="isCryptoOrder">
      <div
        v-show="isUploadNotStarted"
        class="w-full flex-1 min-h-0 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[628px]"
      >
        <div ref="targetRef" class="w-full bg-bg-2 rounded-lg relative">
          <div class="flex items-center p-3 border-b border-[var(--color-input-level-1)]">
            <div class="w-5 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 0C15.5228 0 20 4.47715 20 10C20 10.7096 19.9247 11.4016 19.7842 12.0693H17.7285C17.9048 11.4092 18 10.7157 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C10.7158 18 11.4091 17.9039 12.0693 17.7275V19.7842C11.4016 19.9247 10.7096 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM17.2969 13.1094C18.887 13.2259 19.7255 15.111 18.6846 16.375L18.5381 16.5518L18.6846 16.7285C19.7254 17.9925 18.887 19.8777 17.2969 19.9941L17.1406 20H15.9619L15.8057 19.9941C14.2669 19.8813 13.4322 18.1121 14.3232 16.8525L14.418 16.7285L14.5635 16.5518L14.418 16.375L14.3232 16.251C13.4319 14.9914 14.2668 13.2222 15.8057 13.1094L15.9619 13.1035H17.1406L17.2969 13.1094ZM16.9375 16.9658C16.7375 16.7233 16.365 16.7233 16.165 16.9658L15.5752 17.6816C15.307 18.0078 15.5397 18.4998 15.9619 18.5H17.1406C17.5632 18.5 17.7949 18.0078 17.5264 17.6816L16.9375 16.9658ZM15.9619 14.6035C15.5396 14.6037 15.3067 15.0958 15.5752 15.4219L16.165 16.1377C16.271 16.2664 16.4256 16.3241 16.5771 16.3164L16.2861 16.5342L16.8799 16.416L16.7695 16.2686C16.832 16.2383 16.8899 16.1954 16.9375 16.1377L17.5264 15.4219C17.795 15.0957 17.5632 14.6035 17.1406 14.6035H15.9619ZM10.6484 6.18457C11.6898 6.20885 12.3997 6.38517 12.9521 6.5752L12.4785 7.9082C12.0835 7.76569 11.3418 7.4942 10.2061 7.49414C9.18181 7.49414 8.84879 7.83657 8.84863 8.16699C8.84863 8.54392 9.40182 8.80538 10.7588 9.16992C12.6355 9.66613 13.3771 10.3147 13.3779 11.3896C13.3779 12.4394 12.3996 13.3364 10.5869 13.5605V14.7764H9.02344V13.6553C7.96547 13.6202 6.9406 13.3958 6.34082 13.1475L6.81348 11.7666C7.47612 12.0377 8.40741 12.2861 9.43359 12.2861C10.3491 12.2861 10.9635 12.0155 10.9639 11.5557C10.9639 11.1074 10.4577 10.8227 9.27441 10.5273C7.58736 10.1024 6.43555 9.513 6.43555 8.36816C6.43581 7.31854 7.41305 6.50355 9.10059 6.26758V5.14648H10.6484V6.18457Z"
                  fill="white"
                />
              </svg>
            </div>
            <div class="flex items-center justify-between">
              <p>Please pay within</p>
              <div class="mx-1">
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
              <p>and upload proof</p>
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
              class="py-4 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal"
            >
              Save QR Code
            </button>
            <button
              @click.stop="copyWord(cryptoAddress)"
              class="py-4 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal"
            >
              Copy Address
            </button>
          </div>
        </div>
        <div class="mt-6 px-5 py-3 w-full bg-bg-2 rounded-lg relative grid gap-2">
          <orderDetailRows :rows="cryptoSummaryRows" @copy="copyWord" />
        </div>
        <button
          class="mt-6 w-full py-3 rounded-lg btn-primary text-text-4 text-[14px] font-bold"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof') }}
        </button>
        <button
          class="mt-3 w-full p-3 rounded-lg bg-opacity-10 text-text-2 text-[14px] font-bold"
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
        class="w-full flex-1 min-h-0 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[623px]"
      >
        <div class="w-full bg-bg-2 rounded-tl-lg rounded-tr-lg">
          <div class="flex items-center p-3 border-b border-input-1">
            <div class="w-5 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path d="M4.17969 8.35742H9.25735" stroke="white" stroke-width="1.37174" />
                <path d="M4.03125 11.0449H12.0958" stroke="white" stroke-width="1.37174" />
                <path
                  d="M12.6875 0.888672V4.48949C12.6875 5.05769 13.1481 5.5183 13.7163 5.5183H18.6612"
                  stroke="white"
                  stroke-width="1.37174"
                />
                <path
                  d="M18.8034 11.941L18.6633 5.66855L12.839 0.740234H1.77099C1.2028 0.740234 0.742188 1.20085 0.742188 1.76904V18.2299C0.742188 18.7981 1.2028 19.2588 1.77099 19.2588H10.6048M12.6956 13.5837H18.52L16.5785 16.2719L18.52 18.8107H12.3969L14.0397 16.2719L12.6956 13.5837Z"
                  stroke="white"
                  stroke-width="1.37174"
                />
              </svg>
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
          class="mt-6 w-full h-12 rounded-lg btn-primary text-text-4 text-[14px] font-bold flex items-center justify-center"
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
        class="w-full flex-1 min-h-0 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[506px]"
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
      <div class="w-full p-3 rounded-bl-xl rounded-br-xl bg-bg-1 sm:max-h-[435px]">
        <div class="w-full px-4 pt-8 pb-4 rounded-xl bg-bg-2">
          <div class="w-full flex items-center justify-center">
            <div class="w-4 mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="21"
                viewBox="0 0 17 21"
                fill="none"
              >
                <path
                  d="M8.82422 0C10.932 2.99388e-05 12.5133 0.550949 13.6035 1.65234C14.199 2.24619 14.6243 2.99435 14.8799 3.89551H16.3262V5.59473H15.1494C15.159 5.77347 15.166 5.95635 15.166 6.14355C15.166 6.31833 15.1599 6.48968 15.1514 6.65723H16.3262V8.35645H14.8867C14.6319 9.2665 14.2043 10.0268 13.6035 10.6357C12.5133 11.7371 10.932 12.2881 8.82422 12.2881H4.15625V20.6807H1.19824V8.35645H0V6.65723H1.19824V5.59473H0V3.89551H1.19824V0H8.82422ZM4.15625 8.35645V10.0391C6.0835 9.78415 10.1955 10.7583 11.6729 8.35645H4.15625ZM4.15625 6.65723H12.1914C12.1982 6.58206 12.204 6.50526 12.208 6.42676C12.2421 6.18452 12.2506 5.89975 12.2266 5.59473H4.15625V6.65723ZM4.15625 3.89551H11.6826C11.1229 3.01441 10.069 2.30188 8.20117 2.30176H4.15625V3.89551Z"
                  fill="white"
                />
              </svg>
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
    v-if="uploadPopShow"
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
import CloseIcon from '@/static/svg/close.svg?component'
import cancelOrderPop from './cancelOrderPop.vue'
import orderAmountHeader from './orderAmountHeader.vue'
import orderDetailRows from './orderDetailRows.vue'
import type { DetailRowItem } from './orderDetailRows.vue'
import orderStatusResult from './orderStatusResult.vue'
import uploadProofPop from '../uploadProof/uploadProofPop.vue'
import { CryptOrderType, FiatOrderType, OrderType } from './orderType'

const { t } = useI18n()

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

const panelInlineStyle = computed(() => ({
  height: props.orderInfo.type === 'Crypto' ? '100%' : 'auto'
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
