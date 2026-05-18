<template>
  <!-- Guide 视频弹窗挂载到 body，遮罩样式保持和推荐文案弹窗一致 -->
  <Teleport to="body">
    <!-- Guide 视频遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-mask-60-1 px-4"
      @click.self="handleClose"
    >
      <!-- Guide 视频播放容器，尺寸保持 H5 播放页规格 -->
      <section
        ref="playerContainerRef"
        class="relative h-[690px] w-[320px] overflow-hidden rounded-[16px] bg-common-0"
        @click.stop
      >
        <!-- Guide 视频主体 -->
        <video
          ref="videoRef"
          class="h-full w-full bg-common-0 object-contain"
          :src="guideVideoSrc"
          playsinline
          preload="metadata"
          @click="togglePlay"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @volumechange="syncMutedState"
        ></video>

        <!-- Guide 视频控制层 -->
        <div class="absolute inset-0">
          <!-- 顶部视频操作按钮组 -->
          <div class="absolute left-[16px] top-[16px] h-[16px] w-[288px]">
            <!-- 左侧视频操作按钮组 -->
            <div class="absolute left-0 top-0 flex h-[16px] w-[44px] items-center gap-[12px]">
              <!-- 全屏按钮 -->
              <button class="h-[16px] w-[16px]" type="button" @click="toggleFullscreen">
                <img :src="videoFullscreenIcon" alt="" class="h-full w-full object-contain" />
              </button>

              <!-- 关闭按钮 -->
              <button class="h-[16px] w-[16px]" type="button" @click="handleClose">
                <img :src="videoBackIcon" alt="" class="h-full w-full object-contain" />
              </button>
            </div>

            <!-- 静音切换按钮 -->
            <button
              class="absolute right-0 top-0 h-[16px] w-[16px]"
              type="button"
              @click="toggleMute"
            >
              <img
                :src="isMuted ? videoVolumeOffIcon : videoVolumeOnIcon"
                alt=""
                class="h-full w-full object-contain"
              />
            </button>
          </div>

          <!-- 中间播放控制按钮组 -->
          <div
            class="absolute left-1/2 top-1/2 flex h-[34px] w-[212.67px] -translate-x-1/2 -translate-y-1/2 flex-row items-center justify-center gap-[60px]"
          >
            <!-- 后退 10 秒按钮 -->
            <button class="relative h-[29.33px] w-[29.33px]" type="button" @click="seekBy(-10)">
              <img :src="videoRewindIcon" alt="" class="h-full w-full object-contain" />
              <span
                class="absolute left-1/2 top-1/2 h-[18.67px] w-[15px] -translate-x-1/2 translate-y-[-7.33px] text-center font-['MiSans'] text-[14px] font-[380] leading-[18.67px] text-common-100"
              >
                10
              </span>
            </button>

            <!-- 播放暂停按钮 -->
            <button class="relative h-[34px] w-[34px]" type="button" @click="togglePlay">
              <img
                :src="isPlaying ? videoPauseIcon : videoPlayIcon"
                alt=""
                class="absolute left-1/2 top-1/2 h-[33.94px] -translate-x-1/2 -translate-y-1/2 object-contain"
                :class="isPlaying ? 'w-[33.94px]' : 'w-[27.41px]'"
              />
            </button>

            <!-- 前进 10 秒按钮 -->
            <button class="relative h-[29.33px] w-[29.33px]" type="button" @click="seekBy(10)">
              <img :src="videoForwardIcon" alt="" class="h-full w-full object-contain" />
              <span
                class="absolute left-1/2 top-1/2 h-[18.67px] w-[15px] -translate-x-1/2 translate-y-[-7.33px] text-center font-['MiSans'] text-[14px] font-[380] leading-[18.67px] text-common-100"
              >
                10
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import videoBackIcon from '@/static/img/videos/video-back.png'
import videoForwardIcon from '@/static/img/videos/video-forward-10.png'
import videoFullscreenIcon from '@/static/img/videos/video-fullscreen.png'
import videoPauseIcon from '@/static/img/videos/video-pause.png'
import videoPlayIcon from '@/static/img/videos/video-play.png'
import videoRewindIcon from '@/static/img/videos/video-rewind-10.png'
import videoVolumeOffIcon from '@/static/img/videos/video-volume-off.png'
import videoVolumeOnIcon from '@/static/img/videos/video-volume-on.png'
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const playerContainerRef = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const guideVideoSrc = '/guide/videos/guide-home-intro.mp4'

watch(
  () => props.modelValue,
  visible => {
    if (visible) {
      isPlaying.value = false
      isMuted.value = false
      return
    }

    videoRef.value?.pause()
  }
)

/**
 * 关闭 Guide 视频弹窗。
 */
function handleClose() {
  emit('update:modelValue', false)
}

/**
 * 切换播放状态。
 */
async function togglePlay() {
  const video = videoRef.value

  if (!video) {
    return
  }

  if (video.paused) {
    await video.play().catch(() => undefined)
    return
  }

  video.pause()
}

/**
 * 按秒数调整播放进度。
 */
function seekBy(seconds: number) {
  const video = videoRef.value

  if (!video) {
    return
  }

  const duration = Number.isFinite(video.duration) ? video.duration : 0
  video.currentTime = Math.min(
    Math.max(video.currentTime + seconds, 0),
    duration || video.currentTime
  )
}

/**
 * 切换静音状态。
 */
function toggleMute() {
  const video = videoRef.value

  if (!video) {
    return
  }

  video.muted = !video.muted
  isMuted.value = video.muted
}

/**
 * 同步视频静音状态。
 */
function syncMutedState() {
  isMuted.value = Boolean(videoRef.value?.muted)
}

/**
 * 切换全屏播放。
 */
async function toggleFullscreen() {
  const container = playerContainerRef.value

  if (!container) {
    return
  }

  if (document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }

  await container.requestFullscreen()
}
</script>
