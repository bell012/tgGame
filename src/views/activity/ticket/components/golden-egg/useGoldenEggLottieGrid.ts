import type { BundledLottieJson } from '../../shared/lottieBundled'

import { loadBundledLottie } from '../../shared/lottieBundled'
import type { AnimationItem } from 'lottie-web'
import { nextTick, ref, type ComponentPublicInstance } from 'vue'

type TemplateRefValue = Element | ComponentPublicInstance | null

interface UseGoldenEggLottieGridOptions {
  eggCount: number
  standbyAnimation: BundledLottieJson
  standbyImages: Record<string, string>
  openAnimation: BundledLottieJson
  openImages: Record<string, string>
  onOpenComplete: (index: number) => void
}

const getHTMLElement = (el: TemplateRefValue) => (el instanceof HTMLElement ? el : null)

export const useGoldenEggLottieGrid = ({
  eggCount,
  standbyAnimation,
  standbyImages,
  openAnimation,
  openImages,
  onOpenComplete
}: UseGoldenEggLottieGridOptions) => {
  const standbyRefs = ref<(HTMLElement | null)[]>([])
  const openRefs = ref<(HTMLElement | null)[]>([])

  let standbyPlayers: Array<AnimationItem | null> = []
  let openPlayers: Array<AnimationItem | null> = []
  let openCompleteHandlers: Array<(() => void) | null> = []

  const destroyPlayer = (player: AnimationItem | null) => {
    player?.destroy()
  }

  const setStandbyRef = (index: number, el: TemplateRefValue) => {
    standbyRefs.value[index] = getHTMLElement(el)
  }

  const setOpenRef = (index: number, el: TemplateRefValue) => {
    openRefs.value[index] = getHTMLElement(el)
  }

  const createStandbyPlayer = (index: number, container: HTMLElement) => {
    destroyPlayer(standbyPlayers[index] ?? null)
    standbyPlayers[index] = loadBundledLottie({
      container,
      animationData: standbyAnimation,
      images: standbyImages,
      loop: true,
      autoplay: true
    })
  }

  const createOpenPlayer = (index: number, container: HTMLElement) => {
    const previousPlayer = openPlayers[index] ?? null
    const previousHandler = openCompleteHandlers[index]

    if (previousPlayer && previousHandler) {
      previousPlayer.removeEventListener('complete', previousHandler)
    }

    destroyPlayer(previousPlayer)

    const player = loadBundledLottie({
      container,
      animationData: openAnimation,
      images: openImages,
      loop: false,
      autoplay: false
    })
    const handleComplete = () => onOpenComplete(index)
    player.addEventListener('complete', handleComplete)
    openPlayers[index] = player
    openCompleteHandlers[index] = handleComplete
  }

  const createAllPlayers = async () => {
    await nextTick()

    for (let index = 0; index < eggCount; index += 1) {
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

  const resetPlayers = () => {
    openPlayers.forEach(player => player?.goToAndStop(0, true))
    standbyPlayers.forEach(player => player?.goToAndPlay(0, true))
  }

  const pauseStandbyPlayers = () => {
    standbyPlayers.forEach(player => player?.pause())
  }

  const playOpenPlayer = (index: number) => {
    const openPlayer = openPlayers[index]
    if (!openPlayer) return false
    openPlayer.goToAndPlay(0, true)
    return true
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
    destroyAllPlayers()
    await createAllPlayers()
  }

  return {
    setStandbyRef,
    setOpenRef,
    createAllPlayers,
    refreshAnimations,
    destroyAllPlayers,
    resetPlayers,
    pauseStandbyPlayers,
    playOpenPlayer
  }
}
