import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

const EXPAND_DURATION = 260
const COLLAPSE_DURATION = 220
const EASING = 'cubic-bezier(.22, .61, .36, 1)'
const FULLSCREEN_CLIP = 'inset(0px round 0px)'

type ExpandAnimationOptions = {
  fullscreen: Ref<boolean>
  placeholder: Ref<HTMLElement | null>
  player: Ref<HTMLElement | null>
  onFullscreenChange: (value: boolean) => void
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** 把预览框在视口中的位置，换成全屏容器上的 clip-path inset。预览框滚出屏幕时保留负值，避免收起落点跳动。 */
function clipInset(target: DOMRectReadOnly, frame: DOMRectReadOnly) {
  const top = target.top - frame.top
  const right = frame.right - target.right
  const bottom = frame.bottom - target.bottom
  const left = target.left - frame.left
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 10px 10px 0 0)`
}

function waitForFrame() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve())
  })
}

export function useGameExpandAnimation(options: ExpandAnimationOptions) {
  const displayFullscreen = ref(false)
  let animation: Animation | undefined
  let generation = 0

  const cancelAnimation = () => {
    const current = animation
    animation = undefined
    current?.cancel()
  }

  const clearClip = () => {
    options.player.value?.style.removeProperty('clip-path')
  }

  const canAnimate = () =>
    !prefersReducedMotion() && typeof options.player.value?.animate === 'function'

  const play = async (from: string, to: string, duration: number) => {
    const element = options.player.value
    if (!element || typeof element.animate !== 'function') return false
    cancelAnimation()
    let next: Animation
    try {
      next = element.animate([{ clipPath: from }, { clipPath: to }], {
        duration,
        easing: EASING,
        fill: 'both'
      })
    } catch {
      return false
    }
    animation = next
    try {
      await next.finished
    } catch {
      return false
    }
    return animation === next
  }

  // 收起结束时元素仍是全屏尺寸，clip 也按全屏计算。先切回预览框定位，再清掉 clip，避免露出一帧全屏。
  const releaseCollapsedClip = async (current: number) => {
    if (animation) {
      try {
        animation.commitStyles()
      } catch {
        // 浏览器不支持时，定位切回预览框后本来就会回到目标大小。
      }
      cancelAnimation()
    }
    displayFullscreen.value = false
    await nextTick()
    if (current !== generation) return
    clearClip()
  }

  watch(
    options.fullscreen,
    async value => {
      const current = ++generation
      cancelAnimation()
      clearClip()

      if (!canAnimate()) {
        displayFullscreen.value = value
        options.onFullscreenChange(value)
        return
      }

      if (value) {
        // 父页面会在全屏后隐藏标题栏，起点必须在布局改变前量。
        const origin = options.placeholder.value?.getBoundingClientRect()
        displayFullscreen.value = true
        options.onFullscreenChange(true)
        await nextTick()
        if (current !== generation) return
        const frame = options.player.value?.getBoundingClientRect()
        if (!origin || !frame || origin.width <= 0 || origin.height <= 0) return
        const played = await play(clipInset(origin, frame), FULLSCREEN_CLIP, EXPAND_DURATION)
        if (current !== generation || !played) return
        cancelAnimation()
        clearClip()
        return
      }

      options.onFullscreenChange(false)
      if (!displayFullscreen.value) return
      // 等标题栏和滚动位置恢复后，再量收起的终点。
      await nextTick()
      await waitForFrame()
      if (current !== generation) return
      const frame = options.player.value?.getBoundingClientRect()
      const target = options.placeholder.value?.getBoundingClientRect()
      if (!frame || !target || target.width <= 0 || target.height <= 0) {
        displayFullscreen.value = false
        return
      }
      const played = await play(FULLSCREEN_CLIP, clipInset(target, frame), COLLAPSE_DURATION)
      if (current !== generation) return
      if (!played) {
        displayFullscreen.value = false
        clearClip()
        return
      }
      await releaseCollapsedClip(current)
    },
    { flush: 'sync' }
  )

  onBeforeUnmount(() => {
    generation += 1
    cancelAnimation()
    clearClip()
  })

  return { displayFullscreen }
}
