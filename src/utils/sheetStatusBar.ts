/** 与 stores/layout.ts 的 MOBILE_BREAKPOINT 一致。 */
const MOBILE_MASK_QUERY = '(max-width: 640px)'
const MASK_SELECTOR = [
  '.bg-mask-20',
  '.bg-mask-40',
  '.bg-mask-60-1',
  '.bg-mask-80-2',
  '.bg-mask-96-3',
  '.bg-mask-100-4',
  '.bg-black\\/30',
  '.sheet-safe-mask'
].join(',')

let maskApplied = false
let previousThemeColor: string | null = null
let scanScheduled = false
let observer: MutationObserver | null = null

const STATUS_BAR_MASK_COLOR_VAR = '--sheet-status-bar-color'
const IOS_STATUS_BAR_TINT_CLASS = 'ios-status-bar-tint'

let iosStatusBarTint: HTMLElement | null = null
const IOS_MASK_ACTIVE_CLASS = 'ios-mask-status-active'

/** 同时提供页面根背景和顶部实色，兼容 Safari 的浏览器区域取色。 */
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

  if (iosStatusBarTint.style.getPropertyValue('--tint-color') !== color) {
    iosStatusBarTint.style.setProperty('--tint-color', color)
  }
  if (!document.documentElement.classList.contains(IOS_MASK_ACTIVE_CLASS)) {
    document.documentElement.classList.add(IOS_MASK_ACTIVE_CLASS)
  }
}

const clearIosStatusBarTint = () => {
  iosStatusBarTint?.remove()
  iosStatusBarTint = null
  document.documentElement.classList.remove(IOS_MASK_ACTIVE_CLASS)
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
    // 主题变量已更新，重新合成当前蒙层覆盖顶部背景后的实际颜色。
    scheduleMaskScan()
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

/** 按绘制顺序合成所有可见蒙层，不能只将最上层叠在未遮罩的顶栏上。 */
const maskStatusBarColor = (masks: HTMLElement[]) => {
  let color = parseColor(cssVar('--color-background-level-5'))
  if (!color) {
    return ''
  }
  let applied = false
  for (const mask of masks) {
    const style = getComputedStyle(mask)
    const overlay = parseColor(style.backgroundColor)
    if (!overlay || overlay.a <= 0) continue
    const opacity = Number.parseFloat(style.opacity)
    const alpha = overlay.a * (Number.isFinite(opacity) ? opacity : 1)
    if (alpha <= 0) continue
    // 中间结果保留小数，避免多层混合时累积取整误差。
    color = {
      r: overlay.r * alpha + color.r * (1 - alpha),
      g: overlay.g * alpha + color.g * (1 - alpha),
      b: overlay.b * alpha + color.b * (1 - alpha),
      a: 1
    }
    applied = true
  }
  return applied ? composite(color, { r: 0, g: 0, b: 0, a: 0 }) : ''
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

// querySelectorAll 已按 DOM 顺序排列；稳定排序保留同层级的绘制顺序。
const visibleFullScreenMasks = () =>
  Array.from(document.querySelectorAll(MASK_SELECTOR))
    .filter(isFullScreenMask)
    .sort((a, b) => stackingZIndex(a) - stackingZIndex(b))

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

const applyMasks = (masks: HTMLElement[]) => {
  const backgroundColor = maskStatusBarColor(masks)
  if (!backgroundColor) {
    restoreIdleStatusBar()
    return
  }

  if (!maskApplied) {
    previousThemeColor = themeColorMeta()?.getAttribute('content') ?? null
    maskApplied = true
  }

  writeThemeColor(backgroundColor)
  // 监听器也会收到自身 style 写入；相同值不重复写，避免逐帧自触发。
  if (
    document.documentElement.style.getPropertyValue(STATUS_BAR_MASK_COLOR_VAR) !== backgroundColor
  ) {
    document.documentElement.style.setProperty(STATUS_BAR_MASK_COLOR_VAR, backgroundColor)
  }
  applyIosStatusBarTint(backgroundColor)
}

const scanFullScreenMasks = () => {
  if (!isMobileViewport()) {
    restoreIdleStatusBar()
    return
  }

  const masks = visibleFullScreenMasks()
  if (!masks.length) {
    restoreIdleStatusBar()
    return
  }

  applyMasks(masks)
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

  // body 的子树变化无法捕获 html 上的主题 class 切换。
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  })

  window.addEventListener('resize', scheduleMaskScan)
  // CSS 过渡本身不产生 DOM mutation，结束后必须同步最终颜色。
  document.addEventListener('transitionend', scheduleMaskScan, true)
  document.addEventListener('transitioncancel', scheduleMaskScan, true)
  document.addEventListener('animationend', scheduleMaskScan, true)
  window.visualViewport?.addEventListener('resize', scheduleMaskScan)
  window.matchMedia(MOBILE_MASK_QUERY).addEventListener('change', scheduleMaskScan)
  scheduleMaskScan()
}
