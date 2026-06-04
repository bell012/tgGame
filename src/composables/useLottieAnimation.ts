import lottie, { type AnimationItem } from 'lottie-web'
import { onBeforeUnmount, ref, shallowRef, unref, watch, type MaybeRef, type Ref } from 'vue'

export interface UseLottieAnimationOptions {
  container: Ref<HTMLElement | null>
  path: MaybeRef<string | undefined>
  loop?: MaybeRef<boolean>
  autoplay?: MaybeRef<boolean>
  onFailed?: () => void
}

function resolveRef<T>(value: MaybeRef<T>): T {
  return unref(value)
}

export function useLottieAnimation(options: UseLottieAnimationOptions) {
  const animation = shallowRef<AnimationItem | null>(null)
  const failed = ref(false)

  const destroy = () => {
    animation.value?.destroy()
    animation.value = null
  }

  const load = () => {
    const el = options.container.value
    const path = resolveRef(options.path)
    if (!el || !path) return

    destroy()

    try {
      const instance = lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: resolveRef(options.loop ?? true),
        autoplay: resolveRef(options.autoplay ?? true),
        path,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
      })

      instance.addEventListener('data_failed', () => {
        failed.value = true
        destroy()
        options.onFailed?.()
      })

      animation.value = instance
    } catch {
      failed.value = true
      options.onFailed?.()
    }
  }

  const restart = () => {
    if (!animation.value) return
    animation.value.goToAndPlay(0, true)
  }

  const pause = () => {
    animation.value?.pause()
  }

  watch(
    () => options.container.value,
    el => {
      if (el && !failed.value) load()
    }
  )

  watch(
    () => resolveRef(options.path),
    () => {
      failed.value = false
      if (options.container.value) load()
    }
  )

  watch(
    () => resolveRef(options.autoplay),
    play => {
      if (failed.value) return
      if (!animation.value) {
        if (play && options.container.value) load()
        return
      }
      if (play) restart()
      else pause()
    }
  )

  onBeforeUnmount(destroy)

  return {
    animation,
    failed,
    destroy,
    restart,
    pause,
    load
  }
}
