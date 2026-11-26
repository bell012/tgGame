import type { GameDataItem } from '@/api/interface/game'

export type GameDetailForPlatformPlay = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
  pgType?: string
  itemName?: string
  platformName?: string
  volatility?: GameDataItem['volatility']
  maxMultiple?: GameDataItem['maxMultiple']
  icon2?: string
  conUrl?: string
  gameItemHotVo?: {
    defaultImage?: string
  }
  [key: string]: unknown
} | null
