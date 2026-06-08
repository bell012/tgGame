<template>
  <div>ticketId: {{ ticketId ?? '—' }}</div>
  <div
    class="golden-egg-game relative mx-auto flex flex-col items-center"
    data-game-id="golden_egg"
  >
    <div class="golden-egg-board">
      <div v-for="rowIndex in EGG_ROW_COUNT" :key="rowIndex" class="golden-egg-row">
        <button
          v-for="columnIndex in EGG_COLUMN_COUNT"
          :key="columnIndex"
          type="button"
          class="golden-egg-slot"
          :disabled="activeStage !== 'standby'"
          :aria-label="`砸开第 ${getEggIndex(rowIndex, columnIndex) + 1} 个金蛋`"
          @click="handleSmash(getEggIndex(rowIndex, columnIndex))"
        >
          <div
            :ref="el => setStandbyRef(getEggIndex(rowIndex, columnIndex), el)"
            class="golden-egg-lottie"
            :class="{ 'is-hidden': activeOpeningIndex === getEggIndex(rowIndex, columnIndex) }"
          />
          <div
            :ref="el => setOpenRef(getEggIndex(rowIndex, columnIndex), el)"
            class="golden-egg-lottie"
            :class="{ 'is-hidden': activeOpeningIndex !== getEggIndex(rowIndex, columnIndex) }"
          />
        </button>
        <img class="golden-egg-shelf" :src="baseImage" alt="" draggable="false" />
      </div>
    </div>

    <GoldenEggPop :visible="showPopup" @close="closePopup" @replay="resetGame" />
  </div>
</template>

<script setup lang="ts">
import lottie, { type AnimationItem } from 'lottie-web'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type ComponentPublicInstance
} from 'vue'
import { globalTicketToastState } from '../../shell/ticketToast'
import GoldenEggPop from './golden-egg-pop.vue'
import baseImage from './base.png'
import standbyAnimation from './standby/standby.json'
import openAnimation from './smaso-open/smaso-open.json'

type GoldenEggStage = 'standby' | 'opening'
type TemplateRefValue = Element | ComponentPublicInstance | null
type LottieAsset = {
  p?: string
  u?: string
  [key: string]: unknown
}
type LottieJson = Record<string, unknown> & {
  assets?: LottieAsset[]
}

const EGG_ROW_COUNT = 3
const EGG_COLUMN_COUNT = 3
const EGG_COUNT = EGG_ROW_COUNT * EGG_COLUMN_COUNT

/** 当前选中票券（券种条切换时随 activeTicketRecord 更新） */
const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)

const standbyRefs = ref<(HTMLElement | null)[]>([])
const openRefs = ref<(HTMLElement | null)[]>([])

const activeStage = ref<GoldenEggStage>('standby')
const activeOpeningIndex = ref<number | null>(null)
const showPopup = ref(false)

let standbyPlayers: Array<AnimationItem | null> = []
let openPlayers: Array<AnimationItem | null> = []
let openCompleteHandlers: Array<(() => void) | null> = []

const standbyImages = import.meta.glob('./standby/images/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>
const openImages = import.meta.glob('./smaso-open/images/*.png', {
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

const loadLottie = (
  container: HTMLElement,
  animationData: LottieJson,
  images: Record<string, string>,
  loop: boolean,
  autoplay: boolean
) =>
  lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop,
    autoplay,
    animationData: buildAnimationData(animationData, images),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  })

const destroyPlayer = (player: AnimationItem | null) => {
  player?.destroy()
}

const getEggIndex = (rowIndex: number, columnIndex: number) =>
  (rowIndex - 1) * EGG_COLUMN_COUNT + columnIndex - 1

const getHTMLElement = (el: TemplateRefValue) => (el instanceof HTMLElement ? el : null)

const setStandbyRef = (index: number, el: TemplateRefValue) => {
  standbyRefs.value[index] = getHTMLElement(el)
}

const setOpenRef = (index: number, el: TemplateRefValue) => {
  openRefs.value[index] = getHTMLElement(el)
}

const createStandbyPlayer = (index: number, container: HTMLElement) => {
  destroyPlayer(standbyPlayers[index] ?? null)
  standbyPlayers[index] = loadLottie(container, standbyAnimation, standbyImages, true, true)
}

const createOpenPlayer = (index: number, container: HTMLElement) => {
  const previousPlayer = openPlayers[index] ?? null
  const previousHandler = openCompleteHandlers[index]

  if (previousPlayer && previousHandler) {
    previousPlayer.removeEventListener('complete', previousHandler)
  }

  destroyPlayer(previousPlayer)

  const player = loadLottie(container, openAnimation, openImages, false, false)
  const handleComplete = () => handleOpenComplete(index)
  player.addEventListener('complete', handleComplete)
  openPlayers[index] = player
  openCompleteHandlers[index] = handleComplete
}

const createAllPlayers = async () => {
  await nextTick()

  for (let index = 0; index < EGG_COUNT; index += 1) {
    const standbyContainer = standbyRefs.value[index]
    const openContainer = openRefs.value[index]

    if (standbyContainer) {
      createStandbyPlayer(index, standbyContainer)
    }

    if (openContainer) {
      createOpenPlayer(index, openContainer)
    }
  }
}

const handleSmash = (index: number) => {
  if (activeStage.value !== 'standby') return

  activeStage.value = 'opening'
  activeOpeningIndex.value = index
  standbyPlayers.forEach(player => player?.pause())
  openPlayers[index]?.goToAndPlay(0, true)
}

const handleOpenComplete = (index: number) => {
  if (activeOpeningIndex.value !== index) return
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
}

const resetGame = () => {
  closePopup()
  activeStage.value = 'standby'
  activeOpeningIndex.value = null
  openPlayers.forEach(player => player?.goToAndStop(0, true))
  standbyPlayers.forEach(player => player?.goToAndPlay(0, true))
}

const destroyAllPlayers = () => {
  openPlayers.forEach((player, index) => {
    const handler = openCompleteHandlers[index]
    if (player && handler) {
      player.removeEventListener('complete', handler)
    }
    destroyPlayer(player)
  })
  standbyPlayers.forEach(destroyPlayer)
  openPlayers = []
  standbyPlayers = []
  openCompleteHandlers = []
}

const refreshAnimations = async () => {
  closePopup()
  activeStage.value = 'standby'
  activeOpeningIndex.value = null
  destroyAllPlayers()
  await createAllPlayers()
}

onMounted(() => {
  void createAllPlayers()
})

watch(ticketId, () => {
  void refreshAnimations()
})

onUnmounted(destroyAllPlayers)
</script>

<style scoped lang="scss">
.golden-egg-game {
  width: min(520px, 92vw);
}

.golden-egg-board {
  width: 100%;
  padding: 0 2.5%;
}

.golden-egg-row {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6%;
  min-height: 32%;
  padding: 0 7.5% 4.5%;
}

.golden-egg-row + .golden-egg-row {
  margin-top: 3.2%;
}

.golden-egg-slot {
  position: relative;
  z-index: 2;
  aspect-ratio: 250 / 262;
  cursor: pointer;
  filter: drop-shadow(0 12px 18px rgb(0 0 0 / 28%));
}

.golden-egg-slot:disabled {
  cursor: default;
}

.golden-egg-lottie {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity 0.12s ease;
}

.golden-egg-lottie.is-hidden {
  pointer-events: none;
  opacity: 0;
}

.golden-egg-shelf {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 0;
  width: 100%;
  height: auto;
  pointer-events: none;
  user-select: none;
  transform: translateX(-50%);
}

@media (min-width: 768px) {
  .golden-egg-game {
    width: 520px;
  }
}
</style>
