<template>
  <div
    class="relative w-full max-w-[480px] h-full sm:max-h-[684px] rounded-xl modal-container bg-bg-2"
  >
    <div class="flex items-center justify-between h-14">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 w-8 h-8 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>
    <div
      class="w-full h-full flex-1 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[628px]"
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
        <div class="pt-3 flex items-end justify-center">
          <p class="text-text-1 text-[40px] font-bold leading-none capitalize">
            {{ orderInfo.amount }}
          </p>
          <p class="text-text-1 text-lg font-bold leading-none capitalize">
            {{ orderInfo.method }}
          </p>
        </div>
        <div class="pt-1 px-3 text-base font-normal leading-none w-full text-center">
          {{ orderInfo.rate }}
        </div>
        <div class="w-full mt-6 flex justify-center">
          <canvas class="w-[153px]" ref="canvasRef" />
        </div>
        <div
          class="w-full mt-4 px-3 text-theme-primary text-2xl font-bold leading-none capitalize text-center"
        >
          {{ orderInfo.network }}
        </div>
        <div class="w-full p-3 mt-1.5">
          <div class="w-full p-4 rounded-lg bg-bg-4 text-text-1 text-base break-all leading-normal">
            {{ orderInfo.address_token }}
          </div>
        </div>
        <div class="p-3 grid grid-cols-2 gap-2">
          <button
            @click.stop="doCapture"
            class="py-4 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal"
          >
            Save QR Code
          </button>
          <button
            @click.stop="copyWord(orderInfo.address_token)"
            class="py-4 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal"
          >
            Copy Address
          </button>
        </div>
      </div>
      <div class="mt-6 px-5 py-3 w-full bg-bg-2 rounded-lg relative grid grid-rows-4 gap-2">
        <div class="flex items-center justify-between">
          <p class="text-text-3 text-base">Network</p>
          <div class="text-text-1 text-base">{{ orderInfo.network }}</div>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-text-3 text-base">Order No.</p>
          <div class="text-text-1 text-base flex items-center">
            {{ orderInfo.order_no }}
            <div class="ml-3 w-[18px]" @click.stop="copyWord(orderInfo.order_no)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M17 3C18.933 3 20.5 4.567 20.5 6.5V14L20.4951 14.1797C20.4046 15.9697 18.9697 17.4046 17.1797 17.4951L17 17.5H16.5L16.4951 17.6797C16.4016 19.5292 14.8727 21 13 21H7.5C5.567 21 4 19.433 4 17.5V10C4 8.067 5.567 6.5 7.5 6.5H8C8 4.567 9.567 3 11.5 3H17ZM11.5 4.5C10.3954 4.5 9.5 5.39543 9.5 6.5H13C14.933 6.5 16.5 8.067 16.5 10V16H17C18.1046 16 19 15.1046 19 14V6.5C19 5.39543 18.1046 4.5 17 4.5H11.5Z"
                  fill="#B3BEC1"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-text-3 text-base">Created At</p>
          <div class="text-text-1 text-base">{{ orderInfo.created_at }}</div>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-text-3 text-base">Deposit Method</p>
          <div class="text-text-1 text-base flex items-center">
            <img class="w-5 aspect-square mr-1" :src="orderInfo.method_icon" />
            {{ orderInfo.method }}
          </div>
        </div>
      </div>
      <button
        class="mt-6 py-4 w-full rounded-lg btn-primary text-text-4 text-[14px] font-bold"
        @click.stop="openUploadPop"
      >
        Upload Proof
      </button>
      <button
        class="mt-3 py-4 w-full rounded-lg bg-opacity-10 text-text-2 text-[14px] font-bold"
        @click.stop="doCancelOrder"
      >
        Cancel Order
      </button>
      <div class="mt-3 w-full text-center text-secondary-7 text-[14px] leading-normal">
        Please cancel the order if you do not plan to pay. Repeated unpaid orders may result in
        account restrictions.
      </div>
    </div>
  </div>

  <cancelOrderPop v-if="cancelOrderPopShow" v-model="cancelOrderPopShow" />
</template>
<script setup lang="ts">
import { CountDown, showToast } from 'vant'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import cancelOrderPop from './cancelOrderPop.vue'

const { t } = useI18n()

interface Props {
  orderInfo: {
    order_no: string
    created_at: string
    amount: number
    method: string
    method_icon: string
    rate: string
    network: string
    address_token: string
  }
}
const props = defineProps<Props>()
const emit = defineEmits(['close', 'hidden'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const targetRef = ref<HTMLElement | null>(null)
const countdownTime = ref(15 * 60 * 1000)
const cancelOrderPopShow = ref<boolean>(false)
const uploadPopShow = ref<boolean>(false)

const handleClose = () => {
  emit('close')
}

const openUploadPop = () => {
  emit('hidden')
  uploadPopShow.value = true
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
      message: t('locales.betDetails.copy'),
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
    message: t('locales.betDetails.copy'),
    type: 'success'
  })
}

onMounted(() => {
  if (canvasRef.value) {
    QRCode.toCanvas(canvasRef.value, props.orderInfo.address_token, {
      width: 153,
      margin: 2
    })
  }
})
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
</style>
