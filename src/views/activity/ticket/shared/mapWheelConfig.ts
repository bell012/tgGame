import type { WheelConfigItem } from '@/api/interface/activity'
import i18n from '@/i18n'
import { getCurrencySymbol } from '@/utils/locale'
import { WHEEL_SEGMENT_COUNT } from './constants'
import type { LuckySpinPrize, PrizeType } from './types'

const ABSOLUTE_IMAGE_URL_PATTERN = /^(data:|blob:|https?:\/\/|\/)/i

const normalizeText = (value: unknown) => String(value ?? '').trim()

/** 相对路径拼接 CDN base，与 mapTicketMarquee 一致 */
export const resolveWheelImageUrl = (rawImageUrl: unknown): string => {
  const path = normalizeText(rawImageUrl)

  if (!path) {
    return ''
  }

  if (ABSOLUTE_IMAGE_URL_PATTERN.test(path)) {
    return path
  }

  const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  return baseUrl ? `${baseUrl}/${path.replace(/^\/+/, '')}` : path
}

const mapRewardTypeToPrizeType = (rewardType: number): PrizeType => {
  if (rewardType === 0) return 'cash'
  if (rewardType === 1) return 'spin_again'
  return 'no_prize'
}

const buildPrizeLabel = (rewardType: number, amount?: number): string => {
  if (rewardType === 0) {
    const value = Number(amount ?? 0)
    return `${getCurrencySymbol()}${value}`
  }

  if (rewardType === 1) {
    return i18n.global.t('luckySpinPage.result.spinAgain')
  }

  return i18n.global.t('luckySpinPage.result.noPrize')
}

const mapWheelConfigItem = (item: WheelConfigItem, index: number): LuckySpinPrize => {
  const rewardType = Number(item.rewardType ?? 2)
  const type = mapRewardTypeToPrizeType(rewardType)

  return {
    index,
    type,
    label: buildPrizeLabel(rewardType, item.amount),
    icon: resolveWheelImageUrl(item.imageUrl),
    ...(rewardType === 0 ? { amount: Number(item.amount ?? 0) } : {})
  }
}

/** mbTicketList.wheelConfig → 转盘 8 格奖品（保持接口数组顺序） */
export const mapWheelConfigToPrizes = (
  wheelConfig?: WheelConfigItem[] | null
): LuckySpinPrize[] => {
  if (!Array.isArray(wheelConfig) || wheelConfig.length === 0) {
    return []
  }

  return wheelConfig.slice(0, WHEEL_SEGMENT_COUNT).map(mapWheelConfigItem)
}
