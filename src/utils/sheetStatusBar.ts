/** 与 stores/layout.ts 的 MOBILE_BREAKPOINT 一致。 */
const MOBILE_MASK_QUERY = '(max-width: 640px)'
const MASK_SELECTOR = [
  '.bg-mask-20',
  '.bg-mask-40',
  '.bg-mask-60-1',
  '.bg-mask-80-2',
  '.sheet-safe-mask'
].join(',')

let maskApplied = false
let previousThemeColor: string | null = null
let scanScheduled = false
let observer: MutationObserver | null = null

const STATUS_BAR_MASK_COLOR_VAR = '--sheet-status-bar-color'
const IOS_STATUS_BAR_TINT_CLASS = 'ios-status-bar-tint'

let iosStatusBarTint: HTMLElement | null = null
let iosBodyBackgroundApplied = false

/** iOS 浏览器都走 WebKit，Safari 26 起电池栏改采样页面实色。 */
const isIosBrowser = () => {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) {
    return true
  }
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

const applyIosStatusBarTint = (color: string) => {
  if (!isIosBrowser()) {
    return
  }

  if (!iosStatusBarTint || !iosStatusBarTint.isConnected) {
    iosStatusBarTint = document.createElement('div')
    iosStatusBarTint.className = IOS_STATUS_BAR_TINT_CLASS
    iosStatusBarTint.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iosStatusBarTint)
  }

  iosStatusBarTint.style.backgroundColor = color
  document.body.style.backgroundColor = color
  iosBodyBackgroundApplied = true
}

const clearIosStatusBarTint = () => {
  iosStatusBarTint?.remove()
  iosStatusBarTint = null
  if (iosBodyBackgroundApplied) {
    document.body.style.removeProperty('background-color')
    iosBodyBackgroundApplied = false
  }
}

type Rgb = { r: number; g: number; b: number; a: number }

const themeColorMeta = () => document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

const writeThemeColor = (color: string) => {
  const meta = themeColorMeta()
  if (!meta || !color) {
    return
  }
  meta.setAttribute('content', color)
}

/** 蒙层还开着时，主题切换只记下关闭后要恢复的颜色。 */
export const syncIdleStatusBarColor = (color: string) => {
  if (!color) {
    return
  }
  if (maskApplied) {
    previousThemeColor = color
    return
  }
  writeThemeColor(color)
}

const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const parseColor = (input: string): Rgb | null => {
  const value = input.trim()
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value)
  if (hex) {
    const raw = hex[1]
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map(channel => channel + channel)
            .join('')
        : raw
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16),
      a: 1
    }
  }

  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(
    value
  )
  if (!rgb) {
    return null
  }

  return {
    r: Number(rgb[1]),
    g: Number(rgb[2]),
    b: Number(rgb[3]),
    a: rgb[4] === undefined ? 1 : Number(rgb[4])
  }
}

const channelByte = (value: number) =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, '0')

const composite = (base: Rgb, overlay: Rgb) => {
  const alpha = overlay.a
  const mix = (overlayChannel: number, baseChannel: number) =>
    overlayChannel * alpha + baseChannel * (1 - alpha)
  const red = channelByte(mix(overlay.r, base.r))
  const green = channelByte(mix(overlay.g, base.g))
  const blue = channelByte(mix(overlay.b, base.b))
  return `#${red}${green}${blue}`
}

/** 蒙层盖在顶栏上的实色。theme-color 不认透明色。 */
const maskStatusBarColor = (mask: Rgb) => {
  const top = parseColor(cssVar('--color-background-level-5'))
  if (!top || mask.a <= 0) {
    return ''
  }
  return composite(top, mask)
}

const isMobileViewport = () => window.matchMedia(MOBILE_MASK_QUERY).matches

const isFullScreenMask = (element: Element): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  const style = getComputedStyle(element)
  if (style.position !== 'fixed' || style.display === 'none' || style.visibility === 'hidden') {
    return false
  }
  if (Number(style.opacity) === 0) {
    return false
  }

  const rect = element.getBoundingClientRect()
  return (
    rect.top <= 8 &&
    rect.width >= window.innerWidth * 0.8 &&
    rect.height >= window.innerHeight * 0.8
  )
}

const stackingZIndex = (element: HTMLElement) => {
  const zIndex = Number.parseInt(getComputedStyle(element).zIndex, 10)
  return Number.isFinite(zIndex) ? zIndex : 0
}

const topmostFullScreenMask = () => {
  let best: HTMLElement | null = null
  let bestZIndex = -Infinity

  document.querySelectorAll(MASK_SELECTOR).forEach(element => {
    if (!isFullScreenMask(element)) {
      return
    }

    const zIndex = stackingZIndex(element)
    const isLater =
      best !== null &&
      zIndex === bestZIndex &&
      Boolean(element.compareDocumentPosition(best) & Node.DOCUMENT_POSITION_PRECEDING)
    if (!best || zIndex > bestZIndex || isLater) {
      best = element
      bestZIndex = zIndex
    }
  })

  return best
}

const restoreIdleStatusBar = () => {
  if (!maskApplied) {
    return
  }

  if (previousThemeColor !== null) {
    writeThemeColor(previousThemeColor)
  }
  previousThemeColor = null
  maskApplied = false
  document.documentElement.style.removeProperty(STATUS_BAR_MASK_COLOR_VAR)
  clearIosStatusBarTint()
}

const applyTopmostMask = (mask: HTMLElement) => {
  const overlay = parseColor(getComputedStyle(mask).backgroundColor)
  const backgroundColor = overlay ? maskStatusBarColor(overlay) : ''
  if (!backgroundColor) {
    return
  }

  if (!maskApplied) {
    previousThemeColor = themeColorMeta()?.getAttribute('content') ?? null
    maskApplied = true
  }

  writeThemeColor(backgroundColor)
  document.documentElement.style.setProperty(STATUS_BAR_MASK_COLOR_VAR, backgroundColor)
  applyIosStatusBarTint(backgroundColor)
}

const scanFullScreenMasks = () => {
  if (!isMobileViewport()) {
    restoreIdleStatusBar()
    return
  }

  const mask = topmostFullScreenMask()
  if (!mask) {
    restoreIdleStatusBar()
    return
  }

  applyTopmostMask(mask)
}

const scheduleMaskScan = () => {
  if (scanScheduled) {
    return
  }

  scanScheduled = true
  window.requestAnimationFrame(() => {
    scanScheduled = false
    scanFullScreenMasks()
  })
}

/** 移动端出现全屏蒙层时，电池栏跟最上面那层蒙层。 */
export const startMobileMaskStatusBar = () => {
  if (observer || typeof document === 'undefined') {
    return
  }

  observer = new MutationObserver(scheduleMaskScan)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden']
  })

  window.addEventListener('resize', scheduleMaskScan)
  window.matchMedia(MOBILE_MASK_QUERY).addEventListener('change', scheduleMaskScan)
  scheduleMaskScan()
}
