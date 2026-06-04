<template>
  <transition name="golden-egg-popup">
    <div v-if="props.visible" class="golden-egg-popup">
      <div ref="popupRef" class="golden-egg-popup__animation" />
      <button
        type="button"
        class="golden-egg-popup__close"
        aria-label="Close golden egg popup"
        @click="emit('close')"
      >
        ×
      </button>
      <button type="button" class="golden-egg-popup__replay" @click="emit('replay')">
        再砸一次
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import lottie, { type AnimationItem } from 'lottie-web'
import { nextTick, onUnmounted, ref, watch } from 'vue'
import popupAnimation from './pop-up/pop-up.json'

type LottieAsset = {
  p?: string
  u?: string
  [key: string]: unknown
}
type LottieJson = Record<string, unknown> & {
  assets?: LottieAsset[]
}

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  replay: []
}>()

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

watch(
  () => props.visible,
  nextVisible => {
    if (nextVisible) {
      void createPopupPlayer()
      return
    }
    destroyPopupPlayer()
  }
)

onUnmounted(() => {
  destroyPopupPlayer()
})
</script>

<style scoped lang="scss">
.golden-egg-popup {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 55%);
}

.golden-egg-popup__animation {
  width: min(692px, 96vw);
  aspect-ratio: 1;
  pointer-events: none;
}

.golden-egg-popup__close {
  position: fixed;
  right: max(20px, calc((100vw - min(692px, 96vw)) / 2 + 18px));
  top: max(20px, calc((100vh - min(692px, 96vw)) / 2 + 18px));
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(0 0 0 / 42%);
  color: #fff8d6;
  font-size: 24px;
  line-height: 1;
}

.golden-egg-popup__replay {
  position: fixed;
  left: 50%;
  bottom: max(32px, calc((100vh - min(692px, 96vw)) / 2 + 34px));
  min-width: 108px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff2a8 0%, #ffb829 100%);
  box-shadow: 0 8px 18px rgb(255 184 41 / 28%);
  color: #7c3300;
  font-size: 14px;
  font-weight: 800;
  line-height: 36px;
  text-align: center;
  transform: translateX(-50%);
}

.golden-egg-popup-enter-active,
.golden-egg-popup-leave-active {
  transition: opacity 0.2s ease;
}

.golden-egg-popup-enter-from,
.golden-egg-popup-leave-to {
  opacity: 0;
}
</style>
