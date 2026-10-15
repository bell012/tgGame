let openSheetMaskCount = 0
let previousThemeColor: string | null = null

const themeColorMeta = () => document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

const bodyBackgroundColor = () => {
  const pageBackground = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-background-level-1')
    .trim()

  if (pageBackground) {
    return pageBackground
  }

  return document.body ? getComputedStyle(document.body).backgroundColor.trim() : ''
}

/** 蒙层打开时让系统电池栏跟 body 底色一致，全部关闭后再恢复。 */
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
    const backgroundColor = bodyBackgroundColor()
    if (backgroundColor) {
      meta.setAttribute('content', backgroundColor)
    }
    return
  }

  openSheetMaskCount = Math.max(0, openSheetMaskCount - 1)
  if (openSheetMaskCount === 0 && previousThemeColor !== null) {
    meta.setAttribute('content', previousThemeColor)
    previousThemeColor = null
  }
}
