import Api from '@/api'
import type { GlobalDicResponse } from '@/api/interface/game'
import type { GameDataItem } from '@/api/interface/game'
import { getLanguageCode } from '@/utils/locale'

export const GLOBAL_DIC_STORAGE_KEY = 'globalDic'
const GAME_DATA_STORAGE_KEY = 'gameData'

type GlobalDicItem = GlobalDicResponse['result'][number]
type PlatformItem = {
  platformCode: string
  platformName: string
}

/**
 * 局字典查询值。
 */
const normalizeGlobalDicValue = (value: unknown) => String(value ?? '').trim()

/**
 * 从本地缓存中读取游戏列表数据。
 */
const readGameDataCache = (): GameDataItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const rawValue = window.localStorage.getItem(GAME_DATA_STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    return Array.isArray(parsedValue) ? (parsedValue as GameDataItem[]) : []
  } catch (error) {
    console.error(error)
    return []
  }
}

/**
 * 将游戏图片相对路径转换成完整图片地址。
 */
const resolveGameImageUrl = (value: unknown) => {
  const normalizedValue = normalizeGlobalDicValue(value)
  return normalizedValue ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${normalizedValue}` : ''
}

/**
 * 从本地缓存中读取全局多语言字典。
 */
export const readGlobalDicCache = (): GlobalDicItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const rawValue = window.localStorage.getItem(GLOBAL_DIC_STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    return Array.isArray(parsedValue) ? (parsedValue as GlobalDicItem[]) : []
  } catch (error) {
    console.error('readGlobalDicCache failed', error)
    return []
  }
}

/**
 * 将全局多语言字典写入本地缓存。
 */
export const saveGlobalDicCache = (items: GlobalDicItem[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(GLOBAL_DIC_STORAGE_KEY, JSON.stringify(items))
}

/**
 * 应用启动时拉取全局多语言字典，并缓存到 localStorage 中。
 */
export const initGlobalDicCache = async () => {
  try {
    const response = await Api.game.getGlobalDic({})
    const result = Array.isArray(response?.result) ? response.result : []
    saveGlobalDicCache(result)
    return result
  } catch (error) {
    console.error('initGlobalDicCache failed', error)
    return readGlobalDicCache()
  }
}

/**
 * 获取游戏名字。
 */
export const getGameName = (gameCode: unknown, platformCode: unknown, languageCode?: string) => {
  const normalizedGameCode = normalizeGlobalDicValue(gameCode)
  const normalizedPlatformCode = normalizeGlobalDicValue(platformCode)
  const normalizedLanguageCode = getLanguageCode(languageCode)

  if (!normalizedGameCode || !normalizedPlatformCode) {
    return ''
  }

  const matchedItem = readGlobalDicCache().find(item => {
    return (
      normalizeGlobalDicValue(item.language_code) === normalizedLanguageCode &&
      normalizeGlobalDicValue(item.dic_name) === normalizedGameCode &&
      normalizeGlobalDicValue(item.dic_key) === normalizedPlatformCode
    )
  })

  return normalizeGlobalDicValue(matchedItem?.dic_value)
}

/**
 * 获取游戏图片。
 */
export const getGameImage = (platformCode: unknown, gameCode: unknown) => {
  const normalizedPlatformCode = normalizeGlobalDicValue(platformCode)
  const normalizedGameCode = normalizeGlobalDicValue(gameCode)

  if (!normalizedPlatformCode || !normalizedGameCode) {
    return ''
  }

  const matchedGame = readGameDataCache()
    .flatMap(section => (Array.isArray(section?.subGame) ? section.subGame : []))
    .flatMap(provider => (Array.isArray(provider?.subGame) ? provider.subGame : []))
    .find(game => {
      return (
        normalizeGlobalDicValue(game?.platformCode) === normalizedPlatformCode &&
        normalizeGlobalDicValue(game?.itemCode) === normalizedGameCode
      )
    })

  return resolveGameImageUrl(matchedGame?.icon2)
}

/**
 * 获取平台列表。
 */
export const getPlatformList = (): PlatformItem[] => {
  const platformMap = new Map<string, PlatformItem>()

  readGameDataCache().forEach(section => {
    const providerList = Array.isArray(section?.subGame) ? section.subGame : []
    providerList.forEach(provider => {
      const platformCode = normalizeGlobalDicValue(provider?.platformCode)
      const platformName = normalizeGlobalDicValue(provider?.platformName)

      if (platformCode) {
        platformMap.set(platformCode, {
          platformCode,
          platformName: platformName || platformCode
        })
      }
    })
  })

  return [...platformMap.values()]
}

/**
 * 获取平台名称。
 */
export const getPlatformName = (platformCode: unknown, languageCode?: string) => {
  return getGameName('platform_code', platformCode, languageCode)
}
