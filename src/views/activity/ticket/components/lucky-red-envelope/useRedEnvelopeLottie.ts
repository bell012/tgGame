import lottie, { type AnimationItem } from 'lottie-web'
import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'

export type RedEnvelopePhase = 'intro' | 'idle' | 'opening' | 'opened'

interface UseRedEnvelopeLottieOptions {
  introContainer: Ref<HTMLElement | null>
  idleContainer: Ref<HTMLElement | null>
  openContainer: Ref<HTMLElement | null>
  introPath: string
  idlePath: string
  openPath: string
}

const createPlayer = (container: HTMLElement, path: string, loop: boolean, autoplay: boolean) =>
  lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop,
    autoplay,
    path,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  })

export function useRedEnvelopeLottie(options: UseRedEnvelopeLottieOptions) {
  const phase = ref<RedEnvelopePhase>('intro')

  let introPlayer: AnimationItem | null = null
  let idlePlayer: AnimationItem | null = null
  let openPlayer: AnimationItem | null = null

  const handleIntroComplete = () => {
    phase.value = 'idle'
    idlePlayer?.goToAndPlay(0, true)
  }

  const handleOpenComplete = () => {
    phase.value = 'opened'
  }

  const destroyPlayers = () => {
    introPlayer?.removeEventListener('complete', handleIntroComplete)
    openPlayer?.removeEventListener('complete', handleOpenComplete)
    introPlayer?.destroy()
    idlePlayer?.destroy()
    openPlayer?.destroy()
    introPlayer = null
    idlePlayer = null
    openPlayer = null
  }

  const createPlayers = async () => {
    await nextTick()
    const introContainer = options.introContainer.value
    const idleContainer = options.idleContainer.value
    const openContainer = options.openContainer.value

    if (!introContainer || !idleContainer || !openContainer) {
      return
    }

    destroyPlayers()

    introPlayer = createPlayer(introContainer, options.introPath, false, false)
    idlePlayer = createPlayer(idleContainer, options.idlePath, true, false)
    openPlayer = createPlayer(openContainer, options.openPath, false, false)
    introPlayer.addEventListener('complete', handleIntroComplete)
    openPlayer.addEventListener('complete', handleOpenComplete)
    phase.value = 'intro'
    introPlayer.goToAndPlay(0, true)
  }

  const reset = () => {
    phase.value = 'intro'
    idlePlayer?.stop()
    openPlayer?.goToAndStop(0, true)
    introPlayer?.goToAndPlay(0, true)
  }

  const playOpen = () => {
    if (phase.value !== 'idle') {
      return false
    }

    phase.value = 'opening'
    idlePlayer?.pause()
    openPlayer?.goToAndPlay(0, true)
    return true
  }

  onBeforeUnmount(destroyPlayers)

  return {
    phase,
    createPlayers,
    reset,
    playOpen
  }
}
