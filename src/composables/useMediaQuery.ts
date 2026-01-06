import { ref, onMounted, onUnmounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'

/**
 * 响应式媒体查询 Hook
 * @param query - CSS 媒体查询字符串
 * @returns 响应式的布尔值，表示媒体查询是否匹配
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  
  let mediaQuery: MediaQueryList | null = null
  
  const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }
  
  onMounted(() => {
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches
      mediaQuery.addEventListener('change', updateMatches)
    }
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

