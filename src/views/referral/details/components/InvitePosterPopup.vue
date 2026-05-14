<template>
  <!-- 弹窗挂载到 body -->
  <Teleport to="body">
    <!-- 弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-mask-60-1 px-[20px]"
      @click.self="handleClose"
    >
      <!-- 弹窗内容容器 -->
      <div
        class="flex w-[300px] flex-col gap-[20px]"
        style="font-family: Inter, avertastd, sans-serif"
      >
        <!-- 海报轮播区域 -->
        <div class="flex flex-col items-center gap-[10px]">
          <!-- 海报图片容器 -->
          <div class="relative h-[340px] w-[300px] overflow-hidden rounded-[20px] bg-bg-2">
            <!-- 轮播轨道 -->
            <div
              class="flex h-full transition-transform duration-300 ease-out"
              :style="sliderStyle"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <!-- 海报图片项 -->
              <div
                v-for="(image, index) in props.images"
                :key="`${image}-${index}`"
                class="relative h-full w-full shrink-0"
              >
                <!-- 后台返回的海报图片 -->
                <img class="h-full w-full object-cover" :src="image" :alt="props.imageAlt" />

                <!-- 邀请码信息区域 -->
                <div class="absolute left-[20px] top-[141.33px] flex w-[260px] flex-col gap-[5px]">
                  <!-- 邀请码标题 -->
                  <div class="h-[17px] text-[14px] leading-[17px] text-white">邀请码</div>

                  <!-- 邀请码展示框 -->
                  <div
                    class="relative h-[40px] w-[260px] rounded-[10px] border border-white bg-black/20 backdrop-blur-[1.67px]"
                  >
                    <!-- 邀请码文本 -->
                    <div
                      class="absolute left-[14px] top-1/2 -translate-y-1/2 text-[16px] font-bold leading-[19px] text-white"
                    >
                      {{ props.inviteCode || '-' }}
                    </div>
                  </div>
                </div>

                <!-- 二维码区域 -->
                <div
                  class="absolute left-[20px] top-[230px] flex h-[90px] w-[90px] items-center justify-center rounded-[10px] bg-white"
                >
                  <!-- 二维码图片 -->
                  <img
                    v-if="qrCodeUrl"
                    :src="qrCodeUrl"
                    class="h-[83.38px] w-[83.38px] rounded-[10px] object-contain"
                    alt="QR Code"
                  />
                </div>
              </div>
            </div>

            <!-- 关闭按钮 -->
            <button
              type="button"
              class="absolute right-[14px] top-[14px] flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10"
              :aria-label="props.closeText"
              @click="handleClose"
            >
              <!-- 关闭图标 -->
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </div>

          <!-- 轮播指示器 -->
          <div v-if="shouldShowIndicator" class="flex h-[5px] items-center gap-[4px]">
            <!-- 轮播指示器项 -->
            <button
              v-for="(_, index) in props.images"
              :key="index"
              type="button"
              class="relative h-[5px] overflow-hidden rounded-full bg-opacity-30 transition-all duration-300"
              :class="activeIndex === index ? 'w-[40px]' : 'w-[5px]'"
              @click="handleChangePoster(index)"
            >
              <!-- 当前激活进度条 -->
              <span
                v-if="activeIndex === index"
                class="absolute left-0 top-0 h-full rounded-full bg-theme-primary"
                :style="{ width: `${activeProgress}%` }"
              ></span>
            </button>
          </div>
        </div>

        <!-- 弹窗按钮区域 -->
        <div class="flex flex-col gap-[14px]">
          <!-- 保存图片按钮 -->
          <button
            type="button"
            class="h-[40px] w-full rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4"
            @click="handleSaveImage"
          >
            {{ props.saveText }}
          </button>

          <!-- 次级按钮组 -->
          <div class="flex gap-[14px]">
            <!-- 复制链接按钮 -->
            <button
              type="button"
              class="h-[40px] flex-1 rounded-[8px] border border-theme-primary bg-theme-3 text-[14px] font-[700] leading-[17px] text-theme-primary"
              @click="handleCopyLink"
            >
              {{ props.copyLinkText }}
            </button>

            <!-- 邀请按钮 -->
            <button
              type="button"
              class="h-[40px] flex-1 rounded-[8px] border border-theme-primary bg-theme-3 text-[14px] font-[700] leading-[17px] text-theme-primary"
              @click="handleInviteNow"
            >
              {{ props.inviteText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import QRCode from 'qrcode'
import CloseIcon from '@/static/svg/close.svg?component'

interface Props {
  modelValue: boolean
  images: string[]
  saveText: string
  copyLinkText: string
  inviteText: string
  closeText: string
  imageAlt: string
  inviteCode?: string
  shareLink?: string
  initialIndex?: number
  autoplay?: boolean
  autoplayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
  autoplay: true,
  autoplayInterval: 3000
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [imageUrl: string]
  invite: [imageUrl: string]
  'copy-link': [imageUrl: string]
}>()

const activeIndex = ref(0)
const activeProgress = ref(0)
const touchStartX = ref(0)
const touchMoveX = ref(0)
const qrCodeUrl = ref('')

let autoplayTimer: number | undefined
let progressTimer: number | undefined

/**
 * 获取当前展示的海报图片。
 */
const currentImage = computed(() => props.images[activeIndex.value] || '')

/**
 * 判断是否展示轮播指示器。
 */
const shouldShowIndicator = computed(() => props.images.length > 1)

/**
 * 计算轮播轨道位移样式。
 */
const sliderStyle = computed(() => ({
  transform: `translateX(-${activeIndex.value * 100}%)`
}))

watch(
  () => props.modelValue,
  visible => {
    if (visible) {
      activeIndex.value = normalizeIndex(props.initialIndex)
      startAutoplay()
      return
    }

    stopAutoplay()
  },
  {
    immediate: true
  }
)

watch(
  () => props.images,
  () => {
    activeIndex.value = normalizeIndex(activeIndex.value)
    restartAutoplay()
  },
  {
    deep: true
  }
)

watch(
  () => [props.modelValue, props.shareLink] as const,
  ([visible, shareLink]) => {
    if (!visible) {
      qrCodeUrl.value = ''
      return
    }

    void generateQrCode(shareLink)
  },
  {
    immediate: true
  }
)

onBeforeUnmount(() => {
  stopAutoplay()
})

/**
 * 处理索引边界。
 */
function normalizeIndex(index: number) {
  if (props.images.length === 0) return 0

  if (index < 0) return 0

  if (index > props.images.length - 1) {
    return props.images.length - 1
  }

  return index
}

/**
 * 处理开始自动轮播。
 */
function startAutoplay() {
  stopAutoplay()

  if (!props.autoplay) return

  if (props.images.length <= 1) return

  activeProgress.value = 0

  const progressStep = 100 / (props.autoplayInterval / 100)

  progressTimer = window.setInterval(() => {
    activeProgress.value += progressStep

    if (activeProgress.value >= 100) {
      activeProgress.value = 100
    }
  }, 100)

  autoplayTimer = window.setInterval(() => {
    handleNextPoster()
    activeProgress.value = 0
  }, props.autoplayInterval)
}

/**
 * 处理停止自动轮播。
 */
function stopAutoplay() {
  if (autoplayTimer) {
    window.clearInterval(autoplayTimer)
    autoplayTimer = undefined
  }

  if (progressTimer) {
    window.clearInterval(progressTimer)
    progressTimer = undefined
  }

  activeProgress.value = 0
}

/**
 * 处理重启自动轮播。
 */
function restartAutoplay() {
  if (!props.modelValue) return

  startAutoplay()
}

/**
 * 生成当前分享链接对应的二维码图片。
 */
async function generateQrCode(shareLink?: string) {
  const normalizedShareLink = String(shareLink ?? '').trim()

  if (!normalizedShareLink) {
    qrCodeUrl.value = ''
    return
  }

  try {
    qrCodeUrl.value = await QRCode.toDataURL(normalizedShareLink, {
      width: 250,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('[referral] generate poster qrcode failed:', error)
    qrCodeUrl.value = ''
  }
}

/**
 * 处理关闭弹窗。
 */
function handleClose() {
  emit('update:modelValue', false)
}

/**
 * 处理切换指定海报。
 */
function handleChangePoster(index: number) {
  activeIndex.value = normalizeIndex(index)
  restartAutoplay()
}

/**
 * 处理上一张海报。
 */
function handlePrevPoster() {
  if (props.images.length <= 1) return

  if (activeIndex.value <= 0) {
    activeIndex.value = props.images.length - 1
    return
  }

  activeIndex.value -= 1
}

/**
 * 处理下一张海报。
 */
function handleNextPoster() {
  if (props.images.length <= 1) return

  if (activeIndex.value >= props.images.length - 1) {
    activeIndex.value = 0
    return
  }

  activeIndex.value += 1
}

/**
 * 处理触摸开始。
 */
function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0]?.clientX ?? 0
  touchMoveX.value = touchStartX.value

  stopAutoplay()
}

/**
 * 处理触摸移动。
 */
function handleTouchMove(event: TouchEvent) {
  touchMoveX.value = event.touches[0]?.clientX ?? touchStartX.value
}

/**
 * 处理触摸结束。
 */
function handleTouchEnd() {
  const diffX = touchMoveX.value - touchStartX.value

  if (Math.abs(diffX) < 40) {
    restartAutoplay()
    return
  }

  if (diffX < 0) {
    handleNextPoster()
  } else {
    handlePrevPoster()
  }

  restartAutoplay()
}

/**
 * 处理保存图片。
 */
function handleSaveImage() {
  if (!currentImage.value) return

  emit('save', currentImage.value)
}

/**
 * 处理复制链接。
 */
function handleCopyLink() {
  if (!currentImage.value) return

  emit('copy-link', currentImage.value)
}

/**
 * 处理立即邀请。
 */
function handleInviteNow() {
  if (!currentImage.value) return

  emit('invite', currentImage.value)
}
</script>
