import router from '@/router'
import { navigateToName } from './router'

export type GameCardAnchor = {
  fromPath: string
  element: HTMLElement
  bounds: DOMRectReadOnly
}

let pending: (GameCardAnchor & { rowId: string }) | undefined

export function openGameFromCard(rowId: string | number, event: MouseEvent) {
  const element = event.currentTarget
  const anchor =
    element instanceof HTMLElement
      ? {
          fromPath: router.currentRoute.value.fullPath,
          element,
          bounds: element.getBoundingClientRect(),
          rowId: String(rowId)
        }
      : undefined

  pending = anchor
  return navigateToName('gameDetail', { params: { rowId } }).finally(() => {
    if (pending === anchor) pending = undefined
  })
}

export function takeGameCardAnchor(fromPath: string, rowId: unknown): GameCardAnchor | undefined {
  if (pending?.fromPath !== fromPath || pending.rowId !== rowId) return
  const anchor = pending
  pending = undefined
  return anchor
}

export function setPageScaleTransform(element: Element, bounds?: DOMRectReadOnly) {
  if (!(element instanceof HTMLElement)) return
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
    element.style.removeProperty('--page-scale-from')
    return
  }

  // 入场钩子执行时浮层还未插入 DOM，固定定位的浮层使用视口尺寸。
  const viewport = element.ownerDocument.documentElement
  const width = element.isConnected ? element.offsetWidth : viewport.clientWidth
  const height = element.isConnected ? element.offsetHeight : viewport.clientHeight
  if (!width || !height) return
  element.style.setProperty(
    '--page-scale-from',
    `translate(${bounds.left}px, ${bounds.top}px) scale(${bounds.width / width}, ${bounds.height / height})`
  )
}
