import type {
  SportMarketLine,
  SportWagerSelection,
  SportsBetInfoQuote
} from '@/api/interface/sport'
import { formatHandicap } from '../components/match-odds/display'

export type SelectionTeams = { HomeTeam?: string; AwayTeam?: string }

const numericKeys = new Set([
  'total',
  'goalnr',
  'from',
  'to',
  'pointnr',
  'quarternr',
  'setnr',
  'gamenr',
  'gamenrX',
  'gamenrY',
  'games',
  'inningnr',
  'periodnr',
  'overnr',
  'deliverynr',
  'dismissalnr',
  'milestone',
  'bonr',
  'killnr',
  'roundnr',
  'placenr'
])
// 中英文表格中同一参数的拼写别名。
const parameterAliases: Readonly<Record<string, string>> = {
  quarter_nr: 'quarternr',
  gamnr: 'gamenr'
}
const homeKeys = new Set(['Home', 'home', '主'])
const awayKeys = new Set(['Away', 'away', '客'])
const numberPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/
const readNumber = (value: string | undefined): number | null =>
  value !== undefined && numberPattern.test(value.trim()) && Number.isFinite(Number(value))
    ? Number(value)
    : null

/** 已确认参数按规则替换；未知占位符保留原文，已确认参数缺失或歧义时返回 null。 */
export const resolveSelectionName = (
  selection: SportWagerSelection,
  teams: SelectionTeams = {}
): string | null => {
  const params = new Map<string, string>()
  for (const part of (selection.Specifiers ?? '').split('&')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    const rawKey = part.slice(0, separator).trim()
    const key = Object.prototype.hasOwnProperty.call(parameterAliases, rawKey)
      ? parameterAliases[rawKey]
      : rawKey
    const value = part.slice(separator + 1).trim()
    if (params.has(key) && params.get(key) !== value) return null
    params.set(key, value)
  }
  let valid = true
  const name = (selection.SelectionName ?? '')
    .replace(/\{([^{}]+)\}/g, (placeholder: string, raw: string) => {
      const key = raw.trim()
      let value: string | undefined
      if (homeKeys.has(key)) value = teams.HomeTeam
      else if (awayKeys.has(key)) value = teams.AwayTeam
      else if (key === 'x-y' || key === 'y-x') {
        const parts = params.get('hcp')?.split(':') ?? []
        const x = readNumber(parts[0])
        const y = readNumber(parts[1])
        if (parts.length === 2 && x !== null && y !== null) {
          const difference = Number((key === 'x-y' ? x - y : y - x).toFixed(8))
          if (Number.isFinite(difference)) {
            value = difference > 0 ? `+${difference}` : String(difference)
          }
        }
      } else if (key === 'hcp') {
        const hcp = readNumber(params.get('hcp'))
        if (hcp !== null) value = formatHandicap(hcp)
      } else if (
        numericKeys.has(key) ||
        Object.prototype.hasOwnProperty.call(parameterAliases, key)
      ) {
        const parameter = parameterAliases[key] ?? key
        const number = readNumber(params.get(parameter) ?? params.get(key))
        if (number !== null)
          value = key === 'from' || key === 'to' ? String(number).padStart(2, '0') : String(number)
      } else return placeholder
      if (!value?.trim()) valid = false
      return value ?? ''
    })
    .trim()
  const malformed = /[{}]/.test(name.replace(/\{[^{}]+\}/g, ''))
  return valid && name && !malformed ? name : null
}

/** 标题参数仅在本盘口各选项的解释一致时替换；缺失或冲突时保留原占位符。 */
export const formatMarketName = (line: SportMarketLine, teams: SelectionTeams = {}): string =>
  line.BetTypeName.replace(/\{[^{}]+\}/g, placeholder => {
    const values = line.WagerSelections.map(selection =>
      resolveSelectionName({ ...selection, SelectionName: placeholder }, teams)
    )
    const first = values[0]
    return first && values.every(value => value === first) ? first : placeholder
  })

/** 文档中使用独立让球/大小数值的玩法；组合玩法不能追加占位用的 Handicap=0。 */
const handicapBetTypes = new Set([
  1, 2, 93, 94, 132, 133, 160, 161, 181, 182, 188, 189, 191, 192, 194, 195, 199, 200, 279, 280, 281,
  282, 286, 287, 292, 293, 296, 297, 374, 375
])

/** 名称已经包含盘口模板时，不再追加独立盘口值。 */
export const selectionNeedsHandicap = (line: SportMarketLine, selection: SportWagerSelection) =>
  handicapBetTypes.has(line.BetTypeId) &&
  !/\{\s*(?:hcp|total|x-y|y-x)\s*\}/.test(selection.SelectionName) &&
  Number.isFinite(selection.Handicap)

export const formatSelectionName = (
  line: SportMarketLine,
  selection: SportWagerSelection,
  teams: SelectionTeams = {},
  handicap?: string
): string | null => {
  const name = resolveSelectionName(selection, teams)
  if (name === null) return null
  return selectionNeedsHandicap(line, selection)
    ? `${name} ${handicap ?? formatHandicap(selection.Handicap)}`
    : name
}

/** 投注单按最新报价的参数展示，与实际提交的 sp/h 保持一致；缺失参数不回退旧盘口。 */
export const formatQuotedSelectionName = (
  line: SportMarketLine,
  selection: SportWagerSelection,
  quote: SportsBetInfoQuote,
  teams: SelectionTeams = {}
): string | null => {
  if (selectionNeedsHandicap(line, selection) && !Number.isFinite(quote.h)) return null
  return formatSelectionName(
    line,
    { ...selection, Specifiers: quote.sp ?? '', Handicap: quote.h ?? selection.Handicap },
    teams,
    quote.dih?.trim() || (quote.h == null ? undefined : String(quote.h))
  )
}
