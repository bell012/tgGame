import type {
  LuckySpinInfoResult,
  LuckySpinPrize,
  LuckySpinResult
} from '@/views/activity/ticket/types'
import { getGameIcon } from '@/views/activity/ticket/constants'

import prizeCash1 from '@/static/img/lucky-spin/prizes/prize-cash-1.png'
import prizeCash2 from '@/static/img/lucky-spin/prizes/prize-cash-2.png'
import prizeCash3 from '@/static/img/lucky-spin/prizes/prize-cash-3.png'
import prizeCoin1 from '@/static/img/lucky-spin/prizes/prize-coin-1.png'
import prizeNoPrize from '@/static/img/lucky-spin/prizes/prize-no-prize.png'
import prizeSpinAgain from '@/static/img/lucky-spin/prizes/prize-spin-again.png'
import prizeVoucher from '@/static/img/lucky-spin/prizes/prize-voucher.png'

/** Mock 仅模拟后端返回结构：icon / label 均为接口字段（顺序对齐设计稿 12 点顺时针） */
const DEFAULT_PRIZES: LuckySpinPrize[] = [
  { index: 0, type: 'voucher', label: 'Voucher', voucherType: 'golden_egg', icon: prizeVoucher },
  { index: 1, type: 'cash', label: '₱50', amount: 50, icon: prizeCash1 },
  { index: 2, type: 'cash', label: '₱28', amount: 28, icon: prizeCash1 },
  { index: 3, type: 'cash', label: '₱88', amount: 88, icon: prizeCash2 },
  { index: 4, type: 'no_prize', label: 'No Prize', icon: prizeNoPrize },
  { index: 5, type: 'cash', label: '₱18', amount: 18, icon: prizeCash3 },
  { index: 6, type: 'spin_again', label: 'Spin Again', icon: prizeSpinAgain },
  { index: 7, type: 'cash', label: '888P', amount: 888, icon: prizeCoin1 }
]

export const createMockLuckySpinInfo = (): LuckySpinInfoResult => ({
  endTime: Date.now() + 3 * 60 * 60 * 1000 + 22 * 60 * 1000 + 59 * 1000,
  maxPrizeText: '₱888',
  remainingSpins: 3,
  totalVouchers: 8,
  prizes: DEFAULT_PRIZES,
  tasks: [
    {
      id: 'bet-100',
      title: 'Total Bet > ₱100',
      progress: 50,
      finished: false,
      actionType: 'bet'
    },
    {
      id: 'deposit-100',
      title: 'Total Deposit > ₱100',
      progress: 100,
      finished: true,
      actionType: 'deposit'
    }
  ],
  recentVouchers: [],
  winnerRecords: [
    { id: 'w1', avatar: '', username: 'yuyt***9', prizeText: '₱188' },
    { id: 'w2', avatar: '', username: 'jack***2', prizeText: '₱88' },
    { id: 'w3', avatar: '', username: 'lisa***7', prizeText: '₱288' },
    { id: 'w4', avatar: '', username: 'mike***1', prizeText: '₱28' }
  ],
  voucherGames: [
    {
      id: 'mock-golden-egg',
      gameId: 'golden_egg',
      label: 'Golden Egg',
      icon: getGameIcon('golden_egg')
    },
    {
      id: 'mock-mystery-box',
      gameId: 'mystery_box',
      label: 'Mystery Box',
      icon: getGameIcon('mystery_box')
    },
    {
      id: 'mock-lucky-spin',
      gameId: 'lucky_spin',
      label: 'Lucky Spin',
      icon: getGameIcon('lucky_spin')
    },
    {
      id: 'mock-lucky-red-envelope',
      gameId: 'lucky_red_envelope',
      label: 'Red Envelope',
      icon: getGameIcon('lucky_red_envelope')
    },
    {
      id: 'mock-cash-voucher',
      gameId: 'cash_voucher',
      label: 'Cash Voucher',
      icon: getGameIcon('cash_voucher')
    }
  ],
  rules: [
    'Promotion period and cash prize limits apply as stated on the platform.',
    'Rewards are automatically credited to your account balance.',
    'Vouchers expire according to the date shown on each voucher.',
    'Multi-account abuse is prohibited and may result in forfeiture.',
    'The platform reserves the right of final interpretation.'
  ]
})

let mockRemainingSpins = 3

export const resetMockSpins = (count = 3) => {
  mockRemainingSpins = count
}

export const mockDoLuckySpin = (): LuckySpinResult => {
  const info = createMockLuckySpinInfo()
  const prizeIndex = Math.floor(Math.random() * info.prizes.length)
  const prize = info.prizes[prizeIndex]!

  if (mockRemainingSpins > 0) {
    mockRemainingSpins -= 1
  }

  if (prize.type === 'voucher') {
    return {
      prizeIndex,
      prize,
      vouchers: [
        {
          id: `v-${Date.now()}`,
          type: prize.voucherType ?? 'golden_egg',
          title: 'Golden Egg Voucher',
          rewardText: 'Win up to ₱888',
          expiresAt: '12/18/2026 11:14 AM'
        }
      ]
    }
  }

  if (prize.type === 'spin_again') {
    mockRemainingSpins += 1
  }

  return { prizeIndex, prize }
}

export const getMockRemainingSpins = () => mockRemainingSpins
