<template>
  <video
    ref="videoRef"
    class="h-full w-full bg-black object-contain"
    muted
    playsinline
    controls
    autoplay
    data-testid="live-player"
  />
</template>

<script setup lang="ts">
import Hls from 'hls.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  src: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
let hls: Hls | null = null

const destroy = () => {
  hls?.destroy()
  hls = null
  const video = videoRef.value
  if (video) {
    video.removeAttribute('src')
    video.load()
  }
}

const play = () => {
  videoRef.value?.play().catch(() => {})
}

const load = (src: string) => {
  destroy()
  const video = videoRef.value
  if (!video || !src) return

  if (Hls.isSupported()) {
    hls = new Hls()
    hls.on(Hls.Events.MANIFEST_PARSED, play)
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
    play()
  }
}

watch(
  () => props.src,
  src => load(src)
)

onMounted(() => load(props.src))

onBeforeUnmount(destroy)
</script>
