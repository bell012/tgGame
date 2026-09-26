<template>
  <div
    ref="rootRef"
    class="relative h-full w-full"
    @mouseenter="onPointerEnter"
    @mouseleave="onPointerLeave"
    @click="onPlayerClick"
  >
    <video
      ref="videoRef"
      class="h-full w-full bg-black object-contain"
      playsinline
      autoplay
      data-testid="live-player"
      @play="playing = true"
      @pause="onPause"
      @timeupdate="syncBehind"
    />
    <div
      class="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/50 px-2 py-1 text-white transition-opacity duration-200"
      :class="controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'"
      data-testid="live-controls"
      :data-visible="controlsVisible"
    >
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center"
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="togglePlay"
      >
        <svg v-if="playing" viewBox="0 0 16 16" class="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <rect x="3" y="2" width="3.5" height="12" rx="0.5" />
          <rect x="9.5" y="2" width="3.5" height="12" rx="0.5" />
        </svg>
        <svg v-else viewBox="0 0 16 16" class="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M4 2.5v11l10-5.5-10-5.5z" />
        </svg>
      </button>
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center"
        :aria-label="muted ? 'Unmute' : 'Mute'"
        @click="toggleMute"
      >
        <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M2 6h2.5L8 3.2v9.6L4.5 10H2V6z" />
          <path
            v-if="!muted"
            d="M10 5.2a3.2 3.2 0 0 1 0 5.6M11.6 3.4a5.6 5.6 0 0 1 0 9.2"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
          />
          <path
            v-else
            d="M10.2 6.2l3.6 3.6M13.8 6.2l-3.6 3.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
          />
        </svg>
      </button>
      <button
        v-if="behindLive"
        type="button"
        class="ml-auto rounded bg-white px-1.5 text-[10px] font-bold leading-none text-black"
        data-testid="live-badge"
        data-behind="true"
        @click="returnToLive"
      >
        {{ t('sports.backToLive') }}
      </button>
      <span
        v-else
        class="ml-auto px-1.5 text-[10px] font-bold leading-none"
        data-testid="live-badge"
        data-behind="false"
      >
        LIVE
      </span>
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center"
        aria-label="Fullscreen"
        @click="toggleFullscreen"
      >
        <svg
          viewBox="0 0 16 16"
          class="h-3.5 w-3.5 fill-none stroke-current"
          stroke-width="1.2"
          aria-hidden="true"
        >
          <path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Hls from 'hls.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const LIVE_LAG_SECONDS = 15
const CONTROLS_HIDE_MS = 3000

const props = defineProps<{
  src: string
}>()

const { t } = useI18n()
const rootRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const controlsVisible = ref(false)
const isLive = ref(false)
const behindLive = ref(false)
let hls: Hls | null = null
let joinedLive = false
let userPaused = false
let hideTimer: ReturnType<typeof setTimeout> | null = null

const hoverCapable = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

const clearHideTimer = () => {
  if (hideTimer == null) return
  clearTimeout(hideTimer)
  hideTimer = null
}

const scheduleHide = () => {
  clearHideTimer()
  hideTimer = setTimeout(() => {
    controlsVisible.value = false
    hideTimer = null
  }, CONTROLS_HIDE_MS)
}

const onPointerEnter = () => {
  if (!hoverCapable()) return
  clearHideTimer()
  controlsVisible.value = true
}

const onPointerLeave = () => {
  if (!hoverCapable()) return
  clearHideTimer()
  controlsVisible.value = false
}

const onPlayerClick = () => {
  if (hoverCapable()) return
  controlsVisible.value = true
  scheduleHide()
}

const resumeIfPaused = () => {
  if (videoRef.value?.paused) play()
}

const destroy = () => {
  hls?.destroy()
  hls = null
  joinedLive = false
  isLive.value = false
  behindLive.value = false
  const video = videoRef.value
  if (!video) return
  video.removeEventListener('canplay', resumeIfPaused)
  video.removeAttribute('src')
  video.load()
}

const play = () => {
  const video = videoRef.value
  if (!video || userPaused) return
  video.muted = muted.value
  video.play().catch((error: unknown) => {
    if (userPaused || muted.value) return
    if (!(error instanceof DOMException) || error.name !== 'NotAllowedError') return
    video.muted = true
    muted.value = true
    video.play().catch(() => {})
  })
}

const liveEdge = () => {
  if (hls?.liveSyncPosition != null) return hls.liveSyncPosition
  const video = videoRef.value
  if (!isLive.value || !video?.seekable.length) return null
  const end = video.seekable.end(video.seekable.length - 1)
  return Number.isFinite(end) ? end : null
}

const seekToLiveEdge = () => {
  const video = videoRef.value
  const edge = liveEdge()
  if (!video || edge == null) return
  video.currentTime = edge
}

const syncBehind = () => {
  const video = videoRef.value
  const edge = liveEdge()
  if (!isLive.value || edge == null || !video) {
    behindLive.value = false
    return
  }
  behindLive.value = edge - video.currentTime > LIVE_LAG_SECONDS
}

const joinLive = (live: boolean) => {
  isLive.value = live
  if (!live || joinedLive) return
  seekToLiveEdge()
  joinedLive = true
  play()
}

const load = (src: string) => {
  destroy()
  userPaused = false
  const video = videoRef.value
  if (!video || !src) return
  video.addEventListener('canplay', resumeIfPaused)

  if (Hls.isSupported()) {
    hls = new Hls({
      startPosition: -1,
      liveDurationInfinity: true
    })
    hls.on(Hls.Events.MANIFEST_PARSED, play)
    hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
      joinLive(data.details.live)
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls?.recoverMediaError()
        return
      }
      if (data.type !== Hls.ErrorTypes.NETWORK_ERROR) destroy()
    })
    hls.loadSource(src)
    hls.attachMedia(video)
    return
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src
    video.addEventListener(
      'loadedmetadata',
      () => {
        joinLive(!Number.isFinite(video.duration))
        play()
      },
      { once: true }
    )
  }
}

const togglePlay = () => {
  const video = videoRef.value
  if (!video) return
  if (video.paused) {
    userPaused = false
    play()
    return
  }
  userPaused = true
  video.pause()
}

const onPause = () => {
  playing.value = false
  syncBehind()
}

const toggleMute = () => {
  const video = videoRef.value
  if (!video) return
  video.muted = !video.muted
  muted.value = video.muted
}

const returnToLive = () => {
  if (!behindLive.value) return
  seekToLiveEdge()
  play()
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
    return
  }
  rootRef.value?.requestFullscreen().catch(() => {})
}

watch(
  () => props.src,
  src => load(src)
)

onMounted(() => load(props.src))

onBeforeUnmount(() => {
  clearHideTimer()
  destroy()
})
</script>
