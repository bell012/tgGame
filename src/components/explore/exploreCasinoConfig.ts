import type { GameQueryOptions } from '@/stores/game'

export type ExploreCasinoPageMode = 'pageStyle2' | 'pageStyle3' | 'pageStyle4'

const pageStyle2TabCodes = new Set(['originals', 'hot_games', 'favorites', 'recent'])

export const getExploreCasinoPageMode = (tabCode: string): ExploreCasinoPageMode => {
  const normalizedTabCode = tabCode.trim()

  if (normalizedTabCode === 'providers') {
    return 'pageStyle4'
  }

  if (pageStyle2TabCodes.has(normalizedTabCode)) {
    return 'pageStyle2'
  }

  return 'pageStyle3'
}

export const getExploreCasinoQueryOptions = (
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
    case 'hot_games':
      return {
        ...baseOptions,
        hot: 1,
        sortByHotOrderId: true
      }
    case 'favorites':
    case 'recent':
      return baseOptions
    default:
      return {
        ...baseOptions,
        gameTypeCode: normalizedTabCode
      }
  }
}
