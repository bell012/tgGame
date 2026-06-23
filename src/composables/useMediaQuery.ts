import { ref, onMounted, onUnmounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'

function isMediaQueryMatched(query: string) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(query).matches
}

// 检测是否是 PWA / 添加到桌面
export function isPwaAppViewport() {
  if (typeof window === 'undefined') {
    return false
  }

  const isStandaloneDisplay = isMediaQueryMatched('(display-mode: standalone)')
  const isFullscreenDisplay = isMediaQueryMatched('(display-mode: fullscreen)')
  const isIosStandalone =
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  return isStandaloneDisplay || isFullscreenDisplay || isIosStandalone
}

/**
 * 响应式媒体查询 Hook
 * @param query - CSS 媒体查询字符串
 * @returns 响应式的布尔值，表示媒体查询是否匹配
 */
export function useMediaQuery(query: string) {
  // 初始化时优先同步读取一次媒体查询结果，避免首屏必须等待 mounted 后再切换。
  const getInitialMatchState = () => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(query).matches
  }

  const matches = ref(getInitialMatchState())

  let mediaQuery: MediaQueryList | null = null

  // 统一同步媒体查询结果，供初始化和后续 change 事件复用。
  const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined') {
      return
    }

    mediaQuery = window.matchMedia(query)
    updateMatches(mediaQuery)
    mediaQuery.addEventListener('change', updateMatches)
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', updateMatches)
    }
  })

  return matches
}

/**
 * 检测是否为移动端
 */
export function useIsMobile() {
  const layoutStore = useLayoutStore()
  return useMediaQuery(`(max-width: ${layoutStore.MOBILE_BREAKPOINT}px)`)
}
