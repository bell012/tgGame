import { computed, inject, ref, type InjectionKey, type Ref } from 'vue'
import { useIsMobile, useMediaQuery } from './useMediaQuery'

export const gameCardSidebarCollapsedKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol(
  'game-card-sidebar-collapsed'
)

export function resolvePcGameCardColumns(width: number, collapsed: boolean) {
  if (width <= 640) return null
  if (width >= 1280) return 8
  if (width >= 1024) return 7
  if (width >= 768) return collapsed ? 6 : 5
  return collapsed ? 5 : 4
}

const gridClasses = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8'
} as const

const railClasses = {
  4: 'auto-cols-[calc((100%-3*theme(spacing.2))/4)]',
  5: 'auto-cols-[calc((100%-4*theme(spacing.2))/5)]',
  6: 'auto-cols-[calc((100%-5*theme(spacing.2))/6)]',
  7: 'auto-cols-[calc((100%-6*theme(spacing.2))/7)]',
  8: 'auto-cols-[calc((100%-7*theme(spacing.2))/8)]'
} as const

/** 仅输出展示规则，不参与查询条件或分页。 */
export function usePcGameCardLayout() {
  const isMobile = useIsMobile()
  const md = useMediaQuery('(min-width: 768px)')
  const lg = useMediaQuery('(min-width: 1024px)')
  const xl = useMediaQuery('(min-width: 1280px)')
  const collapsed = inject(gameCardSidebarCollapsedKey, ref(false))
  const columns = computed(() =>
    resolvePcGameCardColumns(
      isMobile.value ? 640 : xl.value ? 1280 : lg.value ? 1024 : md.value ? 768 : 641,
      collapsed.value
    )
  )

  return {
    columns,
    gridClass: computed(() => (columns.value ? gridClasses[columns.value] : '')),
    railClass: computed(() => (columns.value ? railClasses[columns.value] : '')),
    titleClass: computed(() =>
      isMobile.value
        ? 'text-base sm:text-xl'
        : lg.value || collapsed.value
          ? 'text-base'
          : 'text-sm'
    ),
    allClass: computed(() =>
      isMobile.value ? 'text-xs sm:text-sm' : lg.value ? 'text-sm' : 'text-xs'
    )
  }
}
