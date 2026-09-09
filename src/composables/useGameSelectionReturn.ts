import { useSidebarMenuState } from '@/composables/useSidebarMenuState'
import { ref } from 'vue'

const DEFAULT_GAME_SELECTION_PATH = '/casino'
const GAME_CATEGORIES_MENU_ID = 'game-categories'

/** 最近一次选游列表路径（无语言前缀），供关闭游戏后返回 */
const lastGameSelectionPath = ref('')

const normalizePathname = (path: string): string => {
  const pathname = path.split('?')[0]?.split('#')[0] ?? ''
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1)
  }
  return withSlash || '/'
}

const firstSegmentAfter = (path: string, prefix: string): string => {
  if (!path.startsWith(prefix)) {
    return ''
  }
  const rest = path.slice(prefix.length)
  if (!rest || rest.includes('/')) {
    return ''
  }
  return rest
}

const isGameSelectionPath = (path: string): boolean => {
  if (path === '/casino' || path === '/favorites-games' || path === '/recently-played-games') {
    return true
  }
  return Boolean(firstSegmentAfter(path, '/casino/') || firstSegmentAfter(path, '/gamelist/'))
}

const ensureExpanded = (menuId: string) => {
  const { expandedMenus } = useSidebarMenuState()
  if (!expandedMenus.value.includes(menuId)) {
    expandedMenus.value.push(menuId)
  }
}

const syncSidebarForSelectionPath = (path: string) => {
  const { activeMenuId } = useSidebarMenuState()

  if (path === '/casino') {
    activeMenuId.value = GAME_CATEGORIES_MENU_ID
    ensureExpanded(GAME_CATEGORIES_MENU_ID)
    return
  }

  if (path === '/favorites-games') {
    activeMenuId.value = 'favorites'
    return
  }

  if (path === '/recently-played-games') {
    activeMenuId.value = 'recently-played'
    return
  }

  const casinoTab = firstSegmentAfter(path, '/casino/')
  const gameListTab = firstSegmentAfter(path, '/gamelist/')
  const tabKey = casinoTab || gameListTab
  if (!tabKey) {
    return
  }

  activeMenuId.value = `casino_${tabKey}`
  ensureExpanded(GAME_CATEGORIES_MENU_ID)
}

export const recordGameSelectionPath = (path: string) => {
  const normalized = normalizePathname(path)
  if (!isGameSelectionPath(normalized)) {
    return
  }

  lastGameSelectionPath.value = normalized
  syncSidebarForSelectionPath(normalized)
}

export const resolveGameSelectionPath = () => {
  return lastGameSelectionPath.value || DEFAULT_GAME_SELECTION_PATH
}

export function useGameSelectionReturn() {
  return {
    lastGameSelectionPath,
    recordGameSelectionPath,
    resolveGameSelectionPath
  }
}
