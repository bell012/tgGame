import { onBeforeUnmount, ref, shallowRef, unref, watch, type Ref } from 'vue'

export type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)

function resolveValue<T>(source: MaybeRefOrGetter<T>): T {
  if (typeof source === 'function') {
    return (source as () => T)()
  }
  return unref(source as T | Ref<T>)
}

export interface UseIntersectionObserverOptions {
  target: MaybeRefOrGetter<Element | null | undefined>
  root?: MaybeRefOrGetter<Element | Document | null | undefined>
  threshold?: number | number[]
  rootMargin?: string
  immediate?: boolean
  enabled?: MaybeRefOrGetter<boolean>
  once?: boolean
  onChange?: (payload: {
    entry: IntersectionObserverEntry
    isIntersecting: boolean
    observer: IntersectionObserver
  }) => void
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions) {
  const isSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window

  const observerRef = shallowRef<IntersectionObserver | null>(null)
  const entryRef = shallowRef<IntersectionObserverEntry | null>(null)
  const isIntersecting = ref(false)
  const isActive = ref(false)

  function disconnect() {
    observerRef.value?.disconnect()
    observerRef.value = null
    isActive.value = false
  }

  function createObserver() {
    if (!isSupported) return

    const enabled = resolveValue(options.enabled ?? true)
    const target = resolveValue(options.target)

    if (!enabled || !target) {
      disconnect()
      return
    }

    const root = resolveValue(options.root ?? null)

    observerRef.value = new IntersectionObserver(
      (entries, observer) => {
        const entry = entries[0]
        if (!entry) return

        entryRef.value = entry
        isIntersecting.value = entry.isIntersecting

        options.onChange?.({
          entry,
          isIntersecting: entry.isIntersecting,
          observer
        })

        if (entry.isIntersecting && options.once) {
          disconnect()
        }
      },
      {
        root,
        threshold: options.threshold ?? 0,
        rootMargin: options.rootMargin ?? '0px'
      }
    )

    observerRef.value.observe(target)
    isActive.value = true
  }

  function reconnect() {
    disconnect()
    createObserver()
  }

  watch(
    [
      () => resolveValue(options.target),
      () => resolveValue(options.root ?? null),
      () => resolveValue(options.enabled ?? true)
    ],
    () => {
      if (options.immediate === false) return
      reconnect()
    },
    {
      immediate: true,
      flush: 'post'
    }
  )

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isSupported,
    isActive,
    isIntersecting,
    entry: entryRef,
    reconnect,
    disconnect
  }
}
