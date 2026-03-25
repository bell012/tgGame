<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <!-- 二维码弹窗遮罩 -->
      <div
        v-if="visible"
        class="fixed inset-0 z-[1200] bg-mask-60-1 px-[14px] py-[24px]"
        @click.self="handleClose"
      >
        <!-- 二维码弹窗容器 -->
        <div class="mx-auto flex h-full max-w-[300px] items-center justify-center sm:max-w-[360px]">
          <!-- 二维码弹窗卡片 -->
          <div class="relative w-full rounded-[14px] bg-bg-1 px-[20px] pb-[20px] pt-[20px]">
            <!-- 关闭按钮 -->
            <button
              type="button"
              class="absolute right-[14px] top-[14px] flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10"
              @click="handleClose"
              :aria-label="$t('referral.closeDialog')"
            >
              <CloseIcon class="h-[12px] w-[12px] text-text-1" />
            </button>

            <!-- 弹窗内容 -->
            <div class="flex flex-col items-center pt-[8px]">
              <!-- 标题区域 -->
              <div class="w-full">
                <!-- 弹窗标题 -->
                <h2 class="text-[16px] font-[700] leading-[19px] text-text-1">
                  {{ $t('referral.myQrCodeTitle') }}
                </h2>

                <!-- 弹窗描述 -->
                <p class="mt-[14px] text-[14px] font-[400] leading-[17px] text-text-2">
                  {{ $t('referral.myQrCodeDescription') }}
                </p>
              </div>

              <!-- 二维码展示区域 -->
              <div
                class="mt-[30px] flex h-[200px] w-[200px] items-center justify-center rounded-[15px] bg-opacity-5"
              >
                <!-- 大二维码画布 -->
                <canvas
                  ref="qrCodeCanvas"
                  class="h-[170px] w-[170px] rounded-[12px] bg-common-100 p-[8px]"
                ></canvas>
              </div>

              <!-- 保存按钮 -->
              <button
                type="button"
                class="mt-[30px] flex h-[40px] w-full items-center justify-center rounded-[8px] bg-theme-primary"
                @click="handleSaveQrCode"
              >
                <span class="text-[14px] font-[700] leading-[17px] text-text-4">
                  {{ $t('referral.saveQrCode') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { showToast } from 'vant'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import CloseIcon from '@/static/svg/close.svg?component'

const props = defineProps<{
  visible: boolean
  referralLink: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t } = useI18n()

const qrCodeCanvas = ref<HTMLCanvasElement>()
const visibleRef = computed(() => props.visible)

useLockBodyScroll(visibleRef)

// 关闭二维码弹窗。
const handleClose = () => {
  emit('update:visible', false)
}

// 生成大尺寸二维码。
const generateQRCode = async () => {
  if (!qrCodeCanvas.value) return

  try {
    await QRCode.toCanvas(qrCodeCanvas.value, props.referralLink, {
      width: 170,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// 保存二维码图片。
const handleSaveQrCode = () => {
  if (!qrCodeCanvas.value) return

  const link = document.createElement('a')
  link.download = 'referral-qrcode.png'
  link.href = qrCodeCanvas.value.toDataURL('image/png')
  link.click()

  showToast({
    message: t('referral.qrSaved'),
    type: 'success'
  })
}

watch(
  () => props.visible,
  async isVisible => {
    if (!isVisible) return

    await nextTick()
    await generateQRCode()
  },
  { immediate: true }
)
</script>
