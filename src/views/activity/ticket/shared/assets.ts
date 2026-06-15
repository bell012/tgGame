import type { TicketPrize, TicketResultVariant } from './types'

import heroCash from '@/static/img/lucky-spin/modals/hero-cash.png'
import heroNoPrize from '@/static/img/lucky-spin/modals/hero-no-prize.png'
import heroSpinAgain from '@/static/img/lucky-spin/modals/hero-spin-again.png'
import ribbonGift from '@/static/img/lucky-spin/modals/ribbon-gift.png'
import wheelFrame from '@/static/img/lucky-spin/wheel/wheel-frame.png'
import wheelPointerGo from '@/static/img/lucky-spin/wheel/wheel-pointer-go.png'
import wheelSegmentDark from '@/static/img/lucky-spin/wheel/wheel-segment-dark.png'
import wheelSegmentLight from '@/static/img/lucky-spin/wheel/wheel-segment-light.png'
import wheelShadow from '@/static/img/lucky-spin/wheel/wheel-shadow.png'
import wheelSectorHighlight from '@/static/img/lucky-spin/wheel/wheel-sector-highlight.png'
import modalHelpIcon from '@/static/img/lucky-spin/modal-help-icon.svg?url'
import gameCashVoucher from '@/static/img/lucky-spin/vouchers/game-cash-voucher.png'
import gameGoldenEgg from '@/static/img/lucky-spin/vouchers/game-golden-egg.png'
import gameLuckyRedEnvelope from '@/static/img/lucky-spin/vouchers/game-lucky-red-envelope.png'
import gameLuckySpin from '@/static/img/lucky-spin/vouchers/game-lucky-spin.png'
import gameMysteryBox from '@/static/img/lucky-spin/vouchers/game-mystery-box.png'

/** 大转盘现金中奖弹窗 Lottie（public 静态资源，含 images/ 相对路径） */
export const LUCKY_SPIN_CASH_RESULT_LOTTIE = '/lottie/lucky-spin/cash-result/cash-popup.json'

/** 盲盒开箱庆祝 Lottie（结果弹窗 hero 区播放，按 open.json 全长） */
export const MYSTERY_BOX_OPEN_LOTTIE = '/lottie/mystery-box/open/open.json'

export const LUCKY_SPIN_ASSETS = {
  controls: {
    modalHelpIcon
  },
  wheel: {
    frame: wheelFrame,
    pointerGo: wheelPointerGo,
    segmentLight: wheelSegmentLight,
    segmentDark: wheelSegmentDark,
    shadow: wheelShadow,
    sectorHighlight: wheelSectorHighlight
  },
  modals: {
    heroCash,
    heroSpinAgain,
    heroNoPrize,
    ribbonGift
  },
  vouchers: {
    games: {
      golden_egg: gameGoldenEgg,
      mystery_box: gameMysteryBox,
      lucky_spin: gameLuckySpin,
      lucky_red_envelope: gameLuckyRedEnvelope,
      cash_voucher: gameCashVoucher
    }
  }
} as const

export const RESULT_HERO_IMAGES: Record<
  Extract<TicketResultVariant, 'cash' | 'spin_again' | 'no_prize'>,
  string
> = {
  cash: heroCash,
  spin_again: heroSpinAgain,
  no_prize: heroNoPrize
}

export const getGameIcon = (id: string) =>
  LUCKY_SPIN_ASSETS.vouchers.games[id as keyof typeof LUCKY_SPIN_ASSETS.vouchers.games] ??
  gameLuckySpin

export const getPrizeIcon = (prize: Pick<TicketPrize, 'icon'>) => prize.icon ?? ''
