import { onBeforeUnmount, watch, type Ref } from 'vue'

const OVERLAY_THEME_COLOR_DARK = '#141616'
const OVERLAY_THEME_COLOR_LIGHT = '#666666'

const themeColorStack: string[] = []

function getThemeColorMeta() {
  return document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
}

function getOverlayColor() {
  return document.documentElement.classList.contains('dark')
    ? OVERLAY_THEME_COLOR_DARK
    : OVERLAY_THEME_COLOR_LIGHT
}

function applyOverlayThemeColor() {
  const meta = getThemeColorMeta()
  themeColorStack.push(meta?.getAttribute('content') ?? '')
  meta?.setAttribute('content', getOverlayColor())
}

function restoreThemeColor() {
  themeColorStack.pop()
  if (themeColorStack.length === 0) {
    const meta = getThemeColorMeta()
    if (!meta) return

    const themeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background-level-1')
      .trim()

    if (themeColor) {
      meta.setAttribute('content', themeColor)
    }
  }
}

/**
 * 弹窗 visible 时将系统状态栏 theme-color 切换为遮罩叠加色，
 * 关闭时恢复。支持多个弹窗嵌套（栈式缓存）。
 */
export function useThemeColorOnOverlay(visible: Ref<boolean> | (() => boolean)) {
  const get = typeof visible === 'function' ? visible : () => visible.value

  watch(get, v => (v ? applyOverlayThemeColor() : restoreThemeColor()), { immediate: true })

  onBeforeUnmount(() => {
    if (get()) restoreThemeColor()
  })
}
