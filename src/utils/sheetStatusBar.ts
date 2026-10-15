let openSheetMaskCount = 0
let previousThemeColor: string | null = null

const STATUS_BAR_MASK_COLOR_VAR = '--sheet-status-bar-color'

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
  if (openSheetMaskCount > 0) {
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
const maskStatusBarColor = () => {
  const top = parseColor(cssVar('--color-background-level-5'))
  const mask = parseColor(cssVar('--color-mask-60-1'))
  if (!top || !mask) {
    return ''
  }
  return composite(top, mask)
}

/** 蒙层打开时让系统电池栏跟蒙层同一色，全部关闭后再恢复。 */
export const syncSheetStatusBar = (visible: boolean) => {
  const meta = themeColorMeta()
  if (!meta) {
    return
  }

  if (visible) {
    if (openSheetMaskCount === 0) {
      previousThemeColor = meta.getAttribute('content')
    }
    openSheetMaskCount += 1
    const backgroundColor = maskStatusBarColor()
    if (backgroundColor) {
      writeThemeColor(backgroundColor)
      document.documentElement.style.setProperty(STATUS_BAR_MASK_COLOR_VAR, backgroundColor)
    }
    return
  }

  openSheetMaskCount = Math.max(0, openSheetMaskCount - 1)
  if (openSheetMaskCount === 0 && previousThemeColor !== null) {
    writeThemeColor(previousThemeColor)
    previousThemeColor = null
    document.documentElement.style.removeProperty(STATUS_BAR_MASK_COLOR_VAR)
  }
}
