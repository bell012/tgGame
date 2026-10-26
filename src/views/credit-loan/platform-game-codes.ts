import type { GameDataItem } from '@/api/interface/game'

/**
 * 借呗 platformGameCodes 的单项格式为 "游戏类型|游戏平台|游戏编码"，后两段可省略：
 * - "SX"            该类型下全部游戏
 * - "DZ|PG_DZ"      该类型下指定平台的全部游戏
 * - "DZ|PG_DZ|48"   该类型下指定平台的指定游戏
 */
interface LoanGameTypeRule {
  allGames: boolean
  /** 平台编码 -> 允许的游戏编码；为 null 时表示该平台全部游戏 */
  platforms: Map<string, Set<string> | null>
}

const normalizeCode = (value: unknown) => String(value ?? '').trim()

const splitPlatformGameCode = (code: string) => code.split('|').map(normalizeCode)

/** 取出 platformGameCodes 中出现的游戏类型，保持返回顺序并去重。 */
export const parseLoanGameTypeCodes = (platformGameCodes: string[] = []) => [
  ...new Set(platformGameCodes.map(code => splitPlatformGameCode(code)[0]).filter(Boolean))
]

const parseLoanGameRules = (platformGameCodes: string[]) => {
  const rules = new Map<string, LoanGameTypeRule>()

  platformGameCodes.forEach(code => {
    const [gameTypeCode, platformCode, gameCode] = splitPlatformGameCode(code)
    if (!gameTypeCode) return

    const rule = rules.get(gameTypeCode) ?? { allGames: false, platforms: new Map() }
    rules.set(gameTypeCode, rule)

    if (!platformCode) {
      rule.allGames = true
      return
    }

    if (!gameCode) {
      rule.platforms.set(platformCode, null)
      return
    }

    const gameCodes = rule.platforms.get(platformCode)
    if (gameCodes === null) return

    rule.platforms.set(platformCode, (gameCodes ?? new Set<string>()).add(gameCode))
  })

  return rules
}

const getPlatformRule = (rule: LoanGameTypeRule, node: GameDataItem) => {
  const platformKeys = [normalizeCode(node.platformCode), normalizeCode(node.brandCode)]
  const matchedKey = platformKeys.find(key => key && rule.platforms.has(key))

  return matchedKey === undefined ? undefined : rule.platforms.get(matchedKey)
}

const isAllowedGame = (gameCodes: Set<string>, game: GameDataItem) =>
  [game.itemCode, game.rowId].some(value => gameCodes.has(normalizeCode(value)))

/**
 * 按 platformGameCodes 裁剪游戏树（类型 -> 平台 -> 游戏），返回新的节点，不修改源数据。
 * gameTypeCodes 用于进一步限定类型（例如当前选中的分类）。
 */
export const filterLoanGameSections = (
  gameSections: GameDataItem[],
  platformGameCodes: string[],
  gameTypeCodes: string[]
): GameDataItem[] => {
  const rules = parseLoanGameRules(platformGameCodes)
  const allowedGameTypeCodes = new Set(gameTypeCodes)

  return gameSections.flatMap(section => {
    const gameTypeCode = normalizeCode(section.sysGameTypeCode)
    const rule = rules.get(gameTypeCode)

    if (!rule || !allowedGameTypeCodes.has(gameTypeCode)) return []
    if (rule.allGames) return [section]

    const providers = (section.subGame ?? []).flatMap(provider => {
      const gameCodes = getPlatformRule(rule, provider)

      if (gameCodes === undefined) return []
      if (gameCodes === null) return [provider]

      const games = (provider.subGame ?? []).filter(game => isAllowedGame(gameCodes, game))
      return games.length ? [{ ...provider, subGame: games }] : []
    })

    return providers.length ? [{ ...section, subGame: providers }] : []
  })
}
