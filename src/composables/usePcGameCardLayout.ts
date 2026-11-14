import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/stores/layout'
import { useIsMobile } from './useMediaQuery'

export const PC_GAME_GRID_CLASS_WITHOUT_SIDEBAR =
  'sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-8'

const gridClasses = {
  expanded: 'sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-8',
  collapsed: PC_GAME_GRID_CLASS_WITHOUT_SIDEBAR
} as const

const railClasses = {
  expanded:
    'sm:auto-cols-[calc((100%-3*theme(spacing.2))/4)] md:auto-cols-[calc((100%-4*theme(spacing.2))/5)] lg:auto-cols-[calc((100%-6*theme(spacing.2))/7)] xl:auto-cols-[calc((100%-7*theme(spacing.2))/8)] 2xl:auto-cols-[calc((100%-7*theme(spacing.2))/8)]',
  collapsed:
    'sm:auto-cols-[calc((100%-4*theme(spacing.2))/5)] md:auto-cols-[calc((100%-5*theme(spacing.2))/6)] lg:auto-cols-[calc((100%-6*theme(spacing.2))/7)] xl:auto-cols-[calc((100%-7*theme(spacing.2))/8)] 2xl:auto-cols-[calc((100%-7*theme(spacing.2))/8)]'
} as const

/** 仅输出展示规则，不参与查询条件或分页。 */
export function usePcGameCardLayout() {
  const isMobile = useIsMobile()
  const { isSidebarCollapsed: collapsed } = storeToRefs(useLayoutStore())
  const menuState = computed(() => (collapsed.value ? 'collapsed' : 'expanded'))

  return {
    // 640px 仍由项目判定为 H5，不挂载 PC 的 sm 响应式类。
    gridClass: computed(() => (isMobile.value ? '' : gridClasses[menuState.value])),
    railClass: computed(() => (isMobile.value ? '' : railClasses[menuState.value])),
    titleClass: computed(() =>
      isMobile.value
        ? 'text-base sm:text-xl'
        : collapsed.value
          ? 'text-base'
          : 'text-sm lg:text-base'
    ),
    allClass: computed(() => (isMobile.value ? 'text-xs sm:text-sm' : 'text-xs lg:text-sm'))
  }
}
