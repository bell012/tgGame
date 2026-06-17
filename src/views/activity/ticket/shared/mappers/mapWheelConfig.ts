import type { UseTicketResult, WheelConfigItem } from '@/api/interface/activity'
import i18n from '@/i18n'
import { getCurrencySymbol } from '@/utils/locale'
import { WHEEL_SEGMENT_COUNT } from '../constants'
import type { TicketPrize, TicketSpinResult, TicketResultVariant, PrizeType } from '../types'

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

const mapWheelConfigItem = (item: WheelConfigItem, index: number): TicketPrize => {
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
export const mapWheelConfigToPrizes = (wheelConfig?: WheelConfigItem[] | null): TicketPrize[] => {
  if (!Array.isArray(wheelConfig) || wheelConfig.length === 0) {
    return []
  }

  return wheelConfig.slice(0, WHEEL_SEGMENT_COUNT).map(mapWheelConfigItem)
}

/** 根据 use 接口返回在 wheelConfig 中定位中奖格下标 */
export const findPrizeIndexInWheelConfig = (
  wheelConfig: WheelConfigItem[] | null | undefined,
  rewardType: number,
  rewardAmount?: number
): number => {
  if (!Array.isArray(wheelConfig) || wheelConfig.length === 0) {
    return -1
  }

  const slice = wheelConfig.slice(0, WHEEL_SEGMENT_COUNT)

  if (rewardType === 0) {
    const amount = Number(rewardAmount ?? 0)
    return slice.findIndex(
      item => Number(item.rewardType) === 0 && Number(item.amount ?? 0) === amount
    )
  }

  return slice.findIndex(item => Number(item.rewardType) === rewardType)
}

/** use 接口结果 + wheelConfig → TicketSpinResult */
export const buildTicketSpinResultFromUse = (
  wheelConfig: WheelConfigItem[] | null | undefined,
  rewardType?: number,
  rewardAmount?: number
): TicketSpinResult | null => {
  const type = Number(rewardType ?? 2)
  const prizeIndex = findPrizeIndexInWheelConfig(wheelConfig, type, rewardAmount)

  if (prizeIndex < 0) {
    return null
  }

  const prizes = mapWheelConfigToPrizes(wheelConfig)
  const prize = prizes[prizeIndex]

  if (!prize) {
    return null
  }

  if (type === 0) {
    const amount = Number(rewardAmount ?? 0)
    return {
      prizeIndex,
      prize: {
        ...prize,
        amount,
        label: buildPrizeLabel(0, amount)
      }
    }
  }

  return { prizeIndex, prize }
}

/** use 接口结果 → 结果弹窗参数（不依赖 wheelConfig / mock） */
export const buildResultDialogFromUse = (
  result: UseTicketResult
): { variant: TicketResultVariant; highlightText: string } => {
  const rewardType = Number(result.rewardType ?? 2)

  if (rewardType === 0) {
    return {
      variant: 'cash',
      highlightText: `${getCurrencySymbol()}${Number(result.rewardAmount ?? 0)}`
    }
  }

  if (rewardType === 1) {
    return {
      variant: 'spin_again',
      highlightText: i18n.global.t('luckySpinPage.result.spinAgain')
    }
  }

  return {
    variant: 'no_prize',
    highlightText: i18n.global.t('luckySpinPage.result.noPrize')
  }
}

/** 非大转盘玩法（无 rewardType）：仅依据 rewardAmount 判断中奖 → 结果弹窗参数 */
export const buildResultDialogFromAmount = (
  result: UseTicketResult
): { variant: TicketResultVariant; highlightText: string } => {
  const amount = Number(result.rewardAmount ?? result.amount ?? 0)

  if (amount > 0) {
    return {
      variant: 'cash',
      highlightText: `${getCurrencySymbol()}${amount}`
    }
  }

  return {
    variant: 'no_prize',
    highlightText: i18n.global.t('luckySpinPage.result.noPrize')
  }
}
