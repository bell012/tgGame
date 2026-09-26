<template>
  <!-- PC 端视频预览弹窗。 -->
  <div
    v-if="props.displayMode === 'pc'"
    class="fixed inset-0 z-[120] flex items-center justify-center bg-common-0/60"
  >
    <!-- PC 端 836 × 540 视频预览主体。 -->
    <section class="h-[540px] w-[836px] overflow-hidden rounded-[8px] bg-bg-1">
      <!-- PC 端视频标题与关闭操作。 -->
      <header class="relative flex h-[56px] items-center justify-center bg-bg-2">
        <strong class="text-[18px] font-[700] leading-[22px] text-text-1">
          {{ t('chatPublic.videoPreview') }}
        </strong>
        <button
          type="button"
          class="absolute right-4 top-4 flex size-6 items-center justify-center rounded-[4px] bg-common-100/10 text-[20px] leading-none text-text-1"
          :aria-label="t('chatPublic.close')"
          @click="closePreview"
        >
          ×
        </button>
      </header>

      <!-- PC 端视频内容与控制条。 -->
      <div class="relative m-4 h-[452px] overflow-hidden rounded-[8px] bg-common-0">
        <video
          ref="videoRef"
          class="size-full object-contain"
          :src="src"
          playsinline
          preload="metadata"
          @loadedmetadata="syncDuration"
          @timeupdate="syncCurrentTime"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @ended="isPlaying = false"
        ></video>

        <!-- 点击中心按钮播放或暂停视频。 -->
        <button
          type="button"
          class="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-common-0/40 text-[24px] text-text-1"
          :aria-label="isPlaying ? t('chatPublic.pauseVideo') : t('chatPublic.playVideo')"
          @click="togglePlay"
        >
          {{ isPlaying ? 'Ⅱ' : '▶' }}
        </button>

        <!-- PC 端进度、下载和全屏控制区域。 -->
        <div
          class="absolute inset-x-0 bottom-0 h-[82px] bg-gradient-to-t from-common-0/80 to-transparent px-[30px] pt-[20px]"
        >
          <input
            aria-label="Video progress"
            class="h-[6px] w-full accent-common-100"
            type="range"
            min="0"
            :max="duration || 0"
            :value="currentTime"
            @input="seekVideo"
          />
          <div class="mt-3 flex items-center justify-between text-[12px] text-text-1">
            <div class="flex items-center gap-6">
              <button
                type="button"
                :aria-label="isPlaying ? t('chatPublic.pauseVideo') : t('chatPublic.playVideo')"
                @click="togglePlay"
              >
                {{ isPlaying ? 'Ⅱ' : '▶' }}
              </button>
              <span>{{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}</span>
            </div>
            <div class="flex items-center gap-6">
              <button type="button" :aria-label="t('chatPublic.download')" @click="handleDownload">
                <ChatMediaDownload class="size-4 text-text-1" />
              </button>
              <button
                type="button"
                aria-label="Fullscreen"
                class="text-[20px] leading-none"
                @click="openFullscreen"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- H5 端全屏视频播放页。 -->
  <div v-else class="fixed inset-0 z-[120] bg-common-0">
    <!-- H5 端视频画面。 -->
    <video
      ref="videoRef"
      class="absolute inset-x-0 top-[49px] h-[calc(100%-133px)] w-full object-contain"
      :src="src"
      playsinline
      preload="metadata"
      @loadedmetadata="syncDuration"
      @timeupdate="syncCurrentTime"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="isPlaying = false"
    ></video>

    <!-- H5 端中央播放或暂停操作。 -->
    <button
      type="button"
      class="absolute left-1/2 top-1/2 flex size-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-common-0/40 text-[20px] text-text-1"
      :aria-label="isPlaying ? t('chatPublic.pauseVideo') : t('chatPublic.playVideo')"
      @click="togglePlay"
    >
      {{ isPlaying ? 'Ⅱ' : '▶' }}
    </button>

    <!-- H5 端播放进度和底部操作栏。 -->
    <footer
      class="absolute inset-x-0 bottom-0 h-[84px] bg-common-0 px-[22px] pt-[18px] text-text-1"
    >
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="text-[20px] leading-none"
          :aria-label="isPlaying ? t('chatPublic.pauseVideo') : t('chatPublic.playVideo')"
          @click="togglePlay"
        >
          {{ isPlaying ? 'Ⅱ' : '▶' }}
        </button>
        <span class="w-[40px] text-[11px]">{{ formatDuration(currentTime) }}</span>
        <input
          aria-label="Video progress"
          class="h-[4px] min-w-0 flex-1 accent-common-100"
          type="range"
          min="0"
          :max="duration || 0"
          :value="currentTime"
          @input="seekVideo"
        />
        <span class="w-[40px] text-right text-[11px]">{{ formatDuration(duration) }}</span>
      </div>
      <button
        type="button"
        class="absolute bottom-[16px] left-[18px] text-[24px] leading-none"
        :aria-label="t('chatPublic.close')"
        @click="closePreview"
      >
        ×
      </button>
      <button
        type="button"
        class="absolute bottom-[12px] right-[18px] flex size-[30px] items-center justify-center"
        :aria-label="t('chatPublic.download')"
        @click="handleDownload"
      >
        <ChatMediaDownload class="size-[22px] text-text-1" />
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import ChatMediaDownload from '@/static/svg/chat/public/download.svg?component'
import { globalShowToast } from '@/utils/toast'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{ src: string; displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const videoRef = ref<HTMLVideoElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)

/** 将秒数格式化为视频控制条使用的 mm:ss 文案。 */
const formatDuration = (seconds: number) => {
  const normalizedSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${String(Math.floor(normalizedSeconds / 60)).padStart(2, '0')}:${String(
    normalizedSeconds % 60
  ).padStart(2, '0')}`
}

/** 在视频元信息加载后同步总时长。 */
const syncDuration = () => {
  duration.value = videoRef.value?.duration || 0
}

/** 在视频播放期间同步当前进度。 */
const syncCurrentTime = () => {
  currentTime.value = videoRef.value?.currentTime || 0
}

/** 切换视频播放与暂停状态。 */
const togglePlay = async () => {
  const video = videoRef.value
  if (!video) return

  if (video.paused) {
    await video.play().catch(() => undefined)
    return
  }

  video.pause()
}

/** 根据进度条输入跳转到指定播放时间。 */
const seekVideo = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  if (!videoRef.value || !Number.isFinite(value)) return

  videoRef.value.currentTime = value
  currentTime.value = value
}

/** 打开 PC 浏览器全屏模式。 */
const openFullscreen = async () => {
  await videoRef.value?.requestFullscreen?.().catch(() => undefined)
}

/** 下载视频，并在浏览器触发保存后显示统一提示。 */
const handleDownload = async () => {
  //
  globalShowToast({ message: t('chatPublic.videoSaveHint'), type: 'success' })
  // try {
  //   await downloadChatMedia(props.src, 'chat-video')
  //   // globalShowToast({ message: t('chatPublic.mediaDownloadHint'), type: 'success' })
  // } catch (error) {
  //   globalShowToast({
  //     message: error instanceof Error ? error.message : 'Media download failed',
  //     type: 'fail'
  //   })
  // }
}

/** 关闭预览前停止视频，避免返回聊天页面后继续播放音频。 */
const closePreview = () => {
  videoRef.value?.pause()
  emit('close')
}

/** 视频预览打开后自动开始播放，保持用户点击消息后的连续体验。 */
onMounted(() => {
  nextTick(() => void videoRef.value?.play().catch(() => undefined))
})

/** 组件卸载时确保视频播放停止。 */
onBeforeUnmount(() => videoRef.value?.pause())
</script>
