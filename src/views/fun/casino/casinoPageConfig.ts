import type { GameQueryOptions } from '@/stores/game'

export type CasinoPageMode = 'lobby' | 'pageStyle2' | 'pageStyle3' | 'pageStyle4'

const GAME_LIST_TAB_ALIAS_MAP: Record<string, string> = {
  originals: 'originals',
  hot_games: 'hot-games',
  favorites: 'favorites',
  recent: 'recent',
  providers: 'providers',
  DZ: 'slots',
  ZR: 'live-casino',
  QP: 'table-games',
  BY: 'fishing'
}

const GAME_LIST_TAB_ALIAS_REVERSE_MAP = Object.entries(GAME_LIST_TAB_ALIAS_MAP).reduce<
  Record<string, string>
>((acc, [tabCode, slug]) => {
  acc[slug] = tabCode
  return acc
}, {})

const pageStyle2TabCodes = new Set(['originals', 'hot_games', 'favorites', 'recent'])

export const getGameListTabSlug = (tabCode: string) => {
  const normalizedTabCode = tabCode.trim()

  if (!normalizedTabCode) {
    return ''
  }

  return GAME_LIST_TAB_ALIAS_MAP[normalizedTabCode] ?? normalizedTabCode.toLowerCase()
}

export const getGameListTabCodeFromSlug = (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return ''
  }

  return (
    GAME_LIST_TAB_ALIAS_REVERSE_MAP[normalizedSlug] ??
    normalizedSlug.replace(/-/g, '_').toUpperCase()
  )
}

export const getCasinoPageMode = (tabCode: string): CasinoPageMode => {
  if (!tabCode) {
    return 'lobby'
  }

  if (tabCode === 'providers') {
    return 'pageStyle4'
  }

  if (pageStyle2TabCodes.has(tabCode)) {
    return 'pageStyle2'
  }

  return 'pageStyle3'
}

export const getCasinoQueryOptions = (
  tabCode: string,
  options: { isMobile?: boolean } = {}
): GameQueryOptions | undefined => {
  const normalizedTabCode = tabCode.trim()
  const baseOptions: GameQueryOptions = {
    rowType: 3,
    pageSize: options.isMobile ? 27 : 32
  }

  switch (normalizedTabCode) {
    case '':
    case 'providers':
      return undefined
    case 'originals':
      return {
        ...baseOptions,
        platformCode: 'JILI_DZ'
      }
    case 'hot_games':
      return {
        ...baseOptions,
        hot: 1,
        sortByOrderId: true
      }
    case 'favorites':
    case 'recent':
      return baseOptions
    default:
      return {
        ...baseOptions,
        sysGameTypeCode: normalizedTabCode
      }
  }
}
