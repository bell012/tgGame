import { ref } from 'vue'

const DEFAULT_GAME_SELECTION_PATH = '/casino'
const EXPLORE_CASINO_TAB_QUERY_KEY = 'casinoTab'

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

const isGameReturnPath = (path: string): boolean => {
  if (
    path === '/' ||
    path === '/explore' ||
    path === '/casino' ||
    path === '/favorites-games' ||
    path === '/recently-played-games'
  ) {
    return true
  }
  return Boolean(firstSegmentAfter(path, '/casino/') || firstSegmentAfter(path, '/gamelist/'))
}

const splitPathAndQuery = (path: string) => {
  const [rawPathname, rawSearch = ''] = path.split('?')
  const pathname = normalizePathname(rawPathname ?? '')
  const params = new URLSearchParams((rawSearch.split('#')[0] ?? '').trim())
  return { pathname, params }
}

const buildExploreReturnPath = (params: URLSearchParams) => {
  const casinoTab = (params.get(EXPLORE_CASINO_TAB_QUERY_KEY) ?? '').trim()
  if (!casinoTab) {
    return '/explore'
  }

  return `/explore?${EXPLORE_CASINO_TAB_QUERY_KEY}=${encodeURIComponent(casinoTab)}`
}

export const recordGameSelectionPath = (path: string) => {
  const { pathname, params } = splitPathAndQuery(path)
  if (!isGameReturnPath(pathname)) {
    return
  }

  lastGameSelectionPath.value = pathname === '/explore' ? buildExploreReturnPath(params) : pathname
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
