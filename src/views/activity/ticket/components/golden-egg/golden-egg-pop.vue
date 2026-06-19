<template>
  <div ref="popupRef" class="golden-egg-popup-animation" />
</template>

<script setup lang="ts">
import lottie, { type AnimationItem } from 'lottie-web'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import popupAnimation from './pop-up/pop-up.json'

type LottieAsset = {
  p?: string
  u?: string
  [key: string]: unknown
}
type LottieJson = Record<string, unknown> & {
  assets?: LottieAsset[]
}

const popupRef = ref<HTMLElement | null>(null)
let popupPlayer: AnimationItem | null = null

const popupImages = import.meta.glob('./pop-up/images/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const cloneAnimationData = (data: LottieJson) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(data)
  }
  return JSON.parse(JSON.stringify(data)) as LottieJson
}

const getImageUrlByFileName = (images: Record<string, string>) =>
  new Map(Object.entries(images).map(([path, url]) => [path.split('/').pop(), url]))

const buildAnimationData = (data: LottieJson, images: Record<string, string>) => {
  const cloned = cloneAnimationData(data)
  const imageUrlByFileName = getImageUrlByFileName(images)

  cloned.assets?.forEach(asset => {
    if (!asset.p) return
    const imageUrl = imageUrlByFileName.get(asset.p)
    if (!imageUrl) return
    asset.u = ''
    asset.p = imageUrl
  })

  return cloned
}

const destroyPopupPlayer = () => {
  popupPlayer?.destroy()
  popupPlayer = null
}

const createPopupPlayer = async () => {
  await nextTick()
  if (!popupRef.value) return
  destroyPopupPlayer()
  popupPlayer = lottie.loadAnimation({
    container: popupRef.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: buildAnimationData(popupAnimation, popupImages),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  })
}

onMounted(() => {
  void createPopupPlayer()
})

onUnmounted(() => {
  destroyPopupPlayer()
})
</script>

<style scoped lang="scss">
.golden-egg-popup-animation {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  pointer-events: none;
}
</style>
