import type { HashGameBetOption } from '@/api/interface/hash_game.interface'

export type BetKey = Lowercase<HashGameBetOption>

/** 玩法方向的唯一映射，游戏盘面与聊天室共用。 */
export const BET_OPTIONS = {
  BIG: { key: 'big', chinese: '大', mark: 'bigMark', color: '#FF5350' },
  SMALL: { key: 'small', chinese: '小', mark: 'smallMark', color: '#407FFF' },
  ODD: { key: 'odd', chinese: '单', mark: 'oddMark', color: '#34D8C7' },
  EVEN: { key: 'even', chinese: '双', mark: 'evenMark', color: '#FF9822' },
  WIN: { key: 'win', chinese: '赢', mark: 'winMark', color: '#34D8C7' },
  LOSE: { key: 'lose', chinese: '输', mark: 'loseMark', color: '#FF5350' },
  BANKER: { key: 'banker', chinese: '庄', mark: 'bankerMark', color: '#FF5350' },
  PLAYER: { key: 'player', chinese: '闲', mark: 'playerMark', color: '#407FFF' },
  TIE: { key: 'tie', chinese: '和', mark: 'tieMark', color: '#34D8C7' }
} as const satisfies Record<
  HashGameBetOption,
  { key: BetKey; chinese: string; mark: string; color: string }
>

export const BET_KEYS = Object.fromEntries(
  Object.entries(BET_OPTIONS).map(([code, option]) => [code, option.key])
) as Record<HashGameBetOption, BetKey>

export const BET_COLORS = Object.fromEntries(
  Object.values(BET_OPTIONS).map(option => [option.key, option.color])
) as Record<BetKey, string>

const chineseCodes = Object.fromEntries(
  Object.entries(BET_OPTIONS).map(([code, option]) => [option.chinese, code])
) as Record<string, HashGameBetOption>

export function chatOptionCode(value: string): HashGameBetOption | undefined {
  const normalized = value.trim().toUpperCase()
  if (Object.prototype.hasOwnProperty.call(BET_OPTIONS, normalized))
    return normalized as HashGameBetOption
  return chineseCodes[value.trim()]
}

export function chatOptionMarkKey(value: string) {
  const code = chatOptionCode(value)
  return code ? BET_OPTIONS[code].mark : undefined
}

export function chatOptionColor(value: string) {
  const code = chatOptionCode(value)
  return code ? BET_OPTIONS[code].color : '#34D8C7'
}
