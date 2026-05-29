import cashIcon from '@/static/img/check-in/cash.png'
import giftBoxClosed from '@/static/img/check-in/gift-box-closed.png'
import giftBoxOpened from '@/static/img/check-in/gift-box-open.png'
import giftBoxIcon from '@/static/img/check-in/gift-box.png'
import goldenEggIcon from '@/static/img/check-in/golden-egg.png'
import checkInCloseButton from '@/static/img/check-in/popup-close.png'
import checkInRulesButton from '@/static/img/check-in/popup-rules.png'
import redPacketIcon from '@/static/img/check-in/red-packet.png'
import turntableIcon from '@/static/img/check-in/roulette.png'
import type { CSSProperties } from 'vue'

export type CheckInPageMode = 'mobile' | 'pc'

export interface CheckInRewardItem {
  day: number
  amount: string
  icon: string
  claimed?: boolean
  spanFull?: boolean
  cardStyle: CSSProperties
  iconShellStyle: CSSProperties
  amountStyle: CSSProperties
}

export interface CheckInHeroAmountReward {
  type: 'amount'
  amount: string
  icon: string
}

export interface CheckInHeroActionReward {
  type: 'action'
  titleKey: string
  icon: string
  actionKey: string
}

export type CheckInHeroReward = CheckInHeroAmountReward | CheckInHeroActionReward

// 生成奖励卡片的渐变背景、边框和阴影样式。
const createCardStyle = (
  startColor: string,
  endColor: string,
  borderColor: string
): CSSProperties => ({
  background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
  borderColor,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 12px 24px rgba(0, 0, 0, 0.14)'
})

// 生成奖励图标容器的渐变背景样式。
const createIconShellStyle = (startColor: string, endColor: string): CSSProperties => ({
  background: `linear-gradient(180deg, ${startColor} 0%, ${endColor} 100%)`,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25)'
})

// 生成奖励金额文字样式。
const createAmountStyle = (color: string): CSSProperties => ({
  color,
  textShadow: '0 1px 6px rgba(0, 0, 0, 0.18)'
})

// 签到按钮和主视觉素材。
export const CHECK_IN_CLOSE_BUTTON = checkInCloseButton
export const CHECK_IN_RULES_BUTTON = checkInRulesButton
export const CHECK_IN_HERO_CLOSED = giftBoxClosed
export const CHECK_IN_HERO_OPENED = giftBoxOpened

// 签到按钮占位状态，后续由接口状态替换。
export const CHECK_IN_CAN_CLAIM = false

// 主视觉区领取结果占位数据：
// 0 条 = 未签到，1 条 = 单奖励，2 条 = 双奖励。
export const CHECK_IN_RECEIVED_REWARDS: CheckInHeroReward[] = [
  {
    type: 'amount',
    amount: '100.00',
    icon: cashIcon
  },
  {
    type: 'action',
    titleKey: 'checkIn.luckySpinReward',
    icon: goldenEggIcon,
    actionKey: 'checkIn.useNow'
  }
]

// 签到活动截止时间占位文案。
export const CHECK_IN_PROMO_ENDS_AT = '12/18/2026 11:14:15 AM'

// 签到奖励占位数据，后续可直接替换为接口返回值。
export const CHECK_IN_REWARDS: CheckInRewardItem[] = [
  {
    day: 1,
    amount: '100',
    icon: giftBoxIcon,
    claimed: true,
    cardStyle: createCardStyle(
      'rgba(255, 192, 94, 0.42)',
      'rgba(141, 77, 0, 0.28)',
      'rgba(255, 214, 132, 0.45)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 232, 142, 0.96)', 'rgba(255, 183, 38, 0.96)'),
    amountStyle: createAmountStyle('#fff09e')
  },
  {
    day: 2,
    amount: '0',
    icon: cashIcon,
    cardStyle: createCardStyle(
      'rgba(62, 210, 114, 0.4)',
      'rgba(14, 96, 37, 0.24)',
      'rgba(100, 235, 145, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(128, 243, 145, 0.96)', 'rgba(0, 198, 16, 0.96)'),
    amountStyle: createAmountStyle('#d9ff95')
  },
  {
    day: 3,
    amount: '300~800',
    icon: turntableIcon,
    cardStyle: createCardStyle(
      'rgba(192, 116, 255, 0.38)',
      'rgba(86, 7, 129, 0.26)',
      'rgba(222, 153, 255, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(208, 137, 255, 0.96)', 'rgba(178, 21, 255, 0.96)'),
    amountStyle: createAmountStyle('#ffe88d')
  },
  {
    day: 4,
    amount: '5K~10K',
    icon: redPacketIcon,
    cardStyle: createCardStyle(
      'rgba(255, 121, 121, 0.36)',
      'rgba(126, 0, 0, 0.24)',
      'rgba(255, 166, 166, 0.4)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 138, 138, 0.96)', 'rgba(255, 46, 46, 0.96)'),
    amountStyle: createAmountStyle('#ffe88d')
  },
  {
    day: 5,
    amount: '800',
    icon: goldenEggIcon,
    cardStyle: createCardStyle(
      'rgba(72, 201, 176, 0.34)',
      'rgba(6, 82, 64, 0.24)',
      'rgba(126, 245, 225, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(141, 255, 237, 0.96)', 'rgba(13, 182, 151, 0.96)'),
    amountStyle: createAmountStyle('#f0ff98')
  },
  {
    day: 6,
    amount: '1000',
    icon: goldenEggIcon,
    cardStyle: createCardStyle(
      'rgba(255, 179, 109, 0.36)',
      'rgba(130, 61, 0, 0.24)',
      'rgba(255, 202, 143, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 212, 138, 0.96)', 'rgba(255, 142, 0, 0.96)'),
    amountStyle: createAmountStyle('#fff3a8')
  },
  {
    day: 7,
    amount: '1500',
    icon: goldenEggIcon,
    spanFull: true,
    cardStyle: createCardStyle(
      'rgba(255, 218, 127, 0.28)',
      'rgba(38, 24, 0, 0.32)',
      'rgba(255, 231, 173, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 241, 181, 0.96)', 'rgba(255, 191, 64, 0.96)'),
    amountStyle: createAmountStyle('#fff1ab')
  }
]
