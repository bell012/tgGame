import { onActivated, onDeactivated, onMounted, onScopeDispose, watch } from 'vue'
import type { ObjectDirective } from 'vue'

export type VisibleMatchTarget = { sportId: number; eventId: number }
type MatchBinding = VisibleMatchTarget & { enabled?: boolean }
type CardState = { target: MatchBinding; visible: boolean }

type VisibilityOptions = {
  enabled: () => boolean
  topInset: () => number
  onChange: (targets: readonly VisibleMatchTarget[]) => void
}

export function useMatchVisibility(options: VisibilityOptions) {
  const cards = new Map<HTMLElement, CardState>()
  let observer: IntersectionObserver | undefined
  let mounted = false
  let active = true
  let disposed = false
  let publishQueued = false
  let lastSignature = ''

  const isEnabled = () => mounted && active && !disposed && !document.hidden && options.enabled()

  const publish = () => {
    publishQueued = false
    const targets = new Map<string, VisibleMatchTarget>()
    if (isEnabled()) {
      for (const { target, visible } of cards.values()) {
        if (!visible || target.enabled === false) continue
        targets.set(`${target.sportId}:${target.eventId}`, {
          sportId: target.sportId,
          eventId: target.eventId
        })
      }
    }
    const signature = [...targets.keys()].sort().join(',')
    if (signature === lastSignature) return
    lastSignature = signature
    options.onChange([...targets.values()])
  }
  const queuePublish = () => {
    if (publishQueued) return
    publishQueued = true
    queueMicrotask(publish)
  }
  const setVisible = (element: HTMLElement, card: CardState, visible: boolean) => {
    card.visible = visible
    element.dataset.sportsVisible = String(visible)
  }
  const disconnect = () => {
    observer?.disconnect()
    observer = undefined
    for (const [element, card] of cards) setVisible(element, card, false)
    publish()
  }
  const reconnect = () => {
    disconnect()
    if (!isEnabled() || typeof IntersectionObserver === 'undefined') return

    // 底栏在 640px 会隐藏，按实际遮挡高度扣除。
    const bottomBar = document.querySelector<HTMLElement>('.bottom-tab-bar')
    const rect = bottomBar?.getBoundingClientRect()
    const bottom = rect && rect.height > 0 ? Math.max(0, window.innerHeight - rect.top) : 0
    const currentObserver = new IntersectionObserver(
      entries => {
        if (observer !== currentObserver || !isEnabled()) return
        for (const entry of entries) {
          const element = entry.target
          if (!(element instanceof HTMLElement)) continue
          const card = cards.get(element)
          if (!card) continue
          setVisible(
            element,
            card,
            card.target.enabled !== false && entry.isIntersecting && entry.intersectionRatio > 0
          )
        }
        queuePublish()
      },
      {
        rootMargin: `-${Math.max(0, options.topInset())}px 0px -${bottom}px 0px`,
        threshold: [0, 0.001]
      }
    )
    observer = currentObserver
    for (const [element, card] of cards) {
      if (card.target.enabled !== false) observer.observe(element)
    }
  }

  const updateCard = (element: HTMLElement, target: MatchBinding) => {
    const oldCard = cards.get(element)
    if (
      oldCard &&
      oldCard.target.sportId === target.sportId &&
      oldCard.target.eventId === target.eventId &&
      oldCard.target.enabled === target.enabled
    )
      return
    observer?.unobserve(element)
    const card = { target: { ...target }, visible: false }
    cards.set(element, card)
    setVisible(element, card, false)
    if (target.enabled !== false) observer?.observe(element)
    queuePublish()
  }
  const vMatchVisibility: ObjectDirective<HTMLElement, MatchBinding> = {
    mounted: (element, binding) => updateCard(element, binding.value),
    updated: (element, binding) => updateCard(element, binding.value),
    beforeUnmount: element => {
      observer?.unobserve(element)
      cards.delete(element)
      queuePublish()
    }
  }

  watch([options.enabled, options.topInset], reconnect, { flush: 'post' })
  onMounted(() => {
    mounted = true
    document.addEventListener('visibilitychange', reconnect)
    window.addEventListener('resize', reconnect)
    reconnect()
  })
  onActivated(() => {
    active = true
    reconnect()
  })
  onDeactivated(() => {
    active = false
    disconnect()
  })
  onScopeDispose(() => {
    disposed = true
    document.removeEventListener('visibilitychange', reconnect)
    window.removeEventListener('resize', reconnect)
    disconnect()
    cards.clear()
  })

  return { vMatchVisibility }
}
