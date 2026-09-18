import lottie, { type AnimationItem } from 'lottie-web'
import { onBeforeUnmount, ref, shallowRef, unref, watch, type MaybeRef, type Ref } from 'vue'
import { cloneLottieData, type LottieData } from '@/utils/lottie-data-cache'

export interface UseLottieAnimationOptions {
  container: Ref<HTMLElement | null>
  path: MaybeRef<string | undefined>
  animationData?: MaybeRef<LottieData | null | undefined>
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
  const ready = ref(false)

  const destroy = () => {
    animation.value?.destroy()
    animation.value = null
    ready.value = false
  }

  const load = () => {
    const el = options.container.value
    const path = resolveRef(options.path)
    const animationData = resolveRef(options.animationData)
    if (!el || (!path && !animationData)) return

    destroy()

    try {
      const config = {
        container: el,
        renderer: 'svg' as const,
        loop: resolveRef(options.loop ?? true),
        autoplay: resolveRef(options.autoplay ?? true),
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
      }
      // animationData 与 path 互斥，命中缓存时优先用内存里的数据。
      const instance = animationData
        ? lottie.loadAnimation({ ...config, animationData: cloneLottieData(animationData) })
        : lottie.loadAnimation({ ...config, path: path as string })

      instance.addEventListener('DOMLoaded', () => {
        ready.value = true
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
    },
    { immediate: true }
  )

  watch(
    () => resolveRef(options.path),
    () => {
      failed.value = false
      if (options.container.value) load()
    },
    { immediate: true }
  )

  watch(
    () => resolveRef(options.animationData),
    data => {
      if (!data) return
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
    ready,
    destroy,
    restart,
    pause,
    load
  }
}
